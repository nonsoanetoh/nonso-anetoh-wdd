"use client";

import React from "react";
import { RichTextField } from "@prismicio/client";
import {
  JSXMapSerializer,
  PrismicRichText,
  PrismicLink,
} from "@prismicio/react";
import CodeBlock from "../codeblock";

export const richTextComponents: JSXMapSerializer = {
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
  heading1: ({ children }) => <h1>{children}</h1>,
  heading2: ({ node, children }) => {
    const text = node.text;
    const match = text?.match(/##section--(.+?)\*\*(.+?)##/);

    if (match) {
      const id = match[1];
      const label = match[2];
      const newText = text.replace(/##section--(.+?)\*\*(.+?)##\s*/, "");
      return (
        <h2 id={id} data-jump={label}>
          {newText}
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
    const text = node.text;
    const match = text?.match(/##section--(.+?)\*\*(.+?)##/);

    if (match) {
      const id = match[1];
      const label = match[2];
      const newText = text.replace(/##section--(.+?)\*\*(.+?)##\s*/, "");
      return (
        <p id={id} data-jump={label}>
          {newText}
        </p>
      );
    }

    return <p>{children}</p>;
  },
  hyperlink: ({ node, children }) => {
    return <PrismicLink field={node.data}>{children}</PrismicLink>;
  },

  preformatted: ({ node }) => {
    return <CodeBlock code={node.text} />;
  },
};

interface RichTextProps {
  field: RichTextField;
}

export const RichTextComponent = ({ field }: RichTextProps) => {
  return <PrismicRichText field={field} components={richTextComponents} />;
};
