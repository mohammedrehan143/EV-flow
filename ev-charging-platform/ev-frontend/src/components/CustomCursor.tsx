import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      
      gsap.to(cursor, {
        x,
        y,
        duration: 0.1,
        ease: 'power2.out'
      });
      
      gsap.to(follower, {
        x,
        y,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    const onMouseDown = () => {
      gsap.to([cursor, follower], { scale: 0.7, duration: 0.3 });
    };

    const onMouseUp = () => {
      gsap.to([cursor, follower], { scale: 1, duration: 0.3 });
    };

    const onMouseEnterLink = () => {
      gsap.to(follower, { scale: 3, backgroundColor: 'rgba(0, 255, 136, 0.2)', border: 'none', duration: 0.3 });
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
    };

    const onMouseLeaveLink = () => {
      gsap.to(follower, { scale: 1, backgroundColor: 'transparent', border: '1px solid rgba(0, 255, 136, 0.5)', duration: 0.3 });
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Apply cursor hiding only when component is mounted
    document.documentElement.classList.add('custom-cursor-active');

    const interactiveElements = document.querySelectorAll('a, button, .interactive');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnterLink);
      el.addEventListener('mouseleave', onMouseLeaveLink);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.classList.remove('custom-cursor-active');
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnterLink);
        el.removeEventListener('mouseleave', onMouseLeaveLink);
      });
    };

  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2" 
      />
      <div 
        ref={followerRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-primary/50 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" 
      />
    </>
  );
};

export default CustomCursor;
