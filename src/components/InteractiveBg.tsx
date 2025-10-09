import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  HalfFloatType,
  UnsignedByteType,
} from "three";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";
import trailShader from "../shaders/trailShader.glsl";

const SIMULATION_RESOLUTION = new Vector2(2048, 2048);

interface SmokePlaneProps {
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
  isSimulationActive: boolean;
  onReady: () => void;
}

const SmokePlane: React.FC<SmokePlaneProps> = ({
  mousePosRef,
  isSimulationActive,
  onReady,
}) => {
  const { size, viewport, gl } = useThree();
  const mainMaterialRef = useRef<ShaderMaterial>(null!);
  const lastMousePos = useRef(new Vector2(0.5, 0.5));
  const onReadyCalledRef = useRef(false);

  const viewSize = useRef(new Vector2(1, 1));
  const viewOffset = useRef(new Vector2(0, 0));
  const screenMouse = useRef(new Vector2(0, 0));
  const simMouse = useRef(new Vector2(0, 0));
  const velocity = useRef(new Vector2(0, 0));

  const fboState = useRef(
    (() => {
      const isHalfFloatSupported =
        gl.capabilities.isWebGL2 ||
        gl.extensions.get("EXT_color_buffer_half_float");
      const targetType = isHalfFloatSupported
        ? HalfFloatType
        : UnsignedByteType;

      const fbo1 = new WebGLRenderTarget(
        SIMULATION_RESOLUTION.x,
        SIMULATION_RESOLUTION.y,
        {
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          format: RGBAFormat,
          type: targetType,
        }
      );
      const fbo2 = fbo1.clone();

      return { read: fbo1, write: fbo2 };
    })()
  );

  const trailMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: trailShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uMouseVelocity: { value: new Vector2(0, 0) },
        uTrailTexture: { value: null },
        uViewSize: { value: new Vector2(1, 1) },
        uViewOffset: { value: new Vector2(0, 0) },
      },
    });
  }, []);

  const { trailScene, trailCamera } = useMemo(() => {
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new Mesh(new PlaneGeometry(2, 2), trailMaterial);
    scene.add(quad);
    return { trailScene: scene, trailCamera: camera };
  }, [trailMaterial]);

  const mainUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTrailTexture: { value: fboState.current.read.texture },
      uViewSize: { value: new Vector2(1, 1) },
      uViewOffset: { value: new Vector2(0, 0) },
    }),
    []
  );

  useEffect(() => {
    const displayAspect = size.width / size.height;
    const simulationAspect = SIMULATION_RESOLUTION.x / SIMULATION_RESOLUTION.y;

    viewSize.current.set(1, 1);
    viewOffset.current.set(0, 0);

    if (displayAspect > simulationAspect) {
      viewSize.current.y = simulationAspect / displayAspect;
      viewOffset.current.y = (1 - viewSize.current.y) / 2;
    } else {
      viewSize.current.x = displayAspect / simulationAspect;
      viewOffset.current.x = (1 - viewSize.current.x) / 2;
    }
  }, [size]);

  useFrame((state) => {
    if (!onReadyCalledRef.current) {
      onReady();
      onReadyCalledRef.current = true;
    }

    if (!isSimulationActive) {
      trailMaterial.uniforms.uMouseVelocity.value.set(0, 0);
      return;
    }

    const elapsed = state.clock.getElapsedTime();

    screenMouse.current.set(mousePosRef.current.x, 1.0 - mousePosRef.current.y);

    const scaleFactor = 1 / meshScale;
    simMouse.current.set(
      (screenMouse.current.x * viewSize.current.x + viewOffset.current.x) *
        scaleFactor -
        (scaleFactor - 1) / 2,
      (screenMouse.current.y * viewSize.current.y + viewOffset.current.y) *
        scaleFactor -
        (scaleFactor - 1) / 2
    );

    velocity.current.subVectors(simMouse.current, lastMousePos.current);
    lastMousePos.current.copy(simMouse.current);

    trailMaterial.uniforms.uViewSize.value.copy(viewSize.current);
    trailMaterial.uniforms.uViewOffset.value.copy(viewOffset.current);
    trailMaterial.uniforms.uMouse.value.copy(simMouse.current);
    trailMaterial.uniforms.uMouseVelocity.value.copy(velocity.current);
    trailMaterial.uniforms.uTime.value = elapsed;

    const { read: fboRead, write: fboWrite } = fboState.current;
    trailMaterial.uniforms.uTrailTexture.value = fboRead.texture;

    gl.setRenderTarget(fboWrite);
    gl.render(trailScene, trailCamera);
    gl.setRenderTarget(null);

    if (mainMaterialRef.current) {
      mainMaterialRef.current.uniforms.uTrailTexture.value = fboWrite.texture;
      mainMaterialRef.current.uniforms.uViewSize.value.copy(viewSize.current);
      mainMaterialRef.current.uniforms.uViewOffset.value.copy(
        viewOffset.current
      );
      mainMaterialRef.current.uniforms.uTime.value = elapsed;
    }

    const temp = fboState.current.read;
    fboState.current.read = fboState.current.write;
    fboState.current.write = temp;
  });

  const meshScale = 1.2;

  return (
    <mesh scale={[meshScale, meshScale, 1]}>
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
  isSimulationActive: boolean;
  onReady: () => void;
}

const InteractiveBg: React.FC<InteractiveBgProps> = ({
  mousePosRef,
  isSimulationActive,
  onReady,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#ede6e6] z-0 pointer-events-none">
      <Canvas dpr={[1, 2]}>
        <SmokePlane
          mousePosRef={mousePosRef}
          isSimulationActive={isSimulationActive}
          onReady={onReady}
        />
      </Canvas>
    </div>
  );
};
export default InteractiveBg;
