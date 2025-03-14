import { RigidBody } from '@react-three/rapier'
import { useRef, forwardRef, useImperativeHandle } from 'react'

export interface CubesRef {
  moveCubes: (offset: { x: number; y: number; z: number }) => void;
}

export const Cubes = forwardRef<CubesRef>((_, ref) => {
  const redCubeRef = useRef<any>(null)
  const yellowCubeRef = useRef<any>(null)
  const purpleCubeRef = useRef<any>(null)
  const cyanCubeRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    moveCubes: (offset) => {
      const cubes = [redCubeRef, yellowCubeRef, purpleCubeRef, cyanCubeRef]
      cubes.forEach(cubeRef => {
        if (cubeRef.current) {
          const pos = cubeRef.current.translation()
          cubeRef.current.setTranslation({
            x: pos.x + offset.x,
            y: pos.y + offset.y,
            z: pos.z + offset.z
          })
        }
      })
    }
  }))

  return (
    <>
      {/* Red cube */}
      <RigidBody ref={redCubeRef} type="fixed" position={[5, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      {/* Yellow cube */}
      <RigidBody ref={yellowCubeRef} type="fixed" position={[-5, 1, -5]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      </RigidBody>

      {/* Purple cube */}
      <RigidBody ref={purpleCubeRef} type="fixed" position={[0, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="purple" />
        </mesh>
      </RigidBody>

      {/* Cyan cube */}
      <RigidBody ref={cyanCubeRef} type="fixed" position={[8, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      </RigidBody>
    </>
  )
}) 