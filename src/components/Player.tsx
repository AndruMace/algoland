import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'

export function Player() {
  const playerRef = useRef<any>(null!)
  const moveDirection = useRef(new Vector3())
  const isJumping = useRef(false)
  const controlsRef = useRef<any>(null!)
  const [canLock, setCanLock] = useState(true)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const handleLockChange = () => {
      const locked = document.pointerLockElement !== null
      setIsLocked(locked)
      // Reset movement when unlocking
      if (!locked) {
        moveDirection.current.set(0, 0, 0)
      }
    }

    const handleLockError = () => {
      console.warn('Pointer lock error - waiting before retry')
      setCanLock(false)
      setTimeout(() => setCanLock(true), 1000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCanLock(false)
        setTimeout(() => setCanLock(true), 1000)
      }
    }

    document.addEventListener('pointerlockchange', handleLockChange)
    document.addEventListener('pointerlockerror', handleLockError)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange)
      document.removeEventListener('pointerlockerror', handleLockError)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle movement if pointer is locked
      if (!isLocked) return

      const speed = 4
      switch(e.key.toLowerCase()) {
        case 'w':
          moveDirection.current.z = speed
          break
        case 's':
          moveDirection.current.z = -speed
          break
        case 'a':
          moveDirection.current.x = -speed
          break
        case 'd':
          moveDirection.current.x = speed
          break
        case ' ':
          if (!isJumping.current) {
            playerRef.current?.applyImpulse({ x: 0, y: 5, z: 0 })
            isJumping.current = true
            setTimeout(() => {
              isJumping.current = false
            }, 1000)
          }
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Only handle movement if pointer is locked
      if (!isLocked) return

      switch(e.key.toLowerCase()) {
        case 'w':
        case 's':
          moveDirection.current.z = 0
          break
        case 'a':
        case 'd':
          moveDirection.current.x = 0
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isLocked]) // Add isLocked to dependencies

  useFrame((state) => {
    if (playerRef.current && controlsRef.current && isLocked) {
      // Get the camera's forward direction
      const cameraDirection = new Vector3();
      state.camera.getWorldDirection(cameraDirection);
      
      // Calculate right vector from camera direction
      const rightVector = new Vector3();
      rightVector.crossVectors(cameraDirection, new Vector3(0, 1, 0)).normalize();
      
      // Calculate forward vector (but keep it horizontal)
      const forwardVector = new Vector3();
      forwardVector.crossVectors(rightVector, new Vector3(0, 1, 0)).normalize();

      // Create movement vector based on input
      const movement = new Vector3(
        moveDirection.current.x,
        0,
        moveDirection.current.z
      );

      // Apply movement relative to camera orientation
      const finalMovement = new Vector3();
      finalMovement.addScaledVector(rightVector, movement.x);
      finalMovement.addScaledVector(forwardVector, -movement.z);
      
      // Get current velocity and preserve vertical component
      const linvel = playerRef.current.linvel();
      
      // Apply movement
      playerRef.current.setLinvel({
        x: finalMovement.x,
        y: linvel.y, // Preserve vertical velocity for gravity/jumping
        z: finalMovement.z
      });

      // Update position
      const position = playerRef.current.translation();
      
      // Update camera position to follow player
      state.camera.position.x = position.x;
      state.camera.position.y = position.y + 1.5; // Head height
      state.camera.position.z = position.z;
    }
  })

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <mesh>
        <RigidBody
          ref={playerRef}
          colliders={false}
          position={[0, 2, 0]}
          enabledRotations={[false, false, false]}
          lockRotations
        >
          <CapsuleCollider args={[0.5, 0.5]} />
        </RigidBody>
      </mesh>
    </>
  )
} 