export const collectiblesData = [
  {
    id: 'ancient-orb',
    name: 'Ember Flare Charm',
    description: 'Emits a faint hum - villagers say it empowers fire attacks.',
    color: '#a987ff',
    size: 26,
    tilePosition: { x: 49, y: 44 },
    gifPath: '/gifs/ember_flare_charm.gif'
  },
  {
    id: 'sunshard',
    name: 'Starlit Core Relic',
    description: 'Warm to the touch. Rumored to restore fainted allies.',
    color: '#f7c948',
    size: 24,
    tilePosition: { x: 52, y: 41 },
    gifPath: '/gifs/starlit_core_relic.gif'
  },
  {
    id: 'aqua-bloom',
    name: 'Aquifer Petal',
    description: 'A rare herb that soothes even the fiercest Draggle.',
    color: '#5ec9f5',
    size: 24,
    tilePosition: { x: 46, y: 48 },
    gifPath: '/gifs/aquifer_petal.gif'
  }
]

export const collectibleEffects = {
  'ancient-orb': {
    summary: 'Ember Flare Charm: Fireball damage +30%.',
    attackMultipliers: {
      Fireball: 1.3
    }
  },
  sunshard: {
    summary: 'Starlit Core Relic: Restore 25 HP when battle starts.',
    startBattleHeal: 25
  },
  'aqua-bloom': {
    summary: 'Aquifer Petal: Heal 15 HP after enemy attacks.',
    postEnemyAttackHeal: 15
  }
}

