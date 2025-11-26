const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const DEBUG_REVEAL_COLLECTIBLES = true
const DEFAULT_COLLECTIBLE_SIZE = 12
const PLAYER_BASE_SPEED = 3
const PLAYER_SPRINT_MULTIPLIER = 1.6
const PLAYER_JUMP_CONFIG = {
  power: 18,
  gravity: 1.2,
  cooldownFrames: 24
}
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}
console.log(charactersMap)

const boundaries = []
const offset = {
  x: -735,
  y: -650
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const characters = []
const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Character({
          id: 'villager-child',
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: villagerImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          animate: true,
          dialogue: ['...', 'Hey mister, have you seen my Doggochu?']
        })
      )
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Character({
          id: 'market-vendor',
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: oldManImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          dialogue: [
            'Ooof, these bones still ache from trading days.',
            'Welcome to the Stellar Bazaar traveler.',
            'Let me show you my NFT stash.'
          ],
          isMarketplaceVendor: true
        })
      )
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  })
})

const collectibles = (collectiblesData || []).map((item) => {
  const tileX = item.tilePosition?.x ?? 0
  const tileY = item.tilePosition?.y ?? 0
  const size = item.size ?? DEFAULT_COLLECTIBLE_SIZE
  const positionFromTile = {
    x: tileX * Boundary.width + offset.x,
    y: tileY * Boundary.height + offset.y
  }

  const centeredPosition = {
    x: positionFromTile.x + (Boundary.width - size) / 2,
    y: positionFromTile.y + (Boundary.height - size) / 2
  }

  return new Collectible({
    id: item.id,
    name: item.name,
    description: item.description,
    position: centeredPosition,
    width: size,
    height: size,
    color: item.color,
    debugVisible: DEBUG_REVEAL_COLLECTIBLES
  })
})

const image = new Image()
image.src = './img/Pellet Town.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})
player.jumpState = {
  isJumping: false,
  velocity: 0,
  elevation: 0,
  cooldown: 0
}

if (DEBUG_REVEAL_COLLECTIBLES) {
  const revealOffsets = [
    { x: -60, y: -40 },
    { x: 0, y: -40 },
    { x: 60, y: -40 },
    { x: -60, y: 20 },
    { x: 0, y: 20 },
    { x: 60, y: 20 }
  ]

  collectibles.forEach((collectible, index) => {
    const offsetFromPlayer = revealOffsets[index % revealOffsets.length]
    collectible.position = {
      x: player.position.x + offsetFromPlayer.x,
      y: player.position.y + offsetFromPlayer.y
    }
    collectible.width = DEFAULT_COLLECTIBLE_SIZE
    collectible.height = DEFAULT_COLLECTIBLE_SIZE
    collectible.debugVisible = true
  })
}

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  Shift: {
    pressed: false
  }
}

const movables = [
  background,
  ...boundaries,
  ...collectibles,
  foreground,
  ...battleZones,
  ...characters
]
const renderables = [
  background,
  ...collectibles,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
]

const battle = {
  initiated: false
}
const MARKETPLACE_TABLE_NAME = 'nft_marketplace'
const MARKETPLACE_SEED_LISTINGS = [
  {
    id: 'seed-ember-flare',
    name: 'Ember Flare Charm',
    description:
      'Imbues Fireball attacks with extra plasma, boosting damage for one battle.',
    price: 320,
    image_url: './img/fireball.png'
  },
  {
    id: 'seed-aquifer-petal',
    name: 'Aquifer Petal',
    description:
      'Restores 35 HP instantly and grants regen when used before a Draggle fight.',
    price: 280,
    image_url: './img/embySprite.png'
  },
  {
    id: 'seed-starlit-core',
    name: 'Starlit Core Relic',
    description:
      'Reduces incoming damage by 20% for two turns. Forged by Pellet Town elders.',
    price: 450,
    image_url: './img/draggleSprite.png'
  }
]

