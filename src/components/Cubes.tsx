import { RigidBody } from '@react-three/rapier'

export function Cubes() {
  return (
    <>
      {/* Red cube */}
      <RigidBody type="fixed" position={[5, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      {/* Yellow cube */}
      <RigidBody type="fixed" position={[-5, 1, -5]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      </RigidBody>

      {/* Purple cube */}
      <RigidBody type="fixed" position={[0, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="purple" />
        </mesh>
      </RigidBody>

      {/* Cyan cube */}
      <RigidBody type="fixed" position={[8, 1, -8]}>
        <mesh castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      </RigidBody>
    </>
  )
} 