"use client";
import React, { useEffect, useState, forwardRef, useRef } from "react";
import { useDataContext } from "@/context/DataContext";
import { useSpriteSheetDoc } from "@/hooks/useSpriteSheetDoc";
import { parseTrinkets } from "@/utils/trinkets";

export type SVGComponentProps = ReturnType<typeof parseTrinkets> & {
  use?: string;
};

interface ParsedSymbol {
  id: string;
  viewBox: string;
  inner: string;
}

const SVGComponent = forwardRef<HTMLDivElement, SVGComponentProps>(
  ({ id, name, style, type, callback, size, use }, ref) => {
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

      const ids = Array.isArray(name)
        ? [...name, `${name[0]}--collision`]
        : [name, `${name}--collision`];

      const parsed = ids
        .map(parseSymbol)
        .filter((s): s is ParsedSymbol => Boolean(s));
      setSvgSymbols(parsed);
    }, [doc, name]);

    return (
      <div className="trinket" ref={ref} data-body-ready="false">
        {/* Only render SVGs when ready */}
        {doc &&
          svgSymbols.length > 0 &&
          svgSymbols.map((symbol, i) => {
            const isCollision = symbol.id.endsWith("--collision");
            return (
              <svg
                key={symbol.id}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={symbol.viewBox}
                data-id={symbol.id}
                id={symbol.id}
                data-collision={isCollision ? "true" : undefined}
                style={{
                  zIndex: svgSymbols.length - i,
                  display: i !== 0 ? "none" : "initial",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                <g
                  dangerouslySetInnerHTML={{ __html: symbol.inner }}
                  style={{ pointerEvents: "all", cursor: "pointer" }}
                />
              </svg>
            );
          })}
      </div>
    );
  }
);

SVGComponent.displayName = "SVGComponent";
export default SVGComponent;
