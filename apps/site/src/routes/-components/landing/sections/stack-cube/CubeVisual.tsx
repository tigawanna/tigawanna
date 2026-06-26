import { stackCubeFaces } from "@/config/info";

const FACE_TEXTURE_CLASSES = [
  "cube-face--front",
  "cube-face--right",
  "cube-face--back",
  "cube-face--left",
] as const;

type CubeVisualProps = {
  cubeRef?: React.RefObject<HTMLDivElement | null>;
};

export function CubeVisual({ cubeRef }: CubeVisualProps) {
  return (
    <div className="cube-perspective">
      <div
        ref={cubeRef}
        className="cube-scene"
        style={{ transform: "rotateY(-20deg) rotateX(-12deg)" }}
      >
        {stackCubeFaces.map((face, index) => (
          <div key={face.label} className={`cube-face ${FACE_TEXTURE_CLASSES[index]}`} />
        ))}
      </div>
    </div>
  );
}
