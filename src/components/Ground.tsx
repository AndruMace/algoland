import { RigidBody } from '@react-three/rapier'

export function Ground() {
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
    </RigidBody>
  )
} 