const INVENTORY_STORAGE_KEY = 'pokemon-style-inventory'
const inventoryState = {
  items: []
}
const collectibleEffects = {
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
const collectibleBonuses = {
  attackMultipliers: {},
  startBattleHeal: 0,
  postEnemyAttackHeal: 0,
  summaries: []
}
window.collectibleBonuses = collectibleBonuses
window.collectibleEffects = collectibleEffects

const inventoryListElement = document.querySelector('#inventoryList')
const inventoryEffectsElement = document.querySelector('#inventoryEffects')
const lootToastElement = document.querySelector('#lootToast')
let lootToastTimeoutId
const marketplacePanel = document.querySelector('#marketplacePanel')
const marketplaceListElement = document.querySelector('#marketplaceList')
const marketplaceStatusElement = document.querySelector('#marketplaceStatus')
const marketplaceRefreshBtn = document.querySelector('#marketplaceRefreshBtn')
const marketplaceCloseBtn = document.querySelector('#marketplaceCloseBtn')
const marketplaceState = {
  isOpen: false,
  isLoading: false,
  items: [],
  error: null,
  note: ''
}

function updateInventoryUI() {
  if (!inventoryListElement) return
  inventoryListElement.replaceChildren()

  if (!inventoryState.items.length) {
    const emptyMessage = document.createElement('span')
    emptyMessage.textContent = 'No items collected yet.'
    inventoryListElement.appendChild(emptyMessage)
    return
  }

  inventoryState.items.forEach((item) => {
    const itemRow = document.createElement('div')
    itemRow.style.display = 'flex'
    itemRow.style.flexDirection = 'column'

    const title = document.createElement('strong')
    title.textContent = item.name
    title.style.fontSize = '12px'
    const description = document.createElement('span')
    description.textContent = item.description
    description.style.fontSize = '11px'

    itemRow.appendChild(title)
    itemRow.appendChild(description)
    inventoryListElement.appendChild(itemRow)
  })

  updateInventoryEffectsUI()
}

function updateInventoryEffectsUI() {
  if (!inventoryEffectsElement) return
  inventoryEffectsElement.replaceChildren()

  if (!collectibleBonuses.summaries.length) {
    const emptyMessage = document.createElement('span')
    emptyMessage.textContent = 'No item bonuses active.'
    inventoryEffectsElement.appendChild(emptyMessage)
    return
  }

  collectibleBonuses.summaries.forEach((summary) => {
    const summaryRow = document.createElement('span')
    summaryRow.textContent = summary
    inventoryEffectsElement.appendChild(summaryRow)
  })
}

function recomputeCollectibleBonuses() {
  collectibleBonuses.attackMultipliers = {}
  collectibleBonuses.startBattleHeal = 0
  collectibleBonuses.postEnemyAttackHeal = 0
  collectibleBonuses.summaries = []

  const summariesSet = new Set()
  inventoryState.items.forEach((item) => {
    const effect = collectibleEffects[item.id]
    if (!effect) return

    if (effect.attackMultipliers) {
      Object.entries(effect.attackMultipliers).forEach(([attackName, multiplier]) => {
        const current = collectibleBonuses.attackMultipliers[attackName] ?? 1
        collectibleBonuses.attackMultipliers[attackName] = current * multiplier
      })
    }
    collectibleBonuses.startBattleHeal += effect.startBattleHeal ?? 0
    collectibleBonuses.postEnemyAttackHeal += effect.postEnemyAttackHeal ?? 0

    if (effect.summary && !summariesSet.has(effect.summary)) {
      collectibleBonuses.summaries.push(effect.summary)
      summariesSet.add(effect.summary)
    }
  })

  window.collectibleBonuses = collectibleBonuses
  updateInventoryEffectsUI()
}

function persistInventory() {
  try {
    const itemIds = inventoryState.items.map((item) => item.id)
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(itemIds))
  } catch (error) {
    console.warn('Unable to persist inventory', error)
  }
}

