import React, { useMemo, useEffect } from 'react';
import { useGLTF, useTexture, Center } from '@react-three/drei';
import { Group, MeshStandardMaterial, Mesh, Box3, Vector3 } from 'three';
import { ASSETS } from '../constants';

interface CassetteTapeProps {
    labelTexture?: string;
    color?: string;
}

const CassetteTape: React.FC<CassetteTapeProps> = ({
    labelTexture = ASSETS.tapeLabel,
}) => {
    const { scene } = useGLTF(ASSETS.tapeModel);
    const texture = useTexture(labelTexture);

    // Clone the scene so we can use it multiple times
    const clonedScene = useMemo(() => {
        const cloned = scene.clone();

        // Traverse to fix materials or enable shadows
        cloned.traverse((child) => {
            if ((child as Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return cloned;
    }, [scene]);

    useEffect(() => {
        const box = new Box3().setFromObject(clonedScene);
        const size = new Vector3();
        box.getSize(size);
    }, [clonedScene]);

    return (
        <group>
            <Center>
                <primitive
                    object={clonedScene}
                    scale={[15, 15, 15]}
                    rotation={[0, 0, 0]}
                />
            </Center>
        </group>
    );
};

export default CassetteTape;
