interface ControlsUIProps {
  isLocked: boolean;
}

export function ControlsUI({ isLocked }: ControlsUIProps) {
  if (isLocked) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Controls</h3>
      <div style={{ display: 'grid', gap: '5px' }}>
        <div>W - Move Forward</div>
        <div>S - Move Backward</div>
        <div>A - Move Left</div>
        <div>D - Move Right</div>
        <div>Space - Jump</div>
        <div>Mouse - Look Around</div>
        <div>E - Toggle Game/Editor Mode</div>
      </div>
    </div>
  )
} 