function hydrateInventory() {
  let savedIds = []
  try {
    const storedValue = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (storedValue) {
      savedIds = JSON.parse(storedValue)
    }
  } catch (error) {
    console.warn('Unable to load saved inventory', error)
  }

  collectibles.forEach((collectible) => {
    if (savedIds.includes(collectible.id)) {
      collectible.collected = true
      addCollectibleToInventory(collectible)
    }
  })

  recomputeCollectibleBonuses()
  updateInventoryUI()
}

function addCollectibleToInventory(collectible) {
  if (inventoryState.items.find((item) => item.id === collectible.id)) return false
  inventoryState.items.push({
    id: collectible.id,
    name: collectible.name,
    description: collectible.description
  })
  return true
}

function announceLoot(message) {
  if (!lootToastElement) return
  lootToastElement.textContent = message
  lootToastElement.style.display = 'block'

  if (lootToastTimeoutId) {
    clearTimeout(lootToastTimeoutId)
  }

  lootToastTimeoutId = window.setTimeout(() => {
    lootToastElement.style.display = 'none'
  }, 2500)
}

function handleCollectiblePickups() {
  if (battle.initiated) return

  collectibles.forEach((collectible) => {
    if (collectible.collected) return
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: collectible
      })
    ) {
      collectible.collected = true
      const isNewItem = addCollectibleToInventory(collectible)
      if (isNewItem) {
        recomputeCollectibleBonuses()
        updateInventoryUI()
        announceLoot(`Collected ${collectible.name}!`)
        persistInventory()
      }
    }
  })
}

function getCurrentSpeed() {
  if (keys.Shift?.pressed) {
    return PLAYER_BASE_SPEED * PLAYER_SPRINT_MULTIPLIER
  }
  return PLAYER_BASE_SPEED
}

function initiateJump() {
  const jump = player.jumpState
  if (!jump || jump.isJumping || jump.cooldown > 0) return
  jump.isJumping = true
  jump.velocity = PLAYER_JUMP_CONFIG.power
}

function updateJumpState() {
  const jump = player.jumpState
  if (!jump) return

  if (!jump.isJumping) {
    if (jump.cooldown > 0) jump.cooldown--
    player.drawOffset.y = 0
    return
  }

  jump.velocity -= PLAYER_JUMP_CONFIG.gravity
  jump.elevation += jump.velocity

  if (jump.elevation <= 0) {
    jump.elevation = 0
    jump.velocity = 0
    jump.isJumping = false
    jump.cooldown = PLAYER_JUMP_CONFIG.cooldownFrames
    player.drawOffset.y = 0
    return
  }

  player.drawOffset.y = -jump.elevation
}

