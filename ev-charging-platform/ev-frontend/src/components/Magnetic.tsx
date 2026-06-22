import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
}

const Magnetic: React.FC<MagneticProps> = ({ children, strength = 0.5 }) => {
  const magneticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * strength);
      yTo(y * strength);
    };

    const onMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [strength]);

  return React.cloneElement(children as React.ReactElement<any>, { ref: magneticRef });
};

export default Magnetic;
