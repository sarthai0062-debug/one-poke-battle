import React from 'react'

export const LootToast = ({ message, isVisible }) => {
  if (!isVisible) return null

  return (
    <div
      id="lootToast"
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        padding: '10px 18px',
        border: '2px solid white',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: 20,
      }}
    >
      {message}
    </div>
  )
}

