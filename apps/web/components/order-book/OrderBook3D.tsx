'use client';

import { useRef, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { PriceLevel } from '@/types/trading';

// Error boundary for catching WebGL errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OrderBook3D WebGL Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Check WebGL support
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

interface OrderBook3DProps {
  bids: PriceLevel[];
  asks: PriceLevel[];
  midPrice: number;
}

interface BarProps {
  position: [number, number, number];
  height: number;
  color: string;
  price: number;
  size: number;
}

function Bar({ position, height, color, price, size }: BarProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
}

interface OrderBookMeshProps {
  bids: PriceLevel[];
  asks: PriceLevel[];
  midPrice: number;
}

function OrderBookMesh({ bids, asks, midPrice }: OrderBookMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Normalize sizes for visualization
  const { normalizedBids, normalizedAsks, maxHeight } = useMemo(() => {
    const allSizes = [...bids, ...asks].map((l) => l.size);
    const maxSize = Math.max(...allSizes, 1);
    const maxHeight = 5; // Max bar height

    return {
      normalizedBids: bids.slice(0, 15).map((l) => ({
        ...l,
        normalizedHeight: (l.size / maxSize) * maxHeight,
      })),
      normalizedAsks: asks.slice(0, 15).map((l) => ({
        ...l,
        normalizedHeight: (l.size / maxSize) * maxHeight,
      })),
      maxHeight,
    };
  }, [bids, asks]);

  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bids (green, left side) */}
      {normalizedBids.map((level, i) => (
        <Bar
          key={`bid-${level.price}`}
          position={[-(i + 1) * 1.2, level.normalizedHeight / 2, 0]}
          height={level.normalizedHeight}
          color="#22c55e"
          price={level.price}
          size={level.size}
        />
      ))}

      {/* Asks (red, right side) */}
      {normalizedAsks.map((level, i) => (
        <Bar
          key={`ask-${level.price}`}
          position={[(i + 1) * 1.2, level.normalizedHeight / 2, 0]}
          height={level.normalizedHeight}
          color="#ef4444"
          price={level.price}
          size={level.size}
        />
      ))}

      {/* Center line / mid price indicator */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.1, 2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Floor grid */}
      <gridHelper args={[40, 40, '#374151', '#1f2937']} position={[0, 0, 0]} />

      {/* Labels */}
      <Text
        position={[-10, -0.5, 2]}
        fontSize={0.8}
        color="#22c55e"
        anchorX="center"
      >
        BIDS
      </Text>
      <Text
        position={[10, -0.5, 2]}
        fontSize={0.8}
        color="#ef4444"
        anchorX="center"
      >
        ASKS
      </Text>
      <Text
        position={[0, 0.5, 2]}
        fontSize={0.5}
        color="#fbbf24"
        anchorX="center"
      >
        ${midPrice.toFixed(2)}
      </Text>
    </group>
  );
}

// Fallback component for when WebGL is not available
function WebGLFallback({ error }: { error?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
      <svg
        className="w-12 h-12 mb-3 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <p className="text-sm font-medium mb-1">3D View Unavailable</p>
      <p className="text-xs text-center px-4">
        {error || 'WebGL is required for the 3D visualization. Try using the 2D view instead.'}
      </p>
    </div>
  );
}

export function OrderBook3D({ bids, asks, midPrice }: OrderBook3DProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(isWebGLSupported());
  }, []);

  // Loading state while checking WebGL
  if (webGLSupported === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <p className="text-xs text-muted-foreground">Loading 3D view...</p>
      </div>
    );
  }

  // WebGL not supported
  if (!webGLSupported) {
    return <WebGLFallback error="Your browser doesn't support WebGL." />;
  }

  return (
    <WebGLErrorBoundary fallback={<WebGLFallback error="An error occurred rendering the 3D view." />}>
      <div className="w-full h-full bg-[#0a0a0a]">
        <Canvas
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            // Check if context was created successfully
            if (!gl.getContext()) {
              throw new Error('WebGL context creation failed');
            }
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 8, 20]} fov={50} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, 10, -5]} intensity={0.4} />

          {/* Order book visualization */}
          <OrderBookMesh bids={bids} asks={asks} midPrice={midPrice} />

          {/* Background */}
          <color attach="background" args={['#0a0a0a']} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
