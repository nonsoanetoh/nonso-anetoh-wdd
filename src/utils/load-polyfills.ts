import "pathseg";
import decomp from "poly-decomp";

if (typeof window !== "undefined") {
  (window as any).decomp = decomp;
}
