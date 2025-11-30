
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Text } from '@react-three/drei';
import { Mesh, MeshStandardMaterial, SRGBColorSpace, Group, TextureLoader, Texture, Color, DoubleSide } from 'three';

// ... (existing code)


import { ASSETS } from '../constants';
import { PlayerState } from '../types';

interface CassetteModelProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onRewind: () => void;
  onNext: () => void;
  isTapeInserted: boolean;
}

const CassetteModel: React.FC<CassetteModelProps> = ({ playerState, onPlayPause, onRewind, onNext, isTapeInserted }) => {
  const groupRef = useRef<Group>(null);

  // Load the GLB model
  const { scene } = useGLTF(ASSETS.modelFile);

  // Clone scene to avoid mutating the cached original
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // State to hold loaded textures
  const [textures, setTextures] = useState<{
    map: Texture | null;
    normalMap: Texture | null;
    roughnessMap: Texture | null;
    tapeLabel: Texture | null;
  }>({
    map: null,
    normalMap: null,
    roughnessMap: null,
    tapeLabel: null,
  });

  // Manual texture loading
  useEffect(() => {
    const loader = new TextureLoader();
    const loadSafe = (url: string, key: string) => {
      loader.load(
        url,
        (tex) => {
          tex.colorSpace = SRGBColorSpace;
          tex.flipY = false;
          setTextures(prev => ({ ...prev, [key]: tex }));
        },
        undefined,
        (err) => console.warn(`Failed to load ${key} from ${url}`, err)
      );
    };

    loadSafe(ASSETS.diffuseMap, 'map');
    loadSafe(ASSETS.normalMap, 'normalMap');
    loadSafe(ASSETS.roughnessMap, 'roughnessMap');
    loadSafe(ASSETS.tapeLabel, 'tapeLabel');
  }, []);

  // Apply textures to the model
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;

        // Force opacity and double-sided rendering
        if (mesh.material) {
          const material = mesh.material as MeshStandardMaterial;
          material.transparent = false;
          material.opacity = 1.0;
          material.side = DoubleSide;
          material.depthWrite = true;
          material.needsUpdate = true;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [clonedScene, textures]);

  const [isReading, setIsReading] = useState(false);

  // Trigger reading effect on insertion
  useEffect(() => {
    if (isTapeInserted) {
      setIsReading(true);
      const timer = setTimeout(() => setIsReading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTapeInserted]);

  // Animation Loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Idle floating animation
      const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      if (playerState === PlayerState.PLAYING) {
        const vibration = Math.sin(state.clock.elapsedTime * 50) * 0.002;
        groupRef.current.position.y = floatY + vibration;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      } else if (isReading) {
        // Reading effect: Faster, more mechanical vibration
        const readVib = Math.sin(state.clock.elapsedTime * 80) * 0.005;
        groupRef.current.position.y = floatY + readVib;
        groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 100) * 0.002; // Side shake
      } else {
        groupRef.current.position.y = floatY;
        groupRef.current.position.x = 0;
        groupRef.current.rotation.z = 0;
      }
    }
  });

  const ButtonMaterial = new MeshStandardMaterial({ color: '#222', roughness: 0.3, metalness: 0.8 });
  const ActiveMaterial = new MeshStandardMaterial({ color: '#0f0', emissive: '#0f0', emissiveIntensity: 0.5 });

  return (
    <group ref={groupRef} dispose={null}>
      <ambientLight intensity={1} />
      <spotLight
        position={[10, 15, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#666" />

      {/* Use Center to automatically center the model and bounding box */}
      <Center>
        <group>
          <primitive
            object={clonedScene}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[2, 2, 2]}
          />


        </group>
      </Center>
    </group>
  );
};

export default CassetteModel;
