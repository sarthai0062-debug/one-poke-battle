import React from 'react'

export const InventoryPanel = ({ items, bonuses }) => {
  return (
    <div
      id="inventoryPanel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '260px',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '4px solid black',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 15
      }}
    >
      <h1 style={{ fontSize: '14px' }}>Inventory</h1>
      <div
        id="inventoryList"
        style={{
          fontSize: '12px',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {items.length === 0 ? (
          <span>No items collected yet.</span>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <strong style={{ fontSize: '12px' }}>{item.name}</strong>
              <span style={{ fontSize: '11px' }}>{item.description}</span>
            </div>
          ))
        )}
      </div>
      <div
        id="inventoryEffects"
        style={{
          fontSize: '11px',
          borderTop: '2px solid black',
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {bonuses.length === 0 ? (
          <span>No item bonuses active.</span>
        ) : (
          bonuses.map((bonus, index) => (
            <span key={index}>{bonus}</span>
          ))
        )}
      </div>
    </div>
  )
}

