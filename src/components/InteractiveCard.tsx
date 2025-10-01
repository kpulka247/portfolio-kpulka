import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { trackEvent } from '../utils/analytics';

interface Project {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    techStack: string[];
    githubLink?: string;
}

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, yStart: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let y = yStart;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
};

const createMetallicTexture = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const radius = 40;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#6e727e');
    gradient.addColorStop(1, '#5c5c5f');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const rand = (Math.random() - 0.5) * 42;
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + rand));
        imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + rand));
        imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + rand));
    }
    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
};

const createCardTexture = (project: Project | null, side: 'front' | 'back') => {
    const width = 600;
    const height = 960;
    const tex = createMetallicTexture(width, height);
    const canvas = tex.image as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    if (project) {
        if (side === 'front') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '56px Metal Mania';
            ctx.textAlign = 'center';
            ctx.fillText(project.title, width / 2, 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = '36px sans-serif';
            wrapText(ctx, project.shortDescription, width / 2, 180, width - 80, 40);

            ctx.font = '26px sans-serif';
            const tagHeight = 60;
            const padding = 20;
            const gap = 15;
            const maxWidth = width - 80;
            const githubButtonHeight = 80;
            const bottomMargin = 60;
            const buttonY = height - githubButtonHeight - bottomMargin;
            const maxTagY = height - githubButtonHeight - bottomMargin - tagHeight;
            let currentX = (width - maxWidth) / 2;
            let currentY = 180 + 180;

            project.techStack.forEach((t) => {
                const tagWidth = ctx.measureText(t).width + padding * 2;
                if (currentX + tagWidth > (width + maxWidth) / 2) {
                    currentX = (width - maxWidth) / 2;
                    currentY += tagHeight + gap;
                }
                if (currentY > maxTagY) return;

                drawRoundedRect(ctx, currentX, currentY, tagWidth, tagHeight, 15, '#4f555f');
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(t, currentX + tagWidth / 2, currentY + tagHeight / 2);

                currentX += tagWidth + gap;
            });

            if (project.githubLink) {
                ctx.fillStyle = 'white';
                ctx.font = 'italic 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('Click to open', width / 2, buttonY - 20);

                drawRoundedRect(ctx, 160, height - githubButtonHeight - bottomMargin, width - 320, githubButtonHeight, 20, 'rgba(0,0,0,0.8)');
                ctx.fillStyle = 'white';
                ctx.font = 'bold 36px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText('GitHub', width / 2, height - githubButtonHeight / 2 - bottomMargin);
            }
        }
        else if (side === 'back') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = '90px Metal Mania';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            ctx.fillText(project.title, width / 2, height / 2);
        }
        tex.needsUpdate = true;
    } else {
        ctx.fillStyle = 'rgba(79, 85, 95, 0.4)';
        ctx.font = '400px Metal Mania';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', width / 2, height / 2);
    }
    return tex;
};


function useMouseInSection(sectionId: string) {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) {
            setPos({ x: 0, y: 0 });
            return;
        }

        const section = document.getElementById(sectionId);
        if (!section) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect();
            setPos({
                x: (e.clientX - rect.left) / rect.width - 0.5,
                y: (e.clientY - rect.top) / rect.height - 0.5
            });
        };

        const handleMouseLeave = () => {
            setPos({ x: 0, y: 0 });
        };

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            section.removeEventListener('mousemove', handleMouseMove);
            section.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [sectionId]);

    return pos;
}

