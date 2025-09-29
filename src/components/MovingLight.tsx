import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function MovingLight() {
    const lightRef = useRef<THREE.RectAreaLight>(null!);
    const duration = 5;

    useFrame(({ clock }) => {
        if (!lightRef.current) return;
        const t = (clock.getElapsedTime() % duration) / duration;
        const xStart = -40;
        const xEnd = 40;
        const yStart = 70;
        const yEnd = -70;
        const fade = Math.sin(Math.PI * t);

        lightRef.current.position.set(
            THREE.MathUtils.lerp(xStart, xEnd, t),
            THREE.MathUtils.lerp(yStart, yEnd, t),
            5
        );
        lightRef.current.lookAt(0, 0, 0);
        lightRef.current.intensity = 5 * fade;
    });

    return (
        <>
            <rectAreaLight
                ref={lightRef}
                width={200}
                height={5}
                intensity={10}
                color="#ffffff"
                position={[0, 0, 5]}
            />
        </>
    );
}