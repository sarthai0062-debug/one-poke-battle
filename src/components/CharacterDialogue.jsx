import React from 'react'

export const CharacterDialogue = ({ text, isVisible }) => {
  if (!isVisible) return null

  return (
    <div
      id="characterDialogueBox"
      style={{
        backgroundColor: 'white',
        height: '140px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '4px black solid',
        padding: '12px',
      }}
    >
      {text}
    </div>
  )
}

