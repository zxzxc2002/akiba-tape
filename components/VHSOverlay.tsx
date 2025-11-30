import React from 'react';

const VHSOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black animate-noise-intensify overflow-hidden">

            {/* Base Noise Layer */}
            <div className="absolute inset-0 opacity-50 mix-blend-screen">
                <svg className="w-full h-full">
                    <filter id="vhs-static">
                        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#vhs-static)" />
                </svg>
            </div>

            {/* Glitch Layer 1 (Red Shift + Tearing) */}
            <div className="absolute inset-0 bg-red-500/20 mix-blend-screen animate-glitch-1 opacity-70" style={{ clipPath: 'inset(0 0 0 0)' }}></div>

            {/* Glitch Layer 2 (Blue Shift + Tearing) */}
            <div className="absolute inset-0 bg-blue-500/20 mix-blend-screen animate-glitch-2 opacity-70" style={{ clipPath: 'inset(0 0 0 0)' }}></div>

            {/* Glitch Layer 3 (Skew Distortion) */}
            <div className="absolute inset-0 animate-glitch-skew mix-blend-overlay bg-white/10"></div>

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>

            {/* Text Overlay (Optional - Glitching) */}
            <div className="relative z-10 text-white font-mono text-4xl font-bold tracking-widest animate-pulse mix-blend-difference">
                ERROR_LOADING
            </div>
        </div>
    );
};

export default VHSOverlay;
