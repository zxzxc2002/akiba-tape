import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import CassetteTape from './CassetteTape';

interface MiniCassetteProps {
    onClick: () => void;
}

const MiniCassette: React.FC<MiniCassetteProps> = ({ onClick }) => {
    return (
        <div
            className="fixed bottom-4 right-4 w-32 h-24 hover:scale-110 transition-transform cursor-pointer z-50 group"
            onClick={onClick}
            title="About Project"
        >
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 3.5]} />
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <group rotation={[Math.PI / 4, -Math.PI / 4, 0]}>
                    <CassetteTape />
                </group>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ABOUT
            </div>
        </div>
    );
};

export default MiniCassette;