export const InteractiveCard = ({
    project,
    isFlipped,
    isVisible,
    onReady,
    edgeColor = '#5c5c5f',
    metalness = 0.6,
    roughness = 0.2
}: {
    project: Project | null;
    isVisible: boolean;
    isFlipped: boolean;
    onReady: () => void;
    edgeColor?: string;
    metalness?: number;
    roughness?: number;
}) => {
    const mouseTrackRef = useRef<THREE.Group>(null!);
    const { x, y } = useMouseInSection('projects');

    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        if (onReady) {
            onReady();
        }
    }, [onReady]);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        if (isHovered && !isFlipped && project?.githubLink) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
        return () => {
            document.body.style.cursor = 'auto';
        };
    }, [isHovered, isFlipped, project]);

    const handleCardClick = () => {
        if (!isFlipped && project?.githubLink) {
            trackEvent('Projects', 'Click Card', project.title);
            window.open(project.githubLink, '_blank', 'noopener,noreferrer');
        }
    };

    const { rotation } = useSpring({ rotation: isFlipped ? Math.PI : 0, config: { friction: 22, tension: 170 } });

    const CARD_WIDTH = 4.3;
    const CARD_HEIGHT = (960 / 600) * CARD_WIDTH;
    const CARD_DEPTH = 0.1;
    const CORNER_RADIUS = 0.2;

    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const w = CARD_WIDTH;
        const h = CARD_HEIGHT;
        const r = CORNER_RADIUS;
        s.moveTo(-w / 2 + r, -h / 2);
        s.lineTo(w / 2 - r, -h / 2);
        s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
        s.lineTo(w / 2, h / 2 - r);
        s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
        s.lineTo(-w / 2 + r, h / 2);
        s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
        s.lineTo(-w / 2, -h / 2 + r);
        s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false);
        return s;
    }, []);

    const extrudeGeo = useMemo(() => {
        const g = new THREE.ExtrudeGeometry(shape, { depth: CARD_DEPTH, bevelEnabled: false });
        g.translate(0, 0, -CARD_DEPTH / 2);
        return g;
    }, [shape]);

    const sideMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        transparent: true,
        color: edgeColor,
        metalness,
        roughness
    }), [edgeColor, metalness, roughness]);

    const frontTexture = useMemo(() => createCardTexture(project, 'front'), [project]);
    const backTexture = useMemo(() => createCardTexture(project, 'back'), [project]);

    useEffect(() => {
        if (frontTexture) {
            frontTexture.colorSpace = THREE.SRGBColorSpace;
            frontTexture.needsUpdate = true;
        }
    }, [frontTexture]);

    useEffect(() => {
        if (backTexture) {
            backTexture.colorSpace = THREE.SRGBColorSpace;
            backTexture.needsUpdate = true;
        }
    }, [backTexture]);

    const frontMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: frontTexture,
        transparent: true,
        alphaTest: 0.01,
        metalness,
        roughness,
        side: THREE.FrontSide
    }), [frontTexture, metalness, roughness]);

    const backMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: backTexture,
        transparent: true,
        alphaTest: 0.01,
        metalness,
        roughness,
        side: THREE.FrontSide
    }), [backTexture, metalness, roughness]);

    const { rot } = useSpring({
        rot: [y * 0.9 * (isFlipped ? -1 : 1), x * 0.9],
        config: { mass: 1.2, tension: 160, friction: 8 },
        immediate: false,
        pause: !isVisible
    });

    useFrame(() => {
        if (mouseTrackRef.current) {
            mouseTrackRef.current.rotation.x = rot.get()[0];
            mouseTrackRef.current.rotation.y = rot.get()[1];
        }
    });

    const EPS = 0.001;

    return (
        <a.group
            rotation-y={rotation}
            onClick={handleCardClick}
            onPointerEnter={() => !isTouchDevice && setIsHovered(true)}
            onPointerLeave={() => !isTouchDevice && setIsHovered(false)}
        >
            <a.group ref={mouseTrackRef}>
                <a.mesh
                    geometry={extrudeGeo}
                    material={sideMaterial}
                />
                <a.mesh
                    position-z={CARD_DEPTH / 2 + EPS}
                    material={frontMaterial}
                >
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                </a.mesh>
                <a.mesh
                    position-z={-(CARD_DEPTH / 2 + EPS)}
                    rotation-y={Math.PI}
                    material={backMaterial}
                >
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                </a.mesh>
            </a.group>
        </a.group>
    );
};