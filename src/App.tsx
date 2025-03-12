import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useRef, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { ControlsUI } from './components/ControlsUI'
import { Player } from './components/Player'
import { Cubes } from './components/Cubes'
import { Ground } from './components/Ground'
import './App.css'

function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [code, setCode] = useState(`// Write your code here
function example() {
  console.log("Hello, AlgoLand!");
}
`);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        // If we're not locked, request lock
        if (!document.pointerLockElement && controlsRef.current) {
          controlsRef.current.lock();
        } else if (document.pointerLockElement) {
          // If we are locked, unlock
          document.exitPointerLock();
        }
      }
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const overlayStyle = {
    opacity: 0.5,
    transition: 'opacity 0.3s ease',
    WebkitTransition: 'opacity 0.3s ease',
    '&:hover': {
      opacity: 1
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Game Canvas - Full Screen */}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas shadows>
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <Cubes />
            <Ground />
          </Physics>
        </Canvas>
      </div>

      {/* Controls UI - Top Left */}
      <div 
        className="overlay-hover"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          opacity: 0.5,
          transition: 'opacity 0.3s ease'
        }}
      >
        <ControlsUI isLocked={isLocked} />
      </div>

      {/* Editor - Top Right */}
      <div 
        className="overlay-hover"
        style={{ 
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40%',
          height: '40%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          overflow: 'hidden',
          opacity: 0.5,
          transition: 'opacity 0.3s ease'
        }}
      >
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default App
