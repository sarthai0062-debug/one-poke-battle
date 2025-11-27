import React from 'react'

export const PointsDisplay = ({ points, inventoryVisible, onToggleInventory, canToggleInventory }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'Press Start 2P, cursive'
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 215, 0, 0.95)',
          border: '3px solid #000',
          padding: '6px 18px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        <span style={{ fontSize: '13px', color: '#000' }}>⭐</span>
        <span style={{ fontSize: '13px', color: '#000', fontWeight: 'bold' }}>
          {points.toLocaleString()} Stardust
        </span>
      </div>
      {canToggleInventory && (
        <button
          onClick={onToggleInventory}
          style={{
            fontFamily: 'inherit',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '5px 14px',
            backgroundColor: inventoryVisible ? '#222' : '#4CAF50',
            color: 'white',
            border: '3px solid #000',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)'
          }}
        >
          {inventoryVisible ? 'Hide Inventory' : 'Show Inventory'}
        </button>
      )}
    </div>
  )
}

