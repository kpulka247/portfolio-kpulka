import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  OrthographicCamera,
  Scene,
  Mesh,
  PlaneGeometry,
} from 'three';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';
import trailShader from '../shaders/trailShader.glsl';

interface SmokePlaneProps {
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
  hasInteracted: boolean;
  isSimulationActive: boolean;
}

const SmokePlane: React.FC<SmokePlaneProps> = ({ mousePosRef, hasInteracted, isSimulationActive }) => {
  const { size, viewport, gl } = useThree();
  const mainMaterialRef = useRef<ShaderMaterial>(null!);
  const lastMousePos = useRef(new Vector2(0.5, 0.5));

  const fboState = useRef(
    (() => {
      const fbo1 = new WebGLRenderTarget(size.width, size.height, {
        minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat,
      });
      const fbo2 = fbo1.clone();
      return { read: fbo1, write: fbo2 };
    })()
  );

  const { trailScene, trailCamera, trailMaterial } = useMemo(() => {
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: trailShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uMouseVelocity: { value: new Vector2(0, 0) },
        uTrailTexture: { value: null },
        uResolution: { value: new Vector2(size.width, size.height) },
      },
    });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    scene.add(quad);
    return { trailScene: scene, trailCamera: camera, trailMaterial: material };
  }, [size]);

  const mainUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new Vector2(size.width, size.height) },
    uTrailTexture: { value: fboState.current.read.texture },
  }), [size]);

  useFrame((state) => {
    if (!isSimulationActive) {
      trailMaterial.uniforms.uMouseVelocity.value.set(0, 0);
      return;
    }

    if (!hasInteracted) { /* ... */ }
    const elapsed = state.clock.getElapsedTime();
    const newMouse = new Vector2(mousePosRef.current.x, 1.0 - mousePosRef.current.y);
    const velocity = new Vector2().subVectors(newMouse, lastMousePos.current);
    lastMousePos.current.copy(newMouse);

    const { read: fboRead, write: fboWrite } = fboState.current;

    trailMaterial.uniforms.uTrailTexture.value = fboRead.texture;
    trailMaterial.uniforms.uTime.value = elapsed;
    trailMaterial.uniforms.uMouse.value.copy(newMouse);
    trailMaterial.uniforms.uMouseVelocity.value.copy(velocity);
    trailMaterial.uniforms.uResolution.value.set(size.width, size.height);

    gl.setRenderTarget(fboWrite);
    gl.render(trailScene, trailCamera);
    gl.setRenderTarget(null);

    if (mainMaterialRef.current) {
      mainMaterialRef.current.uniforms.uTrailTexture.value = fboWrite.texture;
      mainMaterialRef.current.uniforms.uTime.value = elapsed;
      mainMaterialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }

    const temp = fboState.current.read;
    fboState.current.read = fboState.current.write;
    fboState.current.write = temp;
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={mainMaterialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={mainUniforms}
      />
    </mesh>
  );
};


interface InteractiveBgProps {
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
  hasInteracted: boolean;
  isSimulationActive: boolean;
}

const InteractiveBg: React.FC<InteractiveBgProps> = ({ mousePosRef, hasInteracted, isSimulationActive }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
      <Canvas>
        <SmokePlane
          mousePosRef={mousePosRef}
          hasInteracted={hasInteracted}
          isSimulationActive={isSimulationActive}
        />
      </Canvas>
    </div>
  );
};

export default InteractiveBg;