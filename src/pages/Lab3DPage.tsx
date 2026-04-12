import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid, Sky } from '@react-three/drei';
import { Box, User, CarFront, Settings } from 'lucide-react';

// Placeholder Components
function CharacterPlaceholder() {
  return (
    <group position={[0, 1, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.4, 1, 4, 16]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.15, 1.25, 0.3]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.15, 1.25, 0.3]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

function BarnPlaceholder() {
  return (
    <group position={[0, 1.5, 0]}>
      {/* Base do Galpão */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 8]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.8} />
      </mesh>
      {/* Telhado */}
      <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.85, 2.85, 8, 4]} />
        <meshStandardMaterial color="#dc2626" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CarPlaceholder() {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Corpo */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color="#2563eb" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Cabine */}
      <mesh position={[0, 1.2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 2]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.1} metalness={0.9} transparent opacity={0.8} />
      </mesh>
      {/* Rodas */}
      {[[-1.1, 0, -1.2], [1.1, 0, -1.2], [-1.1, 0, 1.2], [1.1, 0, 1.2]].map((pos, idx) => (
        <mesh key={idx} position={pos as any} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
          <meshStandardMaterial color="#171717" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

type ModelType = 'character' | 'barn' | 'car';

export default function Lab3DPage() {
  const [activeModel, setActiveModel] = useState<ModelType>('character');

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-800">
      
      {/* Header / Controles */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-center">
        <div className="bg-zinc-950/80 backdrop-blur-md p-2 rounded-2xl flex gap-2 border border-zinc-800/50 shadow-xl">
          <button
            onClick={() => setActiveModel('character')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeModel === 'character' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <User size={18} />
            Personagem
          </button>
          <button
            onClick={() => setActiveModel('barn')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeModel === 'barn' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Box size={18} />
            Galpão
          </button>
          <button
            onClick={() => setActiveModel('car')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeModel === 'car' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CarFront size={18} />
            Veículo
          </button>
        </div>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-6 z-10 max-w-sm pointer-events-none">
        <div className="bg-zinc-950/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-800/50 shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-indigo-400">
            <Settings size={20} className="animate-spin-slow" />
            <h2 className="text-lg font-black tracking-tight">Laboratório 3D</h2>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Ambiente isolado para testes de modelos 3D, texturas e animações com React Three Fiber.
            Use o mouse para rotacionar e o scroll para dar zoom.
          </p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
        <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
          <color attach="background" args={['#18181b']} />
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            intensity={1.5}
            shadow-mapSize={[1024, 1024]}
          >
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
          </directionalLight>
          
          <Suspense fallback={null}>
            <Environment preset="city" />
            
            <group position={[0, -0.5, 0]}>
              <Grid
                position={[0, -0.01, 0]}
                args={[20, 20]}
                cellSize={1}
                cellThickness={1}
                cellColor="#3f3f46"
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#52525b"
                fadeDistance={30}
                fadeStrength={1}
              />
              <ContactShadows
                position={[0, 0, 0]}
                opacity={0.7}
                scale={20}
                blur={2}
                far={4.5}
              />

              <group key={activeModel}>
                {activeModel === 'character' && <CharacterPlaceholder />}
                {activeModel === 'barn' && <BarnPlaceholder />}
                {activeModel === 'car' && <CarPlaceholder />}
              </group>
            </group>
          </Suspense>

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 + 0.1}
            maxDistance={20}
            minDistance={2}
          />
        </Canvas>
      </div>
    </div>
  );
}
