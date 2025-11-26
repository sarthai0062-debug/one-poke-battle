export const collectiblesData = [
  {
    id: 'ancient-orb',
    name: 'Ancient Orb',
    description: 'Emits a faint hum - villagers say it empowers fire attacks.',
    color: '#a987ff',
    size: 26,
    tilePosition: { x: 49, y: 44 }
  },
  {
    id: 'sunshard',
    name: 'Sun Shard',
    description: 'Warm to the touch. Rumored to restore fainted allies.',
    color: '#f7c948',
    size: 24,
    tilePosition: { x: 52, y: 41 }
  },
  {
    id: 'aqua-bloom',
    name: 'Aqua Bloom',
    description: 'A rare herb that soothes even the fiercest Draggle.',
    color: '#5ec9f5',
    size: 24,
    tilePosition: { x: 46, y: 48 }
  }
]

export const collectibleEffects = {
  'ancient-orb': {
    summary: 'Ancient Orb: Fireball damage +30%.',
    attackMultipliers: {
      Fireball: 1.3
    }
  },
  sunshard: {
    summary: 'Sun Shard: Restore 25 HP when battle starts.',
    startBattleHeal: 25
  },
  'aqua-bloom': {
    summary: 'Aqua Bloom: Heal 15 HP after enemy attacks.',
    postEnemyAttackHeal: 15
  }
}

