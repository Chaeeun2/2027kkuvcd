import { Suspense, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetUrl } from "../content/assetUrl";

const defaultModelUrl = assetUrl("helloworld_Box_Web exact.glb");

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;
const MODEL_RADIUS = 1.8;
const FIT_MARGIN = 1.23;
// 데스크톱에서 상자가 화면에 보이는 크기 배율. 화면상 크기는 카메라 거리에 반비례한다.
const DESKTOP_MODEL_SCALE = 0.8;
const MOBILE_BREAKPOINT = 768;
// 모바일 시안은 상자가 화면 폭보다 조금 넓게 잘려 나간다.
const MOBILE_FIT_MARGIN = 1.24;
// 시안의 상자는 화면 중앙보다 조금 아래에 놓인다.
const MOBILE_LOOK_AT_Y = 0.33;

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
    const designDistance =
      (MODEL_RADIUS / Math.tan(verticalFov / 2)) * FIT_MARGIN;

    const isMobile = size.width < MOBILE_BREAKPOINT;
    let distance;

    if (isMobile) {
      // 세로 화면에서는 높이가 아니라 폭에 맞춰야 상자가 시안만큼 커진다.
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
      distance =
        (MODEL_RADIUS / Math.tan(horizontalFov / 2)) * MOBILE_FIT_MARGIN;
    } else {
      // 모델의 화면상 크기를 1440x900 기준 대비 뷰포트 비율만큼 키우거나 줄인다.
      const viewportScale = Math.min(
        size.width / DESIGN_WIDTH,
        size.height / DESIGN_HEIGHT,
      );
      distance =
        (designDistance * (size.height / DESIGN_HEIGHT)) /
        viewportScale /
        DESKTOP_MODEL_SCALE;
    }

    camera.aspect = aspect;
    camera.position.copy(
      new Vector3(4, 2.5, 5).normalize().multiplyScalar(distance),
    );
    camera.near = 0.1;
    camera.far = 100;
    camera.lookAt(0, isMobile ? MOBILE_LOOK_AT_Y : 0, 0);
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
    </Canvas>
  );
}

export default ModelViewer;
