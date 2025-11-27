import React from 'react'

export const InventoryPanel = ({ items, bonuses, onToggle }) => {
  return (
    <div
      id="inventoryPanel"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '240px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '4px solid #000',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 15,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        borderRadius: '4px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
          borderBottom: '3px solid #000',
          paddingBottom: '8px'
        }}
      >
        <h1 style={{ fontSize: '12px', margin: 0, fontFamily: 'Press Start 2P, cursive' }}>INVENTORY</h1>
        <button
          onClick={onToggle}
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #000',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Toggle inventory"
        />
      </div>
      
      <div
        id="inventoryList"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#888',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            No items collected yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px',
                border: '2px solid #000',
                borderRadius: '4px',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {item.gifPath && (
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={item.gifPath}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                  />
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1,
                justifyContent: 'center',
                gap: '2px'
              }}>
                <strong style={{ 
                  fontSize: '10px',
                  fontFamily: 'Press Start 2P, cursive',
                  color: '#000',
                  lineHeight: '1.3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  {item.name}
                </strong>
                <span style={{ 
                  fontSize: '9px', 
                  color: '#555',
                  lineHeight: '1.3'
                }}>
                  {item.description}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {bonuses.length > 0 && (
        <div
          id="inventoryEffects"
          style={{
            fontSize: '9px',
            borderTop: '2px solid #000',
            paddingTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            padding: '8px',
            borderRadius: '4px',
            border: '2px solid #000'
          }}
        >
          <strong style={{ fontSize: '9px', marginBottom: '2px', fontFamily: 'Press Start 2P, cursive' }}>
            BONUSES:
          </strong>
          {bonuses.map((bonus, index) => (
            <span key={index} style={{ fontSize: '8px', color: '#333' }}>• {bonus}</span>
          ))}
        </div>
      )}
    </div>
  )
}

