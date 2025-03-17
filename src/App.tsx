import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useRef, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { ControlsUI } from './components/ControlsUI'
import { Player } from './components/Player'
import { Cubes, CubesRef } from './components/Cubes'
import { Ground } from './components/Ground'
import './App.css'

// Add type declaration for window interface
declare global {
  interface Window {
    cubes: {
      heights: number[];
      swap: (i: number, j: number) => Promise<void>;
      refresh: () => void;
    };
  }
}

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [code, setCode] = useState(`// Sort the cubes from shortest to tallest
// cubes.heights shows the current heights of the cubes
// cubes.swap(i, j) swaps the positions of cubes at indices i and j

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort() {
  // Refresh the heights array before starting
  cubes.refresh();
  console.log('Starting sort. Initial heights:', cubes.heights);
  const n = cubes.heights.length;
  
  // Highlight each step with a longer delay
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent cubes
      if (cubes.heights[j] > cubes.heights[j + 1]) {
        // Swap them if they're in the wrong order
        await cubes.swap(j, j + 1);
        swapped = true;
        // Add a small delay to make the animation visible
        await sleep(500);
      }
    }
    // If no swapping occurred in this pass, array is sorted
    if (!swapped) break;
  }
  console.log('Sort complete. Final heights:', cubes.heights);
}

// Run the sorting algorithm
bubbleSort();`)

  const cubesRef = useRef<CubesRef>(null)
  const controlsRef = useRef<any>(null)

  // Helper function to refresh the heights array
  const refreshHeights = () => {
    if (cubesRef.current) {
      const positions = cubesRef.current.getCubePositions();
      window.cubes.heights = positions.map(p => p.height);
      console.log('Refreshed heights:', window.cubes.heights);
    } else {
      console.error('cubesRef is not available for refresh');
    }
  };

  useEffect(() => {
    const handleLockChange = () => setIsLocked(document.pointerLockElement !== null)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        document.pointerLockElement 
          ? document.exitPointerLock()
          : controlsRef.current?.lock()
      }
    }

    // Expose cubes API to window
    window.cubes = {
      heights: [],
      swap: async (i: number, j: number) => {
        console.log(`Swapping indices ${i} and ${j}`);
        if (!cubesRef.current) {
          console.error('cubesRef is not available');
          return Promise.resolve();
        }
        
        const positions = cubesRef.current.getCubePositions();
        
        // Ensure positions array has the correct elements
        if (i >= positions.length || j >= positions.length) {
          console.error(`Invalid indices: i=${i}, j=${j}, positions.length=${positions.length}`);
          return Promise.resolve();
        }
        
        // Get current positions
        const posI = positions[i].position;
        const posJ = positions[j].position;
        const heightI = positions[i].height;
        const heightJ = positions[j].height;

        // Only swap X positions, keep their own heights and Z positions
        cubesRef.current.moveCube(i, { 
          x: posJ[0], 
          y: heightI / 2, // Keep its own height
          z: 0 
        });
        
        cubesRef.current.moveCube(j, { 
          x: posI[0], 
          y: heightJ / 2, // Keep its own height
          z: 0 
        });

        // Update heights array after swap
        const temp = window.cubes.heights[i];
        window.cubes.heights[i] = window.cubes.heights[j];
        window.cubes.heights[j] = temp;
        
        // Wait a bit to ensure the movement completes
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return Promise.resolve();
      },
      refresh: refreshHeights
    };

    // Initialize heights - but do it after a small delay to ensure the component is fully mounted
    setTimeout(refreshHeights, 500);

    document.addEventListener('pointerlockchange', handleLockChange)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange)
      document.removeEventListener('keydown', handleKeyDown)
      // @ts-ignore - ignore the TypeScript error for delete
      delete window.cubes;
    }
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '')
  }

  const executeCode = () => {
    try {
      // Refresh heights before running code
      refreshHeights();
      
      // Create a new async Function from the code and execute it
      new Function('return (async () => { ' + code + ' })()')().catch((error: Error) => {
        console.error('Error in async execution:', error);
      });
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="game-area" style={{ width: '100%', height: '100%' }}>
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

      <div className="overlay-hover code-editor-container" style={{ 
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
          className="editor"
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
