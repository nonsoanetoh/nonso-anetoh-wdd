// utils/svg/loadSpriteDefs.ts
export type SpriteSymbolDef = {
  id: string;
  viewBox: { minX: number; minY: number; w: number; h: number };
  collisionPathD: string;
};

export async function loadSpriteDefs(
  src: string
): Promise<Map<string, SpriteSymbolDef>> {
  const xml = await fetch(src, { cache: "force-cache" }).then((r) => r.text());
  const doc = new DOMParser().parseFromString(xml, "image/svg+xml");

  const parseVB = (el: Element) => {
    const vb = (el.getAttribute("viewBox") || "0 0 0 0")
      .trim()
      .split(/\s+/)
      .map(Number);
    const [minX, minY, w, h] = vb.length === 4 ? vb : [0, 0, 0, 0];
    return { minX, minY, w, h };
  };

  const map = new Map<string, SpriteSymbolDef>();
  for (const sym of Array.from(doc.querySelectorAll("symbol"))) {
    const id = sym.getAttribute("id") || "";
    if (!id) continue;
    const viewBox = parseVB(sym);
    const path =
      sym.querySelector('path[data-collision="true"]') ||
      sym.querySelector("path");
    if (!path) continue;
    const d = path.getAttribute("d") || "";
    if (!d) continue;
    map.set(id, { id, viewBox, collisionPathD: d });
  }
  return map;
}
