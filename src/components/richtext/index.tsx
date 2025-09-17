"use client";

import React from "react";
import { RichTextField } from "@prismicio/client";
import {
  JSXMapSerializer,
  PrismicRichText,
  PrismicLink,
} from "@prismicio/react";
import CodeBlock from "../codeblock";
import { PrismicNextImage } from "@prismicio/next";

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function renderInlineSpansWithAnchors(text: string) {
  const pattern = /\(\((.*?)\)\)/g; // <- accepts empty markers (())
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i += 2) {
    const first = matches[i];
    if (!first) break;

    const firstStart = first.index!;
    const firstEnd = firstStart + first[0].length;
    const firstTextRaw = first[1].trim(); // pre-slug, for data-skip fallback
    const id = slugify(firstTextRaw || "x"); // guard if somehow empty

    // push text before the first marker
    if (cursor < firstStart) parts.push(text.slice(cursor, firstStart));

    const second = matches[i + 1];

    if (second) {
      // Paired: wrap BETWEEN markers
      const secondStart = second.index!;
      const secondEnd = secondStart + second[0].length;
      const secondTextRaw = second[1].trim(); // can be empty for (())

      const visible = text.slice(firstEnd, secondStart);
      const dataSkip = secondTextRaw || firstTextRaw; // empty (()) -> use first marker raw

      parts.push(
        <a key={`${id}-${i}`} id={id} href={`#${id}`} data-skip={dataSkip}>
          {visible}
        </a>
      );

      cursor = secondEnd;
    } else {
      // Unpaired: wrap to END
      const visible = text.slice(firstEnd);
      const dataSkip = firstTextRaw;

      parts.push(
        <a key={`${id}-${i}`} id={id} href={`#${id}`} data-skip={dataSkip}>
          {visible}
        </a>
      );

      cursor = text.length;
    }
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export const richTextComponents: JSXMapSerializer = {
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
  heading1: ({ children }) => <h1>{children}</h1>,
  heading2: ({ node, children }) => {
    const text = node.text ?? "";

    // Collect all (( ... )) markers in order
    const markers = [...text.matchAll(/\(\((.+?)\)\)/g)];
    if (markers.length >= 1) {
      const first = markers[0][1].trim();
      const second = markers.length >= 2 ? markers[1][1].trim() : null;

      const id = slugify(first);
      const label = second || first;

      const newText = text.replace(/\(\((.+?)\)\)/g, "").trim();

      return (
        <h2 id={id} data-skip={label}>
          {newText || children}
        </h2>
      );
    }

    return <h2>{children}</h2>;
  },
  heading3: ({ node, children }) => {
    const text = node.text;
    const match = text?.match(/##section--(.+?)\*\*(.+?)##/);

    if (match) {
      const id = match[1];
      const label = match[2];
      const newText = text.replace(/##section--(.+?)\*\*(.+?)##\s*/, "");
      return (
        <h3 id={id} data-jump={label}>
          {newText}
        </h3>
      );
    }

    return <h3>{children}</h3>;
  },
  paragraph: ({ node, children }) => {
    const text = node.text ?? "";
    return /\(\((.*?)\)\)/.test(text) ? (
      <p>{renderInlineSpansWithAnchors(text)}</p>
    ) : (
      <p>{children}</p>
    );
  },
  hyperlink: ({ node, children }) => {
    return <PrismicLink field={node.data}>{children}</PrismicLink>;
  },
  preformatted: ({ node }) => {
    return <CodeBlock code={node.text} />;
  },
  image: ({ node }) => {
    return (
      <figure className="image-wrapper">
        <span className="image-label">{node.alt}</span>
        <PrismicNextImage
          field={node}
          priority
          sizes="(max-width: 600px) 100vw, 50vw"
        />
      </figure>
    );
  },
};

interface RichTextProps {
  field: RichTextField;
}

export const RichTextComponent = ({ field }: RichTextProps) => {
  return <PrismicRichText field={field} components={richTextComponents} />;
};
