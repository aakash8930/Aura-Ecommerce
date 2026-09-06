'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
  Text,
  Html
} from '@react-three/drei';
import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import styles from './ProductViewer3D.module.css';

interface ProductViewer3DProps {
  productName: string;
  productPrice: number;
  productImage?: string;
  onAddToCart?: () => void;
}

// Animated 3D Product Box Component
function ProductBox({ 
  rotationSpeed = 0.5 
}: { 
  rotationSpeed: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation based on mouse position and hover state
      const targetRotationY = state.pointer.x * 0.5;
      const targetRotationX = state.pointer.y * 0.3;
      
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 5 * delta;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 5 * delta;
      
      // Add subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group 
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Main Product Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          roughness={0.2}
          transmission={0.95}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color={hovered ? "#818cf8" : "#6366f1"}
        />
      </mesh>
      
      {/* Inner Glow Core */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#a5b4fc"
          emissive="#6366f1"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      
      {/* Corner Accents */}
      {[[-1.25, 1.25, 1.25], [1.25, 1.25, 1.25], [-1.25, -1.25, 1.25], [1.25, -1.25, 1.25],
        [-1.25, 1.25, -1.25], [1.25, 1.25, -1.25], [-1.25, -1.25, -1.25], [1.25, -1.25, -1.25]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={1}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Floating Particles */}
      <Particles count={50} />
    </group>
  );
}

// Particle System
function Particles({ count = 50 }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.05;
      points.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#818cf8"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Loading Spinner
function Loader() {
  return (
    <Html center>
      <div className={styles.loader}>
        <div className={styles.spinner} />
      </div>
    </Html>
  );
}

// Main 3D Viewer Component
export default function ProductViewer3D({ 
  productName, 
  productPrice,
  productImage,
  onAddToCart 
}: ProductViewer3DProps) {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [zoom, setZoom] = useState(1);

  return (
    <div className={styles.viewerContainer}>
      {/* Control Overlay */}
      <div className={styles.controlsOverlay}>
        <button 
          className={styles.controlBtn}
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "Pause rotation" : "Enable rotation"}
        >
          {isAutoRotating ? "⏸" : "▶"}
        </button>
        <button 
          className={styles.controlBtn}
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          title="Zoom in"
        >
          🔍+
        </button>
        <button 
          className={styles.controlBtn}
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          title="Zoom out"
        >
          🔍-
        </button>
        <button 
          className={styles.controlBtn}
          onClick={() => setZoom(1)}
          title="Reset view"
        >
          ⟲
        </button>
      </div>

      {/* Info Badge */}
      <div className={styles.infoBadge}>
        <span className={styles.badgeText}>✨ Interactive 3D Preview</span>
        <span className={styles.badgeSub}>Drag to rotate • Scroll to zoom</span>
      </div>

      {/* 3D Canvas */}
      <div className={styles.canvasWrapper}>
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.15} 
              penumbra={1} 
              intensity={1} 
              castShadow 
            />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            {/* Environment */}
            <Environment preset="city" />
            
            {/* Animated Product */}
            <Float 
              speed={2} 
              rotationIntensity={0.5} 
              floatIntensity={0.5}
            >
              <ProductBox rotationSpeed={0.5} />
            </Float>
            
            {/* Shadows */}
            <ContactShadows
              position={[0, -2.5, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
            
            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={10}
              autoRotate={isAutoRotating}
              autoRotateSpeed={1}
              dampingFactor={0.05}
              enableDamping
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Product Info Panel */}
      <div 
        className={styles.productInfoPanel}
        style={{
          opacity: 0,
          transform: 'translateY(20px)',
          animation: 'fadeInUp 0.6s ease-out 0.3s forwards'
        }}
      >
        <h2 className={styles.productName}>{productName}</h2>
        <p className={styles.productPrice}>${productPrice.toFixed(2)}</p>
        
        {onAddToCart && (
          <button
            className={styles.addToCartBtn}
            onClick={onAddToCart}
          >
            <span>Add to Cart</span>
            <span className={styles.btnArrow}>→</span>
          </button>
        )}
        
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🎨</span>
            <span>Premium Quality</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Instant Download</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>∞</span>
            <span>Lifetime Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
