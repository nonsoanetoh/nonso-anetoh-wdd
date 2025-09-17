import { useEffect, useState } from "react";

type TrinketRef = {
  id: string | number;
  ref: React.RefObject<HTMLElement | null>;
};

type TrinketPath = {
  id: string | number;
  d: string | null;
};

export function useTrinketPaths(trinketRefs: TrinketRef[]): TrinketPath[] {
  const [paths, setPaths] = useState<TrinketPath[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const result: TrinketPath[] = trinketRefs.map(({ id, ref }) => {
        if (!ref.current) return { id, d: null };

        const svgChildren = Array.from(ref.current.children).filter(
          (el) => el.tagName.toLowerCase() === "svg"
        ) as SVGSVGElement[];

        if (svgChildren.length === 0) {
          console.warn(`No <svg> found for trinket ${id}`);
          return { id, d: null };
        }

        const lastSvg = svgChildren[svgChildren.length - 1];
        const paths = lastSvg.querySelectorAll("path");

        if (paths.length === 0) {
          console.warn(`No <path> found in last <svg> for trinket ${id}`);
          return { id, d: null };
        }

        const lastPath = paths[paths.length - 1];
        const d = lastPath.getAttribute("d");

        return {
          id,
          d: d ?? null,
        };
      });

      setPaths(result);
    }, 100); // Let the DOM settle

    return () => clearTimeout(timeout);
  }, [trinketRefs]);

  return paths;
}
