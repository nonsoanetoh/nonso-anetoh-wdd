import { useState, useEffect } from "react";

const docCache: Record<string, Promise<Document>> = {};

/**
 * Hook that fetches & parses an SVG sprite sheet only once per URL,
 * then returns the parsed Document.
 */
export function useSpriteSheetDoc(url: string): Document | null {
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!docCache[url]) {
      docCache[url] = fetch(url)
        .then((res) => res.text())
        .then((xml) => new DOMParser().parseFromString(xml, "image/svg+xml"));
    }

    docCache[url]!.then((d) => {
      if (!cancelled) setDoc(d);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return doc;
}
