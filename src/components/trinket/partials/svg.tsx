"use client";
import React, { useEffect, useState, useMemo, memo } from "react";
import { useDataContext } from "@/context/DataContext";
import { useSpriteSheetDoc } from "@/hooks/useSpriteSheetDoc";

export type SVGComponentProps = {
  id: string;
  name: string;
  type: "static" | "interactive";
};

interface ParsedSymbol {
  id: string;
  viewBox: string;
  inner: string;
}

const SVGComponent: React.FC<SVGComponentProps> = ({ id, name, type }) => {
  const { spriteData } = useDataContext();
  const doc = useSpriteSheetDoc(spriteData.spriteSheet);
  const [svgSymbols, setSvgSymbols] = useState<ParsedSymbol[]>([]);

  useEffect(() => {
    if (!doc) return;

    const parseSymbol = (symId: string): ParsedSymbol | null => {
      const sym = doc.getElementById(symId);
      if (!sym) return null;

      const viewBox = sym.getAttribute("viewBox") || "0 0 24 24";

      const serialize = (node: Element): string => {
        if (node.tagName.toLowerCase() === "use") {
          const refAttr =
            node.getAttribute("href") || node.getAttribute("xlink:href");
          if (refAttr) {
            const target = doc.getElementById(refAttr.replace("#", ""));
            if (target) {
              return Array.from(target.childNodes)
                .filter(
                  (n: Node): n is Element => n.nodeType === Node.ELEMENT_NODE
                )
                .map(serialize)
                .join("");
            }
          }
          return "";
        }
        return node.outerHTML;
      };

      const inner = Array.from(sym.childNodes)
        .filter((n): n is Element => n.nodeType === Node.ELEMENT_NODE)
        .map(serialize)
        .join("");

      return { id: symId, viewBox, inner };
    };

    const parsed = parseSymbol(name);
    setSvgSymbols(parsed ? [parsed] : []);
  }, [doc, name]);

  const svgStyle = useMemo(() => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
  }), []);

  const gStyle = useMemo(() => ({
    pointerEvents: "all" as const,
    cursor: "pointer" as const,
  }), []);

  if (!doc || svgSymbols.length === 0) return null;

  const symbol = svgSymbols[0];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={symbol.viewBox}
      style={svgStyle}
      aria-hidden="true"
    >
      <g
        dangerouslySetInnerHTML={{ __html: symbol.inner }}
        style={gStyle}
      />
    </svg>
  );
};

SVGComponent.displayName = "SVGComponent";
export default memo(SVGComponent);