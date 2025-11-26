import React from 'react'

export const BattleUI = ({ 
  isVisible, 
  enemyHealth, 
  playerHealth, 
  attacks, 
  selectedAttackType,
  dialogueText,
  isDialogueVisible,
  onAttackClick,
  onAttackHover,
  onDialogueClick 
}) => {
  if (!isVisible) return null

  return (
    <div id="userInterface" style={{ display: 'block' }}>
      {/* Enemy health bar */}
      <div
        style={{
          backgroundColor: 'white',
          width: '250px',
          position: 'absolute',
          top: '50px',
          left: '50px',
          border: '4px black solid',
          padding: '12px',
        }}
      >
        <h1 style={{ fontSize: '16px' }}>Draggle</h1>
        <div style={{ position: 'relative' }}>
          <div
            style={{ height: '5px', backgroundColor: '#ccc', marginTop: '10px' }}
          ></div>
          <div
            id="enemyHealthBar"
            style={{
              height: '5px',
              backgroundColor: 'green',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: enemyHealth + '%'
            }}
          ></div>
        </div>
      </div>

      {/* Player health bar */}
      <div
        style={{
          backgroundColor: 'white',
          width: '250px',
          position: 'absolute',
          top: '330px',
          right: '50px',
          border: '4px black solid',
          padding: '12px',
        }}
      >
        <h1 style={{ fontSize: '16px' }}>Emby</h1>
        <div style={{ position: 'relative' }}>
          <div
            style={{ height: '5px', backgroundColor: '#ccc', marginTop: '10px' }}
          ></div>
          <div
            id="playerHealthBar"
            style={{
              height: '5px',
              backgroundColor: 'green',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: playerHealth + '%'
            }}
          ></div>
        </div>
      </div>

      {/* Battle action box */}
      <div
        style={{
          backgroundColor: 'white',
          height: '140px',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '4px black solid',
          display: 'flex',
        }}
      >
        <div
          id="dialogueBox"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'white',
            padding: '12px',
            display: isDialogueVisible ? 'block' : 'none',
            cursor: 'pointer',
          }}
          onClick={onDialogueClick}
        >
          {dialogueText}
        </div>
        <div
          id="attacksBox"
          style={{
            width: '66.66%',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {attacks.map((attack, index) => (
            <button
              key={index}
              onClick={() => onAttackClick(attack)}
              onMouseEnter={() => onAttackHover(attack)}
            >
              {attack.name}
            </button>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '33.33%',
            borderLeft: '4px black solid',
          }}
        >
          <h1 id="attackType" style={{ fontSize: '16px', color: selectedAttackType.color }}>
            {selectedAttackType.name || 'Attack Type'}
          </h1>
        </div>
      </div>
    </div>
  )
}

