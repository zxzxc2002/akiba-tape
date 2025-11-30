import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { ASSETS } from '../constants';
import CassetteTape from './CassetteTape';

interface LooseTapeProps {
    onInsert: () => void;
}

const LooseTape: React.FC<LooseTapeProps> = ({ onInsert }) => {
    const groupRef = useRef<Group>(null);
    const [isInserting, setIsInserting] = useState(false);
    const texture = useTexture(ASSETS.tapeLabel);

    // Initial position: High and forward (Hand position)
    const startPos = new Vector3(0, 3, 2);
    // Intermediate position: Directly above the slot
    const alignPos = new Vector3(0, 2, 0);
    // Target position: Inside the player
    const targetPos = new Vector3(0, 0, 0);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (isInserting) {
            const currentPos = groupRef.current.position;
            const distToAlign = currentPos.distanceTo(alignPos);
            const distToTarget = currentPos.distanceTo(targetPos);

            // Stage 1: Move to Align Position (Above slot)
            if (distToAlign > 0.1 && currentPos.y > 2) {
                groupRef.current.position.lerp(alignPos, 0.04);

                // Rotate to upright alignment (Vertical)
                groupRef.current.rotation.x = Math.lerp(groupRef.current.rotation.x, 0, 0.05);
                groupRef.current.rotation.y = Math.lerp(groupRef.current.rotation.y, 0, 0.05);
                groupRef.current.rotation.z = Math.lerp(groupRef.current.rotation.z, 0, 0.05);
            }
            // Stage 2: Drop down into slot
            else {
                groupRef.current.position.lerp(targetPos, 0.08);

                // Ensure perfect alignment (Vertical)
                groupRef.current.rotation.x = 0;
                groupRef.current.rotation.y = 0;
                groupRef.current.rotation.z = 0;

                // Check if close enough to finish
                if (distToTarget < 0.05) {
                    onInsert();
                }
            }
        } else {
            // Idle float above
            groupRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            groupRef.current.position.z = 2 + Math.cos(state.clock.elapsedTime) * 0.1;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
            groupRef.current.rotation.x = 0.2; // Slight tilt towards user
        }
    });

    const handleClick = () => {
        if (!isInserting) {
            setIsInserting(true);
        }
    };

    return (
        <group
            ref={groupRef}
            position={[0, 3, 2]}
            onClick={handleClick}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <CassetteTape />

            {/* "CLICK TO INSERT" Text */}
            {!isInserting && (
                <Text
                    position={[0, 0.8, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    INSERT TAPE
                </Text>
            )}
        </group>
    );
};

// Helper for math lerp
declare global {
    interface Math {
        lerp(start: number, end: number, t: number): number;
    }
}
Math.lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
};

export default LooseTape;
