import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'

export function Player() {
  const playerRef = useRef<any>(null)
  const moveDirection = useRef(new Vector3())
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    // Initialize player position
    if (playerRef.current) {
      playerRef.current.setTranslation({ x: 0, y: 2, z: 0 })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLocked) return
      const speed = 4
      switch(e.key.toLowerCase()) {
        case 'w': moveDirection.current.z = speed; break
        case 's': moveDirection.current.z = -speed; break
        case 'a': moveDirection.current.x = -speed; break
        case 'd': moveDirection.current.x = speed; break
        case ' ':
          if (playerRef.current) {
            playerRef.current.applyImpulse({ x: 0, y: 5, z: 0 })
          }
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isLocked) return
      switch(e.key.toLowerCase()) {
        case 'w':
        case 's': moveDirection.current.z = 0; break
        case 'a':
        case 'd': moveDirection.current.x = 0; break
      }
    }

    // Click handler to lock controls
    const handleClick = () => {
      if (controlsRef.current && !isLocked) {
        controlsRef.current.lock()
      }
    }

    // Handle pointer lock change from the document
    const handleLockChange = () => {
      const locked = document.pointerLockElement !== null
      setIsLocked(locked)
      if (!locked) moveDirection.current.set(0, 0, 0)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('click', handleClick)
    document.addEventListener('pointerlockchange', handleLockChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('pointerlockchange', handleLockChange)
    }
  }, [isLocked])

  useFrame((state) => {
    if (playerRef.current && isLocked) {
      const cameraDirection = new Vector3()
      state.camera.getWorldDirection(cameraDirection)
      
      const rightVector = new Vector3()
      rightVector.crossVectors(cameraDirection, new Vector3(0, 1, 0)).normalize()
      
      const forwardVector = new Vector3()
      forwardVector.crossVectors(rightVector, new Vector3(0, 1, 0)).normalize()

      const finalMovement = new Vector3()
      finalMovement.addScaledVector(rightVector, moveDirection.current.x)
      finalMovement.addScaledVector(forwardVector, -moveDirection.current.z)
      
      const linvel = playerRef.current.linvel()
      playerRef.current.setLinvel({
        x: finalMovement.x,
        y: linvel.y,
        z: finalMovement.z
      })

      const position = playerRef.current.translation()
      state.camera.position.set(position.x, position.y + 1.5, position.z)
    }
  })

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <RigidBody
        ref={playerRef}
        colliders={false}
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
        lockRotations
        type="dynamic"
        linearDamping={0.5}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
      </RigidBody>
    </>
  )
}