function updateMarketplaceUI() {
  if (!marketplaceListElement || !marketplaceStatusElement) return
  marketplaceListElement.replaceChildren()

  let statusMessage = ''
  if (marketplaceState.isLoading) {
    statusMessage = 'Loading listings...'
  } else if (marketplaceState.error) {
    statusMessage = marketplaceState.error
  } else if (marketplaceState.note) {
    statusMessage = marketplaceState.note
  }

  if (statusMessage) {
    marketplaceStatusElement.style.display = 'block'
    marketplaceStatusElement.textContent = statusMessage
  } else {
    marketplaceStatusElement.style.display = 'none'
  }

  if (marketplaceState.items.length === 0 && !marketplaceState.isLoading) {
    const emptyMessage = document.createElement('span')
    emptyMessage.textContent = 'No listings yet. Try refreshing.'
    marketplaceListElement.appendChild(emptyMessage)
    return
  }

  marketplaceState.items.forEach((item) => {
    const card = document.createElement('div')
    card.style.border = '3px solid #333'
    card.style.borderRadius = '4px'
    card.style.padding = '12px'
    card.style.display = 'flex'
    card.style.flexDirection = 'column'
    card.style.gap = '10px'
    card.style.backgroundColor = '#f8f8f8'
    card.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)'
    card.style.transition = 'transform 0.1s, box-shadow 0.1s'
    card.style.cursor = 'pointer'
    card.onmouseenter = () => {
      card.style.transform = 'translateY(-2px)'
      card.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2)'
    }
    card.onmouseleave = () => {
      card.style.transform = 'translateY(0)'
      card.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)'
    }

    if (item.image_url) {
      const imageContainer = document.createElement('div')
      imageContainer.style.width = '100%'
      imageContainer.style.height = '140px'
      imageContainer.style.border = '2px solid #222'
      imageContainer.style.borderRadius = '2px'
      imageContainer.style.backgroundColor = '#fff'
      imageContainer.style.display = 'flex'
      imageContainer.style.alignItems = 'center'
      imageContainer.style.justifyContent = 'center'
      imageContainer.style.overflow = 'hidden'
      imageContainer.style.position = 'relative'

      const thumb = document.createElement('img')
      thumb.src = item.image_url
      thumb.alt = item.name || 'NFT art'
      thumb.style.width = '100%'
      thumb.style.height = '100%'
      thumb.style.objectFit = 'contain'
      thumb.style.imageRendering = 'pixelated'
      thumb.onerror = () => {
        thumb.style.display = 'none'
        const placeholder = document.createElement('div')
        placeholder.textContent = '📦'
        placeholder.style.fontSize = '48px'
        placeholder.style.opacity = '0.3'
        imageContainer.appendChild(placeholder)
      }

      imageContainer.appendChild(thumb)
      card.appendChild(imageContainer)
    }

    const titleRow = document.createElement('div')
    titleRow.style.display = 'flex'
    titleRow.style.justifyContent = 'space-between'
    titleRow.style.alignItems = 'center'
    titleRow.style.marginTop = item.image_url ? '4px' : '0'

    const title = document.createElement('strong')
    title.textContent = item.name || 'Untitled NFT'
    title.style.fontSize = '14px'
    title.style.color = '#111'
    title.style.textTransform = 'uppercase'
    title.style.letterSpacing = '0.5px'

    const priceBadge = document.createElement('div')
    priceBadge.style.backgroundColor = '#ffd700'
    priceBadge.style.border = '2px solid #333'
    priceBadge.style.padding = '4px 8px'
    priceBadge.style.borderRadius = '2px'
    priceBadge.style.fontSize = '11px'
    priceBadge.style.fontWeight = 'bold'
    priceBadge.style.color = '#000'
    priceBadge.textContent = item.price ? `${item.price} $GEM` : 'TBD'

    titleRow.appendChild(title)
    titleRow.appendChild(priceBadge)

    const description = document.createElement('div')
    description.textContent = item.description || 'No lore provided.'
    description.style.fontSize = '10px'
    description.style.color = '#444'
    description.style.lineHeight = '1.4'
    description.style.marginTop = '2px'
    description.style.padding = '6px'
    description.style.backgroundColor = 'rgba(0,0,0,0.05)'
    description.style.borderRadius = '2px'
    description.style.border = '1px solid rgba(0,0,0,0.1)'

    card.appendChild(titleRow)
    card.appendChild(description)

    marketplaceListElement.appendChild(card)
  })
}

function resetMovementKeys() {
  Object.values(keys).forEach((keyState) => {
    if (keyState && typeof keyState === 'object') {
      keyState.pressed = false
    }
  })
}

async function fetchMarketplaceItems({ force = false } = {}) {
  if (!marketplacePanel) return
  if (!window.supabaseClient) {
    marketplaceState.error = 'Supabase client missing. Check supabaseClient.js.'
    marketplaceState.items = []
    marketplaceState.isLoading = false
    marketplaceState.note = ''
    updateMarketplaceUI()
    return
  }

  if (marketplaceState.items.length && !force) {
    updateMarketplaceUI()
    return
  }

  marketplaceState.isLoading = true
  marketplaceState.error = null
  marketplaceState.note = ''
  updateMarketplaceUI()

  const { data, error } = await window.supabaseClient
    .from(MARKETPLACE_TABLE_NAME)
    .select('id,name,description,price,image_url')
    .order('price', { ascending: true })

  marketplaceState.isLoading = false

  if (error) {
    console.error('Supabase marketplace error:', error)
    marketplaceState.error = 'Unable to load listings. Showing featured stock.'
    marketplaceState.items = MARKETPLACE_SEED_LISTINGS
    marketplaceState.note =
      'These sample NFTs live locally. Add rows in Supabase to override.'
  } else {
    marketplaceState.error = null
    if (!data || data.length === 0) {
      marketplaceState.items = MARKETPLACE_SEED_LISTINGS
      marketplaceState.note =
        'Supabase table is empty. Showing featured Stellar Bazaar stock.'
    } else {
      marketplaceState.items = data
      marketplaceState.note = ''
    }
  }

  updateMarketplaceUI()
}

