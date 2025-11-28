import React from 'react'

export const InstructionsDialogue = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: 'Press Start 2P, cursive',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '4px solid #000',
          padding: '20px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          color: '#000',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '16px', textAlign: 'center', borderBottom: '3px solid #000', paddingBottom: '12px' }}>
          <h1
            style={{
              margin: '0',
              fontSize: '16px',
              color: '#000',
              fontFamily: 'Press Start 2P, cursive',
            }}
          >
            HOW TO PLAY
          </h1>
        </div>

        <div style={{ fontSize: '8px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>MOVEMENT:</strong>
            <div style={{ paddingLeft: '8px' }}>
              <div>WASD - Move | Shift - Sprint | Space - Jump/Interact</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>BATTLE:</strong>
            <div style={{ paddingLeft: '8px' }}>
              <div>Walk on grass → Random battles</div>
              <div>Click attacks → Win = 50 Stardust</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>COLLECT:</strong>
            <div style={{ paddingLeft: '8px' }}>
              <div>Find glowing points → 100 Stardust each</div>
              <div>Collect items → Battle bonuses</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>MARKETPLACE:</strong>
            <div style={{ paddingLeft: '8px' }}>
              <div>Talk to vendor NPC → Buy items</div>
              <div>Press Esc/M to close</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '9px', display: 'block', marginBottom: '4px' }}>WALLET:</strong>
            <div style={{ paddingLeft: '8px' }}>
              <div>Connect wallet → Save progress</div>
              <div>Stardust saved per wallet</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '3px solid #000', paddingTop: '12px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: '3px solid #000',
              padding: '8px 24px',
              fontSize: '10px',
              fontFamily: 'Press Start 2P, cursive',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#000'
              e.target.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff'
              e.target.style.color = '#000'
            }}
          >
            START
          </button>
        </div>
      </div>
    </div>
  )
}

