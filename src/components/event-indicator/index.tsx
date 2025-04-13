"use client";
import React, { useEffect, useRef, useState } from "react";

const EventIndicator = () => {
  const eventIndicatorRef = useRef<HTMLDivElement>(null);
  const [eventTriggered, setEventTriggered] = useState(false);
  const elementsRef = useRef<Item[]>([]);

  const config = {
    gravity: 0.25,
    friction: 0.99,
    imageSize: 8,
    horizontalForce: 20,
    verticalForce: 18,
    rotationalSpeed: 5,
    resetDelay: 500,
  };

  const imageCount = 5;

  const imagePaths = Array.from(
    { length: imageCount },
    (_, i) => `/avatar${i + 1}.png`
  );

  class Item {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    element: HTMLImageElement;

    constructor(element: HTMLImageElement) {
      this.element = element;
      this.x = 0;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * config.horizontalForce;
      this.vy = -config.verticalForce - Math.random() * 10;
      this.rotation = 0;
      this.rotationSpeed = (Math.random() - 0.5) * config.rotationalSpeed;
    }

    update() {
      this.vy += config.gravity;
      this.vx *= config.friction;
      this.vy *= config.friction;
      this.rotationSpeed *= config.friction;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      if (this.element) {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
      }
    }
  }

  const createElements = () => {
    if (!eventIndicatorRef.current) return;

    eventIndicatorRef.current.innerHTML = "";
    elementsRef.current = [];

    // Add images
    imagePaths.forEach((path) => {
      const img = document.createElement("img");
      img.src = path;
      img.classList.add("event-image");
      img.style.width = `${config.imageSize}rem`;
      if (eventIndicatorRef.current) {
        eventIndicatorRef.current.appendChild(img);
      }
    });

    const eventElements =
      eventIndicatorRef.current.querySelectorAll(".event-image");
    elementsRef.current = (Array.from(eventElements) as HTMLImageElement[]).map(
      (element) => new Item(element)
    );
  };

  const emit = () => {
    if (eventTriggered) return;
    setEventTriggered(true);
    createElements();

    let animationFrameId: number;
    let finished = false;

    const animate = () => {
      if (finished) return;

      elementsRef.current.forEach((item) => {
        item.update();
      });

      if (
        eventIndicatorRef.current &&
        elementsRef.current.every(
          (item) =>
            eventIndicatorRef.current &&
            item.y > eventIndicatorRef.current.offsetHeight / 2
        )
      ) {
        cancelAnimationFrame(animationFrameId);
        finished = true;
        setTimeout(() => {
          setEventTriggered(false);
        }, config.resetDelay);

        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  };

  const handleClick = () => {
    console.log("click");
    // return;
    if (!eventTriggered) {
      emit();
    }
  };

  useEffect(() => {
    imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });

    createElements();
  });

  return (
    <section onClick={handleClick} id="event-container" ref={eventIndicatorRef}>
      dsds
    </section>
  );
};

export default EventIndicator;
