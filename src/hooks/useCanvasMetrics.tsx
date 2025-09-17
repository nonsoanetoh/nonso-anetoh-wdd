import { useThree } from "@react-three/fiber";

export const useCanvasMetrics = () => {
  const { size, camera } = useThree();
  const zoom = camera.zoom;
  const pxToWorld = (px: number) => px / zoom;
  const worldToPx = (units: number) => units * zoom;

  return {
    width: size.width,
    height: size.height,
    zoom,
    pxToWorld,
    worldToPx,
  };
};
