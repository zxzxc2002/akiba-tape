import React, { useEffect, useRef, useState } from 'react';

const GlitchOverlay: React.FC = () => {
  const requestRef = useRef<number>();

  // Refs for visual elements
  const trackingRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const rollingBarRef = useRef<HTMLDivElement>(null);
  const trackingStripRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    let lastTime = 0;
    let rollingBarY = 0;

    const animate = (time: number) => {
      // Update noise seed every frame for true static (Direct DOM manipulation)
      if (time - lastTime > 50) {
        if (turbulenceRef.current) {
          turbulenceRef.current.setAttribute('seed', Math.floor(Math.random() * 100).toString());
        }
        lastTime = time;
      }

      // 1. Global Tracking / Jitter (Whole Screen Shake)
      if (trackingRef.current) {
        const isTrackingError = Math.random() > 0.98;
        const x = isTrackingError ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 1;
        const skew = isTrackingError ? (Math.random() - 0.5) * 2 : 0;
        trackingRef.current.style.transform = `translateX(${x}px) skewX(${skew}deg)`;
      }

      // 2. Rolling Bar (Hum Bar) - Scrolls slowly down
      if (rollingBarRef.current) {
        rollingBarY += 0.5; // Speed of scroll
        if (rollingBarY > 100) rollingBarY = -20; // Reset
        rollingBarRef.current.style.top = `${rollingBarY}%`;
        rollingBarRef.current.style.opacity = (Math.random() * 0.1 + 0.05).toString(); // Flicker opacity
      }

      // 3. Tracking Error Strip (Bottom Head Switching Noise)
      if (trackingStripRef.current) {
        const skew = (Math.random() - 0.5) * 20;
        const x = (Math.random() - 0.5) * 10;
        trackingStripRef.current.style.transform = `translateX(${x}px) skewX(${skew}deg)`;
        trackingStripRef.current.style.opacity = (Math.random() * 0.5 + 0.5).toString();
      }

      // 4. Random Dropouts (White Lines)
      [line1Ref, line2Ref].forEach(ref => {
        if (ref.current) {
          if (Math.random() > 0.98) { // Occasional
            ref.current.style.opacity = (Math.random() * 0.5 + 0.2).toString();
            ref.current.style.top = `${Math.random() * 100}%`;
            ref.current.style.height = `${Math.random() * 3 + 1}px`;
          } else {
            ref.current.style.opacity = '0';
          }
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-hard-light">
      {/* SVG Noise Filter Definition */}
      <svg className="hidden">
        <defs>
          <filter id="authentic-noise">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
              seed="0"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Main Noise Layer */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ filter: 'url(#authentic-noise)' }}
      ></div>

      {/* Tracking / Jitter Layer (Wraps content if possible, but here just overlays) */}
      <div ref={trackingRef} className="absolute inset-0 w-full h-full transition-transform duration-75">
      </div>

      {/* Rolling Bar (Hum Bar) */}
      <div
        ref={rollingBarRef}
        className="absolute w-full h-[15%] bg-black blur-xl mix-blend-multiply pointer-events-none"
        style={{ top: '-20%' }}
      ></div>

      {/* Tracking Error Strip (Bottom) */}
      <div
        ref={trackingStripRef}
        className="absolute bottom-0 left-0 w-full h-[8%] bg-white/10 mix-blend-overlay pointer-events-none"
        style={{
          filter: 'url(#authentic-noise) contrast(2)',
          maskImage: 'linear-gradient(to bottom, transparent, black)'
        }}
      ></div>

      {/* Dropout Lines */}
      <div ref={line1Ref} className="absolute w-full bg-white/80 mix-blend-overlay shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
      <div ref={line2Ref} className="absolute w-full bg-white/50 mix-blend-color-dodge"></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.4)_100%)]"></div>
    </div>
  );
};

export default GlitchOverlay;
