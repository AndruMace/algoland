import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useRef, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { ControlsUI } from './components/ControlsUI'
import { Player } from './components/Player'
import { Cubes, CubesRef } from './components/Cubes'
import { Ground } from './components/Ground'
import './App.css'

// Declare the window interface
declare global {
  interface Window {
    moveCubes: (offset: { x: number; y: number; z: number }) => void;
  }
}

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [code, setCode] = useState(`// Write your code here
// This code will move all cubes up by one unit when executed
function moveCubesUp() {
  window.moveCubes({ x: 0, y: 1, z: 0 });
}

// Execute the function
moveCubesUp();`)
  const controlsRef = useRef<any>(null)
  const cubesRef = useRef<CubesRef>(null)

  useEffect(() => {
    const handleLockChange = () => setIsLocked(document.pointerLockElement !== null)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        document.pointerLockElement 
          ? document.exitPointerLock()
          : controlsRef.current?.lock()
      }
    }

    // Expose moveCubes function to the window for code execution
    window.moveCubes = (offset: { x: number; y: number; z: number }) => {
      cubesRef.current?.moveCubes(offset)
    }

    document.addEventListener('pointerlockchange', handleLockChange)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange)
      document.removeEventListener('keydown', handleKeyDown)
      // Clean up window function
      delete (window as any).moveCubes
    }
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '')
  }

  const executeCode = () => {
    try {
      // Create a new Function from the code and execute it
      new Function(code)()
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas shadows>
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <Cubes ref={cubesRef} />
            <Ground />
          </Physics>
        </Canvas>
      </div>

      <div className="overlay-hover" style={{ position: 'fixed', top: 0, left: 0 }}>
        <ControlsUI isLocked={isLocked} />
      </div>

      <div className="overlay-hover" style={{ 
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '40%',
        height: '40%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={executeCode}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Run Code
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}

export default App
