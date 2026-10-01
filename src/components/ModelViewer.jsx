import { Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PresentationControls,
} from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import defaultModelUrl from "../assets/helloworld_Box_Web exact.glb?url";

const LIGHTING = {
  exposure: 1.5,
  ambient: 0.25,
  key: {
    color: "#c0d1ec",
    intensity: 180,
    position: [2.5, 4, 2.5],
    distance: 10,
    decay: 2,
  },
  fill: {
    color: "#ffffff",
    intensity: 0.5,
    position: [-5, 2, 4],
  },
  rim: {
    color: "#00378e",
    intensity: 2,
    position: [-5, 2, 4],
  },
};

function CameraSetup() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const aspect = size.width / size.height;
    const verticalFov = MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const modelRadius = 1.8;
    const margin = 1.23;
    const distance =
      Math.max(
        modelRadius / Math.tan(verticalFov / 2),
        modelRadius / Math.tan(horizontalFov / 2),
      ) * margin;

    camera.aspect = aspect;
    camera.position.copy(
      new Vector3(4, 2.5, 5).normalize().multiplyScalar(distance),
    );
    camera.near = 0.1;
    camera.far = 100;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

function Model() {
  const { scene } = useLoader(GLTFLoader, defaultModelUrl);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <PresentationControls
      global
      speed={1.15}
      polar={[-Infinity, Infinity]}
      azimuth={[-Infinity, Infinity]}
      damping={0.12}
    >
      <primitive object={scene} position={[0, -0.73, 0]} />
    </PresentationControls>
  );
}

function ModelViewer() {
  return (
    <Canvas
      camera={{ position: [4, 2.5, 5], fov: 42 }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMappingExposure = LIGHTING.exposure;
      }}
    >
      <CameraSetup />
      <ambientLight intensity={LIGHTING.ambient} />
      <pointLight
        color={LIGHTING.key.color}
        intensity={LIGHTING.key.intensity}
        position={LIGHTING.key.position}
        distance={LIGHTING.key.distance}
        decay={LIGHTING.key.decay}
      />
      <directionalLight
        color={LIGHTING.fill.color}
        intensity={LIGHTING.fill.intensity}
        position={LIGHTING.fill.position}
      />
      <directionalLight
        color={LIGHTING.rim.color}
        intensity={LIGHTING.rim.intensity}
        position={LIGHTING.rim.position}
      />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <OrbitControls
        makeDefault
        enableRotate={false}
        enablePan={false}
        enableZoom
        minDistance={3.5}
        maxDistance={12}
        zoomSpeed={0.7}
        dampingFactor={0.08}
        enableDamping
      />
    </Canvas>
  );
}

export default ModelViewer;
