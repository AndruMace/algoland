import { useRef, useEffect, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'

export function Player() {
  const playerRef = useRef<any>(null)
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const [isLocked, setIsLocked] = useState(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const lastPosition = useRef<[number, number, number]>([0, 2, 10])

  // Reset keys on component mount
  useEffect(() => {
    keysPressed.current.clear();
    
    return () => {
      keysPressed.current.clear();
    };
  }, []);

  // Main event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keys if the pointer is locked and we're in the game
      if (!isLocked) return;
      
      keysPressed.current.add(e.key.toLowerCase())
      
      // Handle jumping
      if (e.key === ' ' && playerRef.current) {
        // Only jump if we're on or near the ground
        const velocity = playerRef.current.linvel()
        if (Math.abs(velocity.y) < 0.1) {
          playerRef.current.setLinvel({ x: velocity.x, y: 5, z: velocity.z })
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
    }

    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.code-editor-container')) {
        controlsRef.current?.lock()
      }
    }

    const handleLockChange = () => {
      const locked = document.pointerLockElement !== null;
      
      if (isLocked && !locked) {
        // Switching from locked to unlocked
        // Store position before unlocking
        if (playerRef.current) {
          const pos = playerRef.current.translation();
          lastPosition.current = [pos.x, pos.y, pos.z];
        }
        
        // Clear keys when unlocking
        keysPressed.current.clear();
      }
      
      setIsLocked(locked);
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

  // Restore position on lock change
  useEffect(() => {
    if (isLocked && playerRef.current) {
      // We're now locked, restore the position
      const [x, y, z] = lastPosition.current;
      playerRef.current.setTranslation({ x, y, z });
    }
  }, [isLocked]);

  useFrame((state) => {
    if (!playerRef.current || !isLocked) return

    const speed = 4
    const position = playerRef.current.translation()
    
    // Update camera
    state.camera.position.set(position.x, position.y + 1.5, position.z)

    // Get movement direction
    const cameraDirection = new Vector3()
    state.camera.getWorldDirection(cameraDirection)
    const forward = new Vector3(cameraDirection.x, 0, cameraDirection.z).normalize()
    const right = new Vector3(-forward.z, 0, forward.x)

    // Calculate movement
    const movement = new Vector3()
    if (keysPressed.current.has('w')) movement.add(forward)
    if (keysPressed.current.has('s')) movement.sub(forward)
    if (keysPressed.current.has('a')) movement.sub(right)
    if (keysPressed.current.has('d')) movement.add(right)
    
    // Apply movement while preserving vertical velocity
    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(speed)
      const velocity = playerRef.current.linvel()
      playerRef.current.setLinvel({ 
        x: movement.x, 
        y: velocity.y, // Preserve vertical velocity for gravity/jumping
        z: movement.z 
      })
    } else {
      // Stop horizontal movement when no keys are pressed
      const velocity = playerRef.current.linvel()
      playerRef.current.setLinvel({ 
        x: 0, 
        y: velocity.y, 
        z: 0 
      })
    }
  })

  return (
    <>
      <PointerLockControls ref={controlsRef} selector=".game-area" />
      <RigidBody
        ref={playerRef}
        type="dynamic"
        position={[0, 2, 10]}
        enabledRotations={[false, false, false]}
        lockRotations
        friction={0.5}
        mass={1}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
      </RigidBody>
    </>
  )
}