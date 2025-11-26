import React from 'react'

export const PointsDisplay = ({ points }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.95)',
        border: '4px solid #000',
        padding: '10px 16px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        fontFamily: 'Press Start 2P, cursive',
      }}
    >
      <span style={{ fontSize: '12px', color: '#000' }}>⭐</span>
      <span style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
        {points.toLocaleString()} Stardust
      </span>
    </div>
  )
}

