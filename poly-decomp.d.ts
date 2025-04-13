declare module "poly-decomp" {
  const decomp: {
    decompose: (vertices: number[][]) => number[][][];
    isSimple: (vertices: number[][]) => boolean;
    makeCCW: (vertices: number[][]) => void;
  };
  export default decomp;
}
