import React, { useEffect, useRef } from 'react';

const BackgroundVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // Slower for mobile/performance
        }
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0, // Brought up to be visible
                overflow: 'hidden',
                pointerEvents: 'none',
                backgroundColor: '#000',
            }}
        >
            <style>
                {`
          @keyframes noise-animation {
            0% { transform: translate(0, 0); }
            10% { transform: translate(-5%, -5%); }
            20% { transform: translate(-10%, 5%); }
            30% { transform: translate(5%, -10%); }
            40% { transform: translate(-5%, 15%); }
            50% { transform: translate(-10%, 5%); }
            60% { transform: translate(15%, 0); }
            70% { transform: translate(0, 10%); }
            80% { transform: translate(-15%, 0); }
            90% { transform: translate(10%, 5%); }
            100% { transform: translate(5%, 0); }
          }
        `}
            </style>

            {/* Video Element with Heavy Distortion - Rotated for Mobile */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    // Stronger blur + high contrast = "bleeding" pixel look
                    // Sepia + Hue Rotate = Old tape color grading
                    filter: 'blur(4px) contrast(1.4) brightness(0.9) sepia(0.4) saturate(1.5) hue-rotate(-10deg)',
                    transform: 'rotate(90deg) scale(1.8)', // Rotate and scale to cover
                }}
            >
                <source src="/akiba_back.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Pixelation/Grid Overlay - Simulating low resolution */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    // Tiny grid to simulate pixels
                    backgroundImage: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))
          `,
                    backgroundSize: '4px 4px', // Larger grid for "pixel" feel
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                }}
            />

            {/* Animated Noise Layer */}
            <div
                style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
                    animation: 'noise-animation 0.5s steps(5) infinite',
                    pointerEvents: 'none',
                    opacity: 0.4,
                    mixBlendMode: 'screen',
                }}
            />

            {/* Vignette Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* CRT Scanlines - Moving */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
                    backgroundSize: '100% 4px',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%',
                    pointerEvents: 'none',
                    zIndex: 11,
                    opacity: 0.3
                }}
            />
            {/* Moving Scanline Bar */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '20%',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
                    animation: 'scanline 8s linear infinite',
                    pointerEvents: 'none',
                    zIndex: 12,
                }}
            />
        </div>
    );
};

export default BackgroundVideo;
