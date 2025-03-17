import { RigidBody } from '@react-three/rapier'
import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react'

export interface CubeData {
  height: number;
  position: [number, number, number];
  color: string;
  index: number;
}

export interface CubesRef {
  moveCube: (index: number, newPosition: { x: number; y: number; z: number }) => void;
  getCubePositions: () => { height: number; position: [number, number, number] }[];
}

const CUBE_COLORS = ['red', 'yellow', 'purple', 'cyan', 'orange', 'pink', 'green', 'blue']
const BASE_SPACING = 3 // Space between cubes
const START_X = -14 // Starting X position for first cube

export const Cubes = forwardRef<CubesRef>((_, ref) => {
  // Create 8 cubes with different heights
  const initialCubes: CubeData[] = CUBE_COLORS.map((color, i) => ({
    height: i + 1, // Heights from 1 to 8
    position: [START_X + (i * BASE_SPACING), (i + 1) / 2, 0] as [number, number, number], // Divide height by 2 as that's the center point
    color,
    index: i
  }))

  // Shuffle the cubes randomly but keep their indices
  const shuffledCubes = [...initialCubes]
    .sort(() => Math.random() - 0.5)
    .map((cube, i) => ({
      ...cube,
      // Always maintain a fixed X spacing between cubes, regardless of their height
      position: [START_X + (i * BASE_SPACING), cube.height / 2, 0] as [number, number, number]
    }))

  const [cubes, setCubes] = useState<CubeData[]>(shuffledCubes)
  const cubeRefs = useRef<any[]>(Array(CUBE_COLORS.length).fill(null))

  // Ensure refs are initialized correctly
  useEffect(() => {
    console.log("Cubes component mounted with", cubes.length, "cubes");
  }, []);

  useImperativeHandle(ref, () => ({
    moveCube: (index: number, newPosition: { x: number; y: number; z: number }) => {
      if (cubeRefs.current[index]) {
        // Get the current cube
        const cube = cubes[index];
        if (!cube) {
          console.error(`No cube data found at index ${index}`);
          return;
        }

        // Ensure the cube's position is updated in the RigidBody
        cubeRefs.current[index].setTranslation(newPosition);
        
        // Update the cubes state array
        setCubes(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            position: [newPosition.x, newPosition.y, newPosition.z] as [number, number, number]
          };
          return updated;
        });
      } else {
        console.error(`Cube ref at index ${index} is not available`);
      }
    },
    getCubePositions: () => {
      return cubes.map(cube => ({
        height: cube.height,
        position: cube.position
      }))
    }
  }), [cubes])

  return (
    <>
      {cubes.map((cube, i) => (
        <RigidBody
          key={cube.index}
          ref={el => { cubeRefs.current[cube.index] = el }}
          type="fixed"
          position={cube.position}
        >
          <mesh castShadow>
            <boxGeometry args={[2, cube.height, 2]} />
            <meshStandardMaterial color={cube.color} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}) 