import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { Group, Mesh, Euler } from 'three';
import { ASSETS } from '../constants';

const TAPE_COUNT = 300; // Optimized count
const SPREAD = 60; // Confined spread area

const OrbitingTapes: React.FC = () => {
    const { nodes } = useGLTF(ASSETS.tapeModel) as any;

    // Find the main mesh geometry and material
    const meshData = useMemo(() => {
        const meshNode = Object.values(nodes).find((node: any) => node.isMesh) as Mesh;
        return {
            geometry: meshNode?.geometry,
            material: meshNode?.material
        };
    }, [nodes]);

    // Generate random data for instances
    const instancesData = useMemo(() => {
        return new Array(TAPE_COUNT).fill(0).map(() => {
            // Random position in a large sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 15 + Math.random() * SPREAD; // Start from 15 to avoid clipping player

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // Random rotation
            const rotation = new Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Random rotation speed
            const rotSpeed = [
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ];

            return { position: [x, y, z], rotation, rotSpeed };
        });
    }, []);

    const groupRef = useRef<Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slowly rotate the entire galaxy of tapes
            groupRef.current.rotation.y += delta * 0.02;
        }
    });

    if (!meshData.geometry || !meshData.material) return null;

    return (
        <group ref={groupRef}>
            <Instances
                range={TAPE_COUNT}
                geometry={meshData.geometry}
                material={meshData.material}
            >
                {instancesData.map((data, i) => (
                    <TapeInstance
                        key={i}
                        initialPosition={data.position as [number, number, number]}
                        initialRotation={data.rotation}
                        rotSpeed={data.rotSpeed}
                    />
                ))}
            </Instances>
        </group>
    );
};

// Individual Instance component
const TapeInstance = ({ initialPosition, initialRotation, rotSpeed }: any) => {
    const ref = useRef<any>(null);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += rotSpeed[0];
            ref.current.rotation.y += rotSpeed[1];
            ref.current.rotation.z += rotSpeed[2];
        }
    });

    return (
        <Instance
            ref={ref}
            position={initialPosition}
            rotation={initialRotation}
            scale={[1.5, 1.5, 1.5]}
        />
    );
};

export default OrbitingTapes;
