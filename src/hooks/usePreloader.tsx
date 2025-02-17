import { useRef, useCallback } from "react";
import gsap from "gsap";

interface UPProps {
  swapSpeed?: number;
}

interface AnimateSequenceProps {
  sequence: HTMLElement[];
  duration?: number;
}

const usePreloader = ({ swapSpeed = 0.25 }: UPProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef(gsap.timeline());

  const animateSequence = useCallback(
    ({
      sequence,
      duration = swapSpeed,
    }: AnimateSequenceProps): Promise<void> => {
      return new Promise((resolve) => {
        timelineRef.current.clear();

        sequence.forEach((frame: HTMLElement) => {
          timelineRef.current.set(frame, {
            display: "block",
          });

          timelineRef.current.set(
            frame,
            {
              display: "none",
            },
            `+=${duration}`
          );
        });

        timelineRef.current.set(sequence[0], {
          display: "block",
        });

        timelineRef.current.to(sequence[0], {
          opacity: 0,
        });

        timelineRef.current.call(resolve);
      });
    },
    [swapSpeed]
  );

  const startAnimation = useCallback(
    (sequence: HTMLElement[]): Promise<void> => {
      return new Promise((resolve) => {
        console.log("here: ", sequence);
        if (sequence.length > 0) {
          animateSequence({ sequence }).then(resolve);
        } else {
          resolve();
        }
      });
    },
    [animateSequence]
  );

  return { preloaderRef, startAnimation };
};

export default usePreloader;