function openMarketplace() {
  if (!marketplacePanel || marketplaceState.isOpen) return
  marketplaceState.isOpen = true
  marketplacePanel.style.display = 'flex'
  resetMovementKeys()
  fetchMarketplaceItems()
}

function closeMarketplace() {
  if (!marketplacePanel || !marketplaceState.isOpen) return
  marketplaceState.isOpen = false
  marketplacePanel.style.display = 'none'
}

function handlePostConversation(character) {
  if (!character) return
  if (character.isMarketplaceVendor) {
    openMarketplace()
  }
}

marketplaceRefreshBtn?.addEventListener('click', () =>
  fetchMarketplaceItems({ force: true })
)
marketplaceCloseBtn?.addEventListener('click', closeMarketplace)
marketplacePanel?.addEventListener('click', (event) => {
  if (event.target === marketplacePanel) {
    closeMarketplace()
  }
})
updateMarketplaceUI()

hydrateInventory()

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  updateJumpState()
  handleCollectiblePickups()

  const currentSpeed = getCurrentSpeed()
  player.frames.hold = keys.Shift?.pressed ? 6 : 10

  if (marketplaceState.isOpen) return
  if (battle.initiated) return

  // activate a battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId)

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiated = true
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop
                initBattle()
                animateBattle()
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4
                })
              }
            })
          }
        })
        break
      }
    }
  }

  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: currentSpeed }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += currentSpeed
      })
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: currentSpeed, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + currentSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += currentSpeed
      })
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: 0, y: -currentSpeed }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - currentSpeed
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= currentSpeed
      })
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right

    checkForCharacterCollision({
      characters,
      player,
      characterOffset: { x: -currentSpeed, y: 0 }
    })

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - currentSpeed,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= currentSpeed
      })
  }
}
// animate()

let lastKey = ''
window.addEventListener('keydown', (e) => {
  if (marketplaceState.isOpen) {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'm') {
      closeMarketplace()
    }
    return
  }

  if (player.isInteracting) {
    switch (e.key) {
      case ' ':
        player.interactionAsset.dialogueIndex++

        const { dialogueIndex, dialogue } = player.interactionAsset
        if (dialogueIndex <= dialogue.length - 1) {
          document.querySelector('#characterDialogueBox').innerHTML =
            player.interactionAsset.dialogue[dialogueIndex]
          return
        }

        // finish conversation
        const completedCharacter = player.interactionAsset
        player.isInteracting = false
        player.interactionAsset.dialogueIndex = 0
        document.querySelector('#characterDialogueBox').style.display = 'none'
        handlePostConversation(completedCharacter)

        break
    }
    return
  }

  switch (e.key) {
    case ' ':
      if (player.interactionAsset) {
        const firstMessage = player.interactionAsset.dialogue[0]
        document.querySelector('#characterDialogueBox').innerHTML =
          firstMessage
        document.querySelector('#characterDialogueBox').style.display = 'flex'
        player.isInteracting = true
      } else {
        initiateJump()
      }
      break
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break

    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break

    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
    case 'Shift':
      keys.Shift.pressed = true
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
    case 'Shift':
      keys.Shift.pressed = false
      break
  }
})

let clicked = false
addEventListener('click', () => {
  if (!clicked) {
    audio.Map.play()
    clicked = true
  }
})
