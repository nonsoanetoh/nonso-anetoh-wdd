/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import * as prismic from "@prismicio/client";

const {
  PRISMIC_REPO_NAME: repoName,
  PRISMIC_ACCESS_TOKEN: accessToken,
  PRISMIC_CUSTOM_TYPES_API_TOKEN: ctToken,
} = process.env!;

if (!repoName || !accessToken || !ctToken) {
  throw new Error(
    "Missing PRISMIC_REPO_NAME, PRISMIC_ACCESS_TOKEN or PRISMIC_CUSTOM_TYPES_API_TOKEN"
  );
}

const client = prismic.createClient(repoName, { accessToken });
const CT_BASE = "https://customtypes.prismic.io";

/**
 * Fetches the SVG at `url` and returns all <symbol id="..."> values.
 */
async function extractSymbolIdsFromSvgUrl(url: string): Promise<string[]> {
  const res = await fetch(url);
  const svgText = await res.text();
  const ids = new Set<string>();
  const regex = /<symbol[^>]*\sid=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(svgText))) {
    ids.add(match[1]);
  }
  return Array.from(ids);
}

export async function POST(request: NextRequest) {
  console.log("📬 /api/spritesheet _ webhook received");

  // 0. Only proceed if the changed doc is type "spritesheet"
  const payload = await request.json().catch(() => ({}));
  const docs = Array.isArray((payload as any).documents)
    ? (payload as any).documents
    : [];
  if (!docs.length) {
    console.log("⚠️ No documents in payload; skipping.");
    return NextResponse.json({ ok: true });
  }
  const docId = (docs as string[])[0];
  let changed: any;
  try {
    changed = await client.getByID(docId);
  } catch {
    console.warn(`⚠️ Could not fetch changed doc "${docId}", skipping.`);
    return NextResponse.json({ ok: true });
  }
  if (changed.type !== "spritesheet") {
    console.log(`ℹ️ Ignored webhook for type "${changed.type}"`);
    return NextResponse.json({ ok: true });
  }

  try {
    // 1. Fetch the spritesheet to get its media URL
    const sheet = await client.getSingle("spritesheet");
    const svgUrl = sheet.data.media_spritesheet.url as string;
    console.log("🎞️ spritesheet URL:", svgUrl);

    // 2. If it's not an SVG, abort
    if (!svgUrl.toLowerCase().endsWith(".svg")) {
      console.log("⚠️ Media is not an SVG; no updates performed.");
      return NextResponse.json({
        ok: true,
        reason: "media-not-svg",
        url: svgUrl,
      });
    }

    // 3. Extract symbol IDs
    const options = await extractSymbolIdsFromSvgUrl(svgUrl);
    console.log("⚙️ Extracted symbol IDs:", options);

    // 4. List all shared slices
    const listRes = await fetch(`${CT_BASE}/slices`, {
      method: "GET",
      headers: {
        repository: repoName!,
        Authorization: `Bearer ${ctToken}`,
      },
    });
    if (!listRes.ok)
      throw new Error(`Failed to list slices: ${listRes.status}`);
    const listJson: any = await listRes.json();
    const sliceList: Array<{ id: string }> = Array.isArray(listJson.results)
      ? listJson.results
      : listJson;

    console.log(`🔍 Found ${sliceList.length} shared slice(s)`);

    const updated: string[] = [];

    // 5. For each slice, replace its primary.trinkets options
    for (const { id: sliceId } of sliceList) {
      const fetchRes = await fetch(`${CT_BASE}/slices/${sliceId}`, {
        method: "GET",
        headers: {
          repository: repoName!,
          Authorization: `Bearer ${ctToken}`,
        },
      });
      if (!fetchRes.ok) {
        console.warn(
          `⚠️ Couldn’t fetch slice "${sliceId}": ${fetchRes.status}`
        );
        continue;
      }
      const sliceDef: any = await fetchRes.json();
      if (!Array.isArray(sliceDef.variations)) continue;

      let mutated = false;
      for (const variation of sliceDef.variations) {
        const group = variation.primary?.trinkets;
        const field = group?.config?.fields?.trinket;
        if (
          group?.type === "Group" &&
          field?.type === "Select" &&
          Array.isArray(field.config.options)
        ) {
          field.config.options = [...options];
          mutated = true;
          console.log(
            `🔄 Replaced options on slice "${sliceId}", variation "${variation.id}"`
          );
        }
      }

      if (mutated) {
        const updateRes = await fetch(`${CT_BASE}/slices/update`, {
          method: "POST",
          headers: {
            repository: repoName!,
            Authorization: `Bearer ${ctToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sliceDef),
        });
        if (updateRes.ok) {
          updated.push(sliceId);
          console.log(`✅ Updated slice "${sliceId}"`);
        } else {
          console.error(
            `❌ Failed to update "${sliceId}":`,
            await updateRes.text()
          );
        }
      }
    }

    // 6. Respond with new options and which slices were updated
    return NextResponse.json(
      {
        trinketOptions: options,
        updatedSlices: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ /api/spritesheet error:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
