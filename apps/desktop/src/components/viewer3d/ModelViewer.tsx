import { Suspense, useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, useGLTF, Center, Bounds } from '@react-three/drei';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import { RotateCcw, ZoomIn, ZoomOut, Grid3X3, Sun, Camera, Maximize } from 'lucide-react';
import { filesApi } from '@/utils/api';

interface ModelViewerProps {
  fileId: string;
  extension: string;
  fileName: string;
  onClose?: () => void;
  fullscreen?: boolean;
}

export default function ModelViewer({ fileId, extension, fileName, onClose, fullscreen }: ModelViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [background, setBackground] = useState<'dark' | 'light' | 'studio'>('dark');
  const controlsRef = useRef<any>(null);
  const url = filesApi.getDownloadUrl(fileId);

  const bgColors: Record<string, string> = {
    dark: '#0A0A0A', light: '#F5F5F7', studio: '#1C1C2E',
  };

  const resetCamera = () => controlsRef.current?.reset();

  return (
    <div className="flex flex-col h-full rounded-apple-lg overflow-hidden" style={{ background: bgColors[background] }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 gap-2" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
        <span className="text-xs font-medium text-white truncate">{fileName}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {[
            { icon: RotateCcw, label: 'Reset', action: resetCamera },
            { icon: Grid3X3, label: 'Grid', action: () => setShowGrid(g => !g), active: showGrid },
            { icon: Camera, label: 'Wireframe', action: () => setWireframe(w => !w), active: wireframe },
          ].map(({ icon: Icon, label, action, active }) => (
            <button key={label} onClick={action} title={label}
              className="w-7 h-7 rounded-apple flex items-center justify-center transition-all"
              style={{ background: active ? 'rgba(0,122,255,0.3)' : 'rgba(255,255,255,0.1)', color: active ? '#0A84FF' : 'rgba(255,255,255,0.7)' }}
            >
              <Icon size={13} />
            </button>
          ))}
          {/* Background toggle */}
          <button
            onClick={() => setBackground(b => b === 'dark' ? 'light' : b === 'light' ? 'studio' : 'dark')}
            className="px-2 py-0.5 rounded-apple text-[10px] transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            title="Cambiar fondo"
          >
            BG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
          <color attach="background" args={[bgColors[background]]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          {showGrid && <Grid infiniteGrid fadeDistance={30} cellColor="#444" sectionColor="#555" />}

          <Suspense fallback={<LoadingMesh />}>
            <Bounds fit clip observe>
              <Center>
                <ModelMesh url={url} extension={extension} wireframe={wireframe} />
              </Center>
            </Bounds>
          </Suspense>

          <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>

      <div className="px-3 py-1.5 text-[10px] text-center" style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.4)' }}>
        Click + Arrastrar: Rotar · Scroll: Zoom · Click derecho: Pan
      </div>
    </div>
  );
}

function ModelMesh({ url, extension, wireframe }: { url: string; extension: string; wireframe: boolean }) {
  const ext = extension.toLowerCase();

  if (ext === 'stl') return <STLMesh url={url} wireframe={wireframe} />;
  if (ext === 'obj') return <OBJMesh url={url} wireframe={wireframe} />;
  if (ext === 'glb' || ext === 'gltf') return <GLTFMesh url={url} wireframe={wireframe} />;
  return null;
}

function STLMesh({ url, wireframe }: { url: string; wireframe: boolean }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh castShadow receiveShadow geometry={geometry}>
      <meshStandardMaterial color="#B0B0C0" metalness={0.2} roughness={0.6} wireframe={wireframe} />
    </mesh>
  );
}

function OBJMesh({ url, wireframe }: { url: string; wireframe: boolean }) {
  const obj = useLoader(OBJLoader, url);
  if (wireframe) {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ wireframe: true, color: '#0A84FF' });
      }
    });
  }
  return <primitive object={obj} />;
}

function GLTFMesh({ url, wireframe }: { url: string; wireframe: boolean }) {
  const { scene } = useGLTF(url);
  if (wireframe) {
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ wireframe: true, color: '#0A84FF' });
      }
    });
  }
  return <primitive object={scene} />;
}

function LoadingMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2C2C2E" wireframe />
    </mesh>
  );
}
