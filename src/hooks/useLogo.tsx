import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface UseLogoProps {
  swapSpeed?: number;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  backgroundRef: React.RefObject<HTMLDivElement | null>;
  labelRef: React.RefObject<HTMLParagraphElement | null>;
  locationRef: React.RefObject<HTMLParagraphElement | null>;
  navLinksRef: React.RefObject<(HTMLLIElement | null)[]>;
  separatorRef: React.RefObject<HTMLSpanElement | null>;
}

interface AnimateSequenceProps {
  sequence: HTMLElement[];
  duration?: number;
}

const useLogo = ({
  swapSpeed = 0.25,
  titleRef,
  backgroundRef,
  labelRef,
  locationRef,
  navLinksRef,
  separatorRef,
}: UseLogoProps) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const animatedFramesRef = useRef<HTMLElement[] | null>(null);
  const timelineRef = useRef(gsap.timeline());

  const buildSequences = (): void => {
    if (logoRef.current) {
      animatedFramesRef.current = Array.from(
        logoRef.current.querySelectorAll("[data-name='animated-frame']")
      );
    }
  };

  const animateSequence = useCallback(
    ({
      sequence,
      duration = swapSpeed,
    }: AnimateSequenceProps): Promise<void> => {
      return new Promise((resolve) => {
        timelineRef.current.clear();

        const parentElement = logoRef.current?.parentElement;
        if (!parentElement) {
          resolve();
          return;
        }

        const parentRect = parentElement.getBoundingClientRect();
        const logoRect = logoRef.current?.getBoundingClientRect();
        if (!logoRect) {
          resolve();
          return;
        }
        const centerX = (parentRect.width - logoRect.width) / 2;
        const centerY = (parentRect.height - logoRect.height) / 2;

        timelineRef.current.set(logoRef.current, {
          x: centerX,
          y: centerY,
        });

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

        timelineRef.current.to(logoRef.current, {
          x: 0,
          y: 0,
        });

        timelineRef.current.to(
          [titleRef.current, labelRef.current, locationRef.current],
          {
            autoAlpha: 1,
            stagger: 0.1,
          }
        );

        if (backgroundRef.current) {
          timelineRef.current.fromTo(
            backgroundRef.current,
            {
              backgroundColor: "transparent",
            },
            { backgroundColor: "#eeebeb" },
            "-=0.75"
          );
        }

        if (separatorRef.current) {
          timelineRef.current.fromTo(
            separatorRef.current,
            {
              autoAlpha: 0,
              scaleX: 0,
            },
            {
              autoAlpha: 1,
              scaleX: 1,
              duration: 0.5,
              transformOrigin: "left center",
            },
            "-=0.5"
          );
        }

        if (navLinksRef.current) {
          navLinksRef.current.forEach((link, index) => {
            if (link) {
              timelineRef.current.fromTo(
                link,
                {
                  autoAlpha: 0,
                  y: 10,
                },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.5,
                },
                `-=${0.5 + index * 0.1}`
              );
            }
          });
        }

        timelineRef.current.call(resolve);
      });
    },
    [swapSpeed, titleRef, backgroundRef, labelRef, locationRef, navLinksRef]
  );

  const startAnimation = useCallback(
    (sequence: HTMLElement[]): Promise<void> => {
      return new Promise((resolve) => {
        if (animatedFramesRef.current && animatedFramesRef.current.length > 0) {
          animateSequence({ sequence }).then(resolve);
        } else {
          resolve();
        }
      });
    },
    [animateSequence]
  );

  const replayAnimation = useCallback(() => {
    if (animatedFramesRef.current && animatedFramesRef.current.length > 0) {
      animateSequence({ sequence: Array.from(animatedFramesRef.current) });
    }
  }, [animateSequence]);

  const setFrame = useCallback(
    (frameType: string) => {
      if (!logoRef.current) return;

      const frames = Array.from(
        logoRef.current.querySelectorAll("[data-name='animated-frame']")
      ) as HTMLElement[];
      const interactionFrame = logoRef.current.querySelector(
        "[data-name='interaction-frame']"
      ) as HTMLElement;
      const alternateFrame = logoRef.current.querySelector(
        "[data-name='alternate-frame']"
      ) as HTMLElement;

      frames.forEach((frame) => (frame.style.display = "none"));
      if (interactionFrame) interactionFrame.style.display = "none";
      if (alternateFrame) alternateFrame.style.display = "none";

      if (frameType === "interaction" && interactionFrame) {
        interactionFrame.style.display = "block";
      } else if (frameType === "alternate" && alternateFrame) {
        alternateFrame.style.display = "block";
      } else if (frames.length > 0) {
        frames[0].style.display = "block";
      }
    },
    [logoRef]
  );

  const reset = useCallback(() => {
    if (animatedFramesRef.current && animatedFramesRef.current.length > 0) {
      const interactionFrame = logoRef.current?.querySelector(
        "[data-name='interaction-frame']"
      ) as HTMLElement;
      if (interactionFrame) interactionFrame.style.display = "none";

      animatedFramesRef.current.forEach((frame, index) => {
        frame.style.display = index === 0 ? "block" : "none";
      });
    }
  }, []);

  useEffect(() => {
    buildSequences();
  }, []);

  return { logoRef, startAnimation, replayAnimation, setFrame, reset };
};

export default useLogo;
