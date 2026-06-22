import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AmbientBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create 15 flying symbols
    const symbols = Array.from({ length: 15 });
    
    symbols.forEach(() => {
      const div = document.createElement('div');
      div.className = 'absolute text-primary/25 pointer-events-none symbol-node';
      div.style.left = `${Math.random() * 100}%`;
      div.style.top = `${Math.random() * 100}%`;
      container.appendChild(div);

      // Render the icon using a portal-like approach or just simplified SVG
      div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="m11 7-3 5h4l-3 5"/>
          <line x1="22" x2="22" y1="11" y2="13"/>
        </svg>
      `;

      // Random "flying" animation
      const animateSymbol = () => {
        gsap.to(div, {
          x: `+=${(Math.random() - 0.5) * 400}`,
          y: `+=${(Math.random() - 0.5) * 400}`,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random(),
          opacity: Math.random() * 0.2,
          duration: 10 + Math.random() * 20,
          ease: "sine.inOut",
          onComplete: animateSymbol
        });
      };

      animateSymbol();
    });

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
    />
  );
};

export default AmbientBackground;
