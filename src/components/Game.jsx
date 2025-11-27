import React, { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Sprite, Monster, Boundary, Character, Collectible, GlowingPoint } from '../lib/classes.js'
import { audio } from '../lib/audio.js'
import { rectangularCollision, checkForCharacterCollision } from '../lib/utils.js'
import { collisions } from '../data/collisions.js'
import { battleZonesData } from '../data/battleZones.js'
import { charactersMapData } from '../data/characters.js'
import { collectiblesData, collectibleEffects } from '../data/collectibles.js'
import { attacks } from '../data/attacks.js'
import { monsters } from '../data/monsters.js'
import { BattleUI } from './BattleUI'
import { InventoryPanel } from './InventoryPanel'
import { MarketplacePanel } from './MarketplacePanel'
import { LootToast } from './LootToast'
import { CharacterDialogue } from './CharacterDialogue'
import { PointsDisplay } from './PointsDisplay'
import { supabaseClient } from '../lib/supabaseClient.js'
import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction, useWallets } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { 
  getPoints as getPointsBlockchain, 
  redeemPoints as redeemPointsBlockchain,
  getPointsForGame,
  redeemPointsForGame,
  prepareTransactionForEnoki,
  isEpochExpirationError,
  isEnokiWallet,
  getEpochExpirationMessage
} from '../lib/blockchain.js'

const CANVAS_WIDTH = 1024
const CANVAS_HEIGHT = 576
const DEBUG_REVEAL_COLLECTIBLES = true
const DEFAULT_COLLECTIBLE_SIZE = 12
const PLAYER_BASE_SPEED = 3
const PLAYER_SPRINT_MULTIPLIER = 1.6
const PLAYER_JUMP_CONFIG = {
  power: 18,
  gravity: 1.2,
  cooldownFrames: 24
}
const INVENTORY_STORAGE_KEY = 'pokemon-style-inventory'
const POINTS_STORAGE_KEY = 'pokemon-style-points'
const PLAYER_PROGRESS_TABLE = 'player_progress'
const PLAYER_POINT_NODES_TABLE = 'player_point_nodes'
const PLAYER_TRADES_TABLE = 'player_trades'

// Helper function to get player ID from wallet address
const getPlayerId = (account) => {
  // Use wallet address as player ID, fallback to 'demo-player' if no wallet connected
  return account?.address || 'demo-player'
}
const MARKETPLACE_TABLE_NAME = 'nft_marketplace'
const POINTS_PER_BATTLE_VICTORY = 50
const POINTS_PER_COLLECTIBLE = 25
const MARKETPLACE_SEED_LISTINGS = [
  {
    id: 'seed-ember-flare',
    name: 'Ember Flare Charm',
    description: 'Imbues Fireball attacks with extra plasma, boosting damage for one battle.',
    price: 320,
    gifPath: '/gifs/ember_flare_charm.gif',
    image_url: '/gifs/ember_flare_charm.gif'
  },
  {
    id: 'seed-aquifer-petal',
    name: 'Aquifer Petal',
    description: 'Restores 35 HP instantly and grants regen when used before a Draggle fight.',
    price: 280,
    gifPath: '/gifs/aquifer_petal.gif',
    image_url: '/gifs/aquifer_petal.gif'
  },
  {
    id: 'seed-starlit-core',
    name: 'Starlit Core Relic',
    description: 'Reduces incoming damage by 20% for two turns. Forged by Pellet Town elders.',
    price: 450,
    gifPath: '/gifs/starlit_core_relic.gif',
    image_url: '/gifs/starlit_core_relic.gif'
  }
]

export const Game = () => {
  const canvasRef = useRef(null)
  const animationIdRef = useRef(null)
  const battleAnimationIdRef = useRef(null)
  const [scale, setScale] = useState(1)
  
  // Blockchain hooks
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()
  const wallets = useWallets()
  const gameStateRef = useRef({
    boundaries: [],
    battleZones: [],
    characters: [],
    collectibles: [],
    glowingPoints: [],
    player: null,
    background: null,
    foreground: null,
    battleBackground: null,
    movables: [],
    renderables: [],
    keys: {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false },
      Shift: { pressed: false }
    },
    lastKey: '',
    battle: { initiated: false },
    draggle: null,
    emby: null,
    renderedSprites: [],
    queue: [],
    collectibleBonuses: {
      attackMultipliers: {},
      startBattleHeal: 0,
      postEnemyAttackHeal: 0,
      summaries: []
    }
  })

  // UI State
  const [points, setPoints] = useState(0)
  const [inventoryItems, setInventoryItems] = useState([])
  const [inventoryBonuses, setInventoryBonuses] = useState([])
  const [lootToast, setLootToast] = useState({ message: '', visible: false })
  const [marketplaceState, setMarketplaceState] = useState({
    isOpen: false,
    isLoading: false,
    items: [],
    error: null,
    note: ''
  })
  const [characterDialogue, setCharacterDialogue] = useState({ text: '', visible: false })
  const [claimPopup, setClaimPopup] = useState({ visible: false, type: null, amount: 100 })
  const [battleUI, setBattleUI] = useState({
    visible: false,
    enemyHealth: 100,
    playerHealth: 100,
    selectedAttackType: {},
    dialogueText: '',
    isDialogueVisible: false
  })
  const [isInventoryVisible, setIsInventoryVisible] = useState(true)
  const [audioStarted, setAudioStarted] = useState(false)

  // Responsive scaling so the game fits the screen
  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scaleX = vw / CANVAS_WIDTH
      const scaleY = vh / CANVAS_HEIGHT
      const nextScale = Math.min(scaleX, scaleY)
      setScale(nextScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const c = canvas.getContext('2d')
    const gs = gameStateRef.current

    // Create collision map
    const collisionsMap = []
    for (let i = 0; i < collisions.length; i += 70) {
      collisionsMap.push(collisions.slice(i, 70 + i))
    }

    // Create battle zones map
    const battleZonesMap = []
    for (let i = 0; i < battleZonesData.length; i += 70) {
      battleZonesMap.push(battleZonesData.slice(i, 70 + i))
    }

    // Create characters map
    const charactersMap = []
    for (let i = 0; i < charactersMapData.length; i += 70) {
      charactersMap.push(charactersMapData.slice(i, 70 + i))
    }

    const offset = {
      x: -735,
      y: -650
    }

    // Create boundaries
    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          gs.boundaries.push(
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

    // Create battle zones
    battleZonesMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1025) {
          gs.battleZones.push(
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

    // Create characters
    const villagerImg = new Image()
    villagerImg.src = '/img/villager/Idle.png'
    const oldManImg = new Image()
    oldManImg.src = '/img/oldMan/Idle.png'

    charactersMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1026) {
          gs.characters.push(
            new Character({
              id: 'villager-child',
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
              },
              image: villagerImg,
              frames: { max: 4, hold: 60 },
              scale: 3,
              animate: true,
              dialogue: ['...', 'Hey mister, have you seen my Doggochu?']
            })
          )
        } else if (symbol === 1031) {
          gs.characters.push(
            new Character({
              id: 'market-vendor',
              position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
              },
              image: oldManImg,
              frames: { max: 4, hold: 60 },
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
          gs.boundaries.push(
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

    // Create collectibles
    gs.collectibles = (collectiblesData || []).map((item) => {
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

    // Create glowing points spread across the entire map in walkable areas
    gs.glowingPoints = []
    const mapWidth = 70 // tiles wide
    const mapHeight = Math.floor(collisions.length / 70) // tiles tall
    const tileSize = Boundary.width // 48 pixels
    const totalMapWidth = mapWidth * tileSize
    const totalMapHeight = mapHeight * tileSize
    
    // Generate positions across the full map
    const numGlowingPoints = 20
    let attempts = 0
    const maxAttempts = numGlowingPoints * 50 // Try up to 50 times per point
    
    // Helper function to check if a position is walkable (not on a boundary)
    const isWalkable = (x, y) => {
      const testPoint = {
        position: { x, y },
        width: 12,
        height: 12
      }
      
      // Check collision with boundaries
      for (const boundary of gs.boundaries) {
        if (rectangularCollision({ rectangle1: testPoint, rectangle2: boundary })) {
          return false
        }
      }
      
      // Check collision with battle zones
      for (const battleZone of gs.battleZones) {
        if (rectangularCollision({ rectangle1: testPoint, rectangle2: battleZone })) {
          return false
        }
      }
      
      // Make sure it's within map bounds (with some padding)
      const minX = offset.x + tileSize
      const maxX = offset.x + totalMapWidth - tileSize
      const minY = offset.y + tileSize
      const maxY = offset.y + totalMapHeight - tileSize
      
      return x >= minX && x <= maxX && y >= minY && y <= maxY
    }
    
    // Generate glowing points
    for (let i = 0; i < numGlowingPoints; i++) {
      let positionFound = false
      let tries = 0
      
      while (!positionFound && tries < maxAttempts / numGlowingPoints) {
        // Generate random position across the entire map
        const tileX = Math.floor(Math.random() * mapWidth)
        const tileY = Math.floor(Math.random() * mapHeight)
        
        // Convert to pixel coordinates with offset
        const baseX = tileX * tileSize + offset.x
        const baseY = tileY * tileSize + offset.y
        
        // Add some randomness within the tile (but keep it centered)
        const randomOffsetX = (Math.random() - 0.5) * (tileSize * 0.6)
        const randomOffsetY = (Math.random() - 0.5) * (tileSize * 0.6)
        
        const x = baseX + tileSize / 2 + randomOffsetX - 6 // Center the 12x12 point
        const y = baseY + tileSize / 2 + randomOffsetY - 6
        
        // Check if this position is walkable
        if (isWalkable(x, y)) {
          gs.glowingPoints.push(new GlowingPoint({
            id: `glowing-point-${i}`,
            position: { x, y },
            pointsValue: 100
          }))
          positionFound = true
        }
        
        tries++
      }
      
      attempts += tries
    }

    // Create player
    const playerDownImage = new Image()
    playerDownImage.src = '/img/playerDown.png'
    const playerUpImage = new Image()
    playerUpImage.src = '/img/playerUp.png'
    const playerLeftImage = new Image()
    playerLeftImage.src = '/img/playerLeft.png'
    const playerRightImage = new Image()
    playerRightImage.src = '/img/playerRight.png'

    gs.player = new Sprite({
      position: {
        x: CANVAS_WIDTH / 2 - 192 / 4 / 2,
        y: CANVAS_HEIGHT / 2 - 68 / 2
      },
      image: playerDownImage,
      frames: { max: 4, hold: 10 },
      sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
      }
    })

    gs.player.jumpState = {
      isJumping: false,
      velocity: 0,
      elevation: 0,
      cooldown: 0
    }

    // Debug: Position collectibles around player
    if (DEBUG_REVEAL_COLLECTIBLES) {
      const revealOffsets = [
        { x: -60, y: -40 },
        { x: 0, y: -40 },
        { x: 60, y: -40 },
        { x: -60, y: 20 },
        { x: 0, y: 20 },
        { x: 60, y: 20 }
      ]

      gs.collectibles.forEach((collectible, index) => {
        const offsetFromPlayer = revealOffsets[index % revealOffsets.length]
        collectible.position = {
          x: gs.player.position.x + offsetFromPlayer.x,
          y: gs.player.position.y + offsetFromPlayer.y
        }
        collectible.width = DEFAULT_COLLECTIBLE_SIZE
        collectible.height = DEFAULT_COLLECTIBLE_SIZE
        collectible.debugVisible = true
      })
    }

    // Create background and foreground
    const image = new Image()
    image.src = '/img/Pellet Town.png'
    gs.background = new Sprite({
      position: { x: offset.x, y: offset.y },
      image: image
    })

    const foregroundImage = new Image()
    foregroundImage.src = '/img/foregroundObjects.png'
    gs.foreground = new Sprite({
      position: { x: offset.x, y: offset.y },
      image: foregroundImage
    })

    // Set up movables and renderables
    gs.movables = [
      gs.background,
      ...gs.boundaries,
      ...gs.collectibles,
      ...gs.glowingPoints,
      gs.foreground,
      ...gs.battleZones,
      ...gs.characters
    ]

    gs.renderables = [
      gs.background,
      ...gs.collectibles,
      ...gs.glowingPoints,
      ...gs.boundaries,
      ...gs.battleZones,
      ...gs.characters,
      gs.player,
      gs.foreground
    ]

    // Load inventory from localStorage
    hydrateInventory()

    // Load points from Supabase and localStorage
    hydratePointsFromSupabase()

    // Start animation loop
    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (battleAnimationIdRef.current) {
        cancelAnimationFrame(battleAnimationIdRef.current)
      }
    }
  }, [account]) // Reload when account changes

  // Reload points when wallet connects/disconnects
  useEffect(() => {
    if (account) {
      hydratePointsFromSupabase()
    } else {
      // Reset to 0 when wallet disconnects
      setPoints(0)
    }
  }, [account?.address])

  // Points functions
  const hydratePointsFromSupabase = async () => {
    const playerId = getPlayerId(account)
    
    if (!supabaseClient) {
      // Fallback to localStorage only
      const storageKey = `${POINTS_STORAGE_KEY}-${playerId}`
      const localPoints = parseInt(window.localStorage.getItem(storageKey) || '0', 10)
      setPoints(localPoints)
      return
    }

    try {
      // Get points from Supabase using wallet address as player_id
      const { data, error } = await supabaseClient
        .from(PLAYER_PROGRESS_TABLE)
        .select('points')
        .eq('player_id', playerId)
        .maybeSingle()

      const remotePoints = data?.points ?? 0
      const storageKey = `${POINTS_STORAGE_KEY}-${playerId}`
      const localPoints = parseInt(window.localStorage.getItem(storageKey) || '0', 10)

      // Take maximum (prevent rollback)
      const total = Math.max(remotePoints, localPoints)
      setPoints(total)
      window.localStorage.setItem(storageKey, String(total))

      // Sync to Supabase if local was higher
      if (localPoints > remotePoints) {
        await persistPointsToSupabase(total)
      }
    } catch (error) {
      console.warn('Unable to load points from Supabase', error)
      const storageKey = `${POINTS_STORAGE_KEY}-${getPlayerId(account)}`
      const localPoints = parseInt(window.localStorage.getItem(storageKey) || '0', 10)
      setPoints(localPoints)
    }
  }

  const persistPointsToSupabase = async (newTotal) => {
    if (!supabaseClient) return
    
    const playerId = getPlayerId(account)
    if (playerId === 'demo-player') {
      // Don't persist if no wallet connected
      return
    }

    try {
      await supabaseClient
        .from(PLAYER_PROGRESS_TABLE)
        .upsert(
          {
            player_id: playerId,
            points: newTotal
          },
          { onConflict: 'player_id' }
        )
    } catch (error) {
      console.warn('Unable to persist points to Supabase', error)
    }
  }

  const addPoints = async (amount) => {
    const playerId = getPlayerId(account)
    let newTotal = 0
    setPoints((currentPoints) => {
      newTotal = currentPoints + amount
      const storageKey = `${POINTS_STORAGE_KEY}-${playerId}`
      window.localStorage.setItem(storageKey, String(newTotal))
      return newTotal
    })
    
    // Persist to Supabase after state update
    await persistPointsToSupabase(newTotal)
    
    // No blockchain call when adding points - only when deducting
  }

  const deductPoints = async (amount) => {
    if (points < amount) return false
    
    // If wallet is connected, call blockchain redeemPoints to deduct points
    if (account && suiClient && signAndExecuteTransaction) {
      try {
        redeemPointsBlockchain({
          account,
          suiClient,
          signAndExecute: signAndExecuteTransaction.mutate,
          wallet: wallets,
          amount: amount // This will redeem/deduct the amount on blockchain
        })
        console.log('Points redeemed on blockchain successfully')
      } catch (error) {
        console.error('Failed to redeem points on blockchain:', error)
        // Show error to user
        setLootToast({ 
          message: 'Blockchain transaction failed. Please try again.', 
          visible: true 
        })
        setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
        return false // Don't proceed with purchase if blockchain fails
      }
    }
    
    // Update local state after blockchain transaction
    const playerId = getPlayerId(account)
    const newTotal = points - amount
    setPoints(newTotal)
    const storageKey = `${POINTS_STORAGE_KEY}-${playerId}`
    window.localStorage.setItem(storageKey, String(newTotal))
    await persistPointsToSupabase(newTotal)
    return true
  }

  const recordPointNodeCollection = async (nodeId) => {
    if (!supabaseClient) return
    
    const playerId = getPlayerId(account)
    if (playerId === 'demo-player') return // Don't record if no wallet connected

    try {
      await supabaseClient
        .from(PLAYER_POINT_NODES_TABLE)
        .insert({
          player_id: playerId,
          node_id: nodeId
        })
    } catch (error) {
      // Ignore duplicate key errors (23505)
      if (error.code === '23505') return
      console.warn('Unable to record point node collection', error)
    }
  }

  const recordMarketplacePurchase = async (item, cost) => {
    if (!supabaseClient) return
    
    const playerId = getPlayerId(account)
    if (playerId === 'demo-player') return // Don't record if no wallet connected

    try {
      await supabaseClient
        .from(PLAYER_TRADES_TABLE)
        .insert({
          player_id: playerId,
          item_id: item.id ?? item.name,
          item_name: item.name ?? 'Unknown Item',
          cost,
          snapshot: item
        })
    } catch (error) {
      console.warn('Unable to record marketplace purchase', error)
    }
  }

  // Get Points function - exact as provided by user (amount configurable)
  const getPoints = async (amount = 2000) => {
    if (!account) {
      console.log("No account connected");
      return;
    }
    
    const tx = new Transaction();
    tx.setSender(account.address);
    const packageId = "0x7f1212e08fcfe293b7299f1e5c0ccc2c6dafd9552d9e9c3bbd407934133748a3"; // Contract Address
    
    tx.moveCall({
      package: packageId,
      module: "pokemongame",
      function: "get_points",
      arguments: [
        tx.sharedObjectRef({
          objectId: "0x80137994fcd221d2497df286dec9f7d316b19ea6a709c7f7aeeaafcd8d36fd53",        // nftCount
          mutable: true,                  // read-only ref (&)
          initialSharedVersion: 3304, // ONELABS
        }),
        tx.pure.u256(amount),
      ],
    });
    
    // Prepare transaction for Enoki wallets (set OCT gas payment if needed)
    await prepareTransactionForEnoki(tx, suiClient, account.address, wallets?.currentWallet || null);
    
    console.log("Processing Transaction");
    
    signAndExecuteTransaction.mutate(
      {
        transaction: tx
      },
      {
        onError: (e) => {
          console.log("Tx Failed! from here");
          console.log(e);
          
          // Check if it's an epoch expiration error for Enoki wallets
          if (isEpochExpirationError(e) && wallets?.currentWallet && isEnokiWallet(wallets.currentWallet)) {
            const errorMessage = getEpochExpirationMessage(e);
            console.error("Enoki Session Expired:", errorMessage);
            alert(
              "⚠️ Your zkLogin session has expired!\n\n" +
              errorMessage + "\n\n" +
              "Please disconnect and reconnect your wallet to continue."
            );
          } else {
            setLootToast({ 
              message: 'Transaction failed. Please try again.', 
              visible: true 
            })
            setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
          }
        },
        onSuccess: async ({ digest }) => {
          let p = await suiClient.waitForTransaction({
            digest,
            options: {
              showEffects: true
            }
          });
          console.log("Transaction Result:", p);
          console.log("tx digest:", digest);
          reset();
          console.log("Tx Succesful!");
          
          // Update local points after successful transaction
          await addPoints(amount)
          
          // Close the popup
          setClaimPopup({ visible: false, type: null, amount: 2000 })
          
          const formattedAmount = amount.toLocaleString()
          setLootToast({ message: `Successfully claimed ${formattedAmount} points!`, visible: true })
          setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
        }
      }
    );
  }

  // Simple reset function - can be customized based on your needs
  const reset = () => {
    // Reset any form or state if needed
    // This is called after successful blockchain transactions
    console.log('Transaction completed, reset called')
  }


  // Redeem Points function - as provided by user
  const redeemPoints = async () => {
    if (!account) {
      console.log("No account connected");
      return;
    }
    
    const tx = new Transaction();
    tx.setSender(account.address);
    const packageId = "0x7f1212e08fcfe293b7299f1e5c0ccc2c6dafd9552d9e9c3bbd407934133748a3"; // Contract Address
    
    // public fun reedem_points(userPts:&mut UserPoints, amount:u256, ctx: &mut TxContext) {
    tx.moveCall({
      package: packageId,
      module: "pokemongame",
      function: "reedem_points",
      arguments: [
        tx.sharedObjectRef({
          objectId: "0x80137994fcd221d2497df286dec9f7d316b19ea6a709c7f7aeeaafcd8d36fd53",        // nftCount
          mutable: true,                  // read-only ref (&)
          initialSharedVersion: 3304, // ONELABS
        }),
        tx.pure.u256(450),
      ],
    });
    
    // Prepare transaction for Enoki wallets (set OCT gas payment if needed)
    await prepareTransactionForEnoki(tx, suiClient, account.address, wallets?.currentWallet || null);
    
    console.log("Processing Transaction");
    
    signAndExecuteTransaction.mutate(
      {
        transaction: tx
      },
      {
        onError: (e) => {
          console.log("Tx Failed! from here");
          console.log(e);
          
          // Check if it's an epoch expiration error for Enoki wallets
          if (isEpochExpirationError(e) && wallets?.currentWallet && isEnokiWallet(wallets.currentWallet)) {
            const errorMessage = getEpochExpirationMessage(e);
            console.error("Enoki Session Expired:", errorMessage);
            alert(
              "⚠️ Your zkLogin session has expired!\n\n" +
              errorMessage + "\n\n" +
              "Please disconnect and reconnect your wallet to continue."
            );
          }
        },
        onSuccess: async ({ digest }) => {
          let p = await suiClient.waitForTransaction({
            digest,
            options: {
              showEffects: true
            }
          });
          console.log("Transaction Result:", p);
          console.log("tx digest:", digest);
          reset();
          console.log("Tx Succesful!");
        }
      }
    );
  }

  // Inventory functions
  const hydrateInventory = () => {
    let savedIds = []
    try {
      const storedValue = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
      if (storedValue) {
        savedIds = JSON.parse(storedValue)
      }
    } catch (error) {
      console.warn('Unable to load saved inventory', error)
    }

    const gs = gameStateRef.current
    const newItems = []
    gs.collectibles.forEach((collectible) => {
      if (savedIds.includes(collectible.id)) {
        collectible.collected = true
        newItems.push({
          id: collectible.id,
          name: collectible.name,
          description: collectible.description,
          gifPath: collectible.gifPath
        })
      }
    })

    setInventoryItems(newItems)
    recomputeCollectibleBonuses(newItems)
  }

  const recomputeCollectibleBonuses = (items) => {
    const gs = gameStateRef.current
    gs.collectibleBonuses = {
      attackMultipliers: {},
      startBattleHeal: 0,
      postEnemyAttackHeal: 0,
      summaries: []
    }

    const summariesSet = new Set()
    items.forEach((item) => {
      const effect = collectibleEffects[item.id]
      if (!effect) return

      if (effect.attackMultipliers) {
        Object.entries(effect.attackMultipliers).forEach(([attackName, multiplier]) => {
          const current = gs.collectibleBonuses.attackMultipliers[attackName] ?? 1
          gs.collectibleBonuses.attackMultipliers[attackName] = current * multiplier
        })
      }
      gs.collectibleBonuses.startBattleHeal += effect.startBattleHeal ?? 0
      gs.collectibleBonuses.postEnemyAttackHeal += effect.postEnemyAttackHeal ?? 0

      if (effect.summary && !summariesSet.has(effect.summary)) {
        gs.collectibleBonuses.summaries.push(effect.summary)
        summariesSet.add(effect.summary)
      }
    })

    setInventoryBonuses(gs.collectibleBonuses.summaries)
  }

  const addCollectibleToInventory = (collectible) => {
    setInventoryItems((prev) => {
      if (prev.find((item) => item.id === collectible.id)) return prev
      
      // Look up GIF path from collectiblesData
      const collectibleData = collectiblesData.find(c => c.id === collectible.id)
      const gifPath = collectibleData?.gifPath || collectible.gifPath
      
      const newItems = [
        ...prev,
        {
          id: collectible.id,
          name: collectible.name,
          description: collectible.description,
          gifPath: gifPath
        }
      ]
      recomputeCollectibleBonuses(newItems)
      persistInventory(newItems)
      
      // Award points for collecting
      addPoints(POINTS_PER_COLLECTIBLE)
      recordPointNodeCollection(collectible.id)
      
      return newItems
    })
  }

  const persistInventory = (items) => {
    try {
      const itemIds = items.map((item) => item.id)
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(itemIds))
    } catch (error) {
      console.warn('Unable to persist inventory', error)
    }
  }

  const showLootToast = (message) => {
    setLootToast({ message, visible: true })
    setTimeout(() => {
      setLootToast({ message: '', visible: false })
    }, 2500)
  }

  // Marketplace functions
  const fetchMarketplaceItems = async (force = false) => {
    if (!supabaseClient) {
      setMarketplaceState((prev) => ({
        ...prev,
        error: 'Supabase client missing. Check supabaseClient.js.',
        items: [],
        isLoading: false,
        note: ''
      }))
      return
    }

    if (marketplaceState.items.length && !force) {
      return
    }

    setMarketplaceState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      note: ''
    }))

    const { data, error } = await supabaseClient
      .from(MARKETPLACE_TABLE_NAME)
      .select('id,name,description,price,image_url')
      .order('price', { ascending: true })

    if (error) {
      console.error('Supabase marketplace error:', error)
      setMarketplaceState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Unable to load listings. Showing featured stock.',
        items: MARKETPLACE_SEED_LISTINGS,
        note: 'These sample NFTs live locally. Add rows in Supabase to override.'
      }))
    } else {
      setMarketplaceState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        items: !data || data.length === 0 ? MARKETPLACE_SEED_LISTINGS : data,
        note:
          !data || data.length === 0
            ? 'Supabase table is empty. Showing featured Stellar Bazaar stock.'
            : ''
      }))
    }
  }

  const openMarketplace = () => {
    setMarketplaceState((prev) => ({ ...prev, isOpen: true }))
    resetMovementKeys()
    fetchMarketplaceItems()
  }

  const closeMarketplace = () => {
    setMarketplaceState((prev) => ({ ...prev, isOpen: false }))
  }

  const resetMovementKeys = () => {
    const gs = gameStateRef.current
    Object.values(gs.keys).forEach((keyState) => {
      if (keyState && typeof keyState === 'object') {
        keyState.pressed = false
      }
    })
  }

  // Battle functions
  const cloneAttackWithBonuses = (attack) => {
    const gs = gameStateRef.current
    const multiplier = gs.collectibleBonuses.attackMultipliers?.[attack.name] ?? 1
    const clonedAttack = { ...attack }
    if (multiplier !== 1) {
      clonedAttack.damage = Math.round(clonedAttack.damage * multiplier)
    }
    return clonedAttack
  }

  const applyBattleStartBonuses = () => {
    const gs = gameStateRef.current
    if (!gs.collectibleBonuses.startBattleHeal) return

    const healAmount = Math.min(gs.collectibleBonuses.startBattleHeal, 100 - gs.emby.health)
    if (healAmount <= 0) return

    gs.emby.health += healAmount
    setBattleUI((prev) => ({ ...prev, playerHealth: gs.emby.health }))
    gs.queue.push(() => {
      setBattleUI((prev) => ({
        ...prev,
        dialogueText: `Sun Shard healed Emby for ${healAmount} HP!`,
        isDialogueVisible: true
      }))
    })
  }

  const schedulePostEnemyHeal = () => {
    const gs = gameStateRef.current
    if (!gs.collectibleBonuses.postEnemyAttackHeal) return

    gs.queue.push(() => {
      if (gs.emby.health <= 0) return
      const healAmount = Math.min(gs.collectibleBonuses.postEnemyAttackHeal, 100 - gs.emby.health)
      if (healAmount <= 0) return

      gs.emby.health += healAmount
      setBattleUI((prev) => ({
        ...prev,
        playerHealth: gs.emby.health,
        dialogueText: `Aqua Bloom restored ${healAmount} HP!`,
        isDialogueVisible: true
      }))
    })
  }

  const initBattle = () => {
    const gs = gameStateRef.current
    
    // Prepare battle background sprite once per battle
    const battleBackgroundImage = new Image()
    battleBackgroundImage.src = '/img/battleBackground.png'
    gs.battleBackground = new Sprite({
      position: { x: 0, y: 0 },
      image: battleBackgroundImage
    })

    // Hide inventory during battle so HUD doesn't cover enemies
    setIsInventoryVisible(false)

    setBattleUI({
      visible: true,
      enemyHealth: 100,
      playerHealth: 100,
      selectedAttackType: {},
      dialogueText: '',
      isDialogueVisible: false
    })

    gs.draggle = new Monster(monsters.Draggle)
    gs.emby = new Monster(monsters.Emby)
    gs.renderedSprites = [gs.draggle, gs.emby]
    gs.queue = []
    
    applyBattleStartBonuses()
  }

  const handleBattleAttack = (attack) => {
    const gs = gameStateRef.current
    const selectedAttack = cloneAttackWithBonuses(attack)

    const message = gs.emby.attack({
      attack: selectedAttack,
      recipient: gs.draggle,
      renderedSprites: gs.renderedSprites,
      audio,
      gsap,
      onComplete: () => {
        if (gs.draggle.health <= 0) {
          gs.queue.push(() => {
            const faintMessage = gs.draggle.faint(audio, gsap)
            setBattleUI((prev) => ({ ...prev, dialogueText: faintMessage, isDialogueVisible: true }))
          })
          gs.queue.push(() => {
            setBattleUI((prev) => ({
              ...prev,
              dialogueText: `Victory! Claim ${POINTS_PER_BATTLE_VICTORY} Stardust!`,
              isDialogueVisible: true
            }))
            setClaimPopup({
              visible: true,
              type: 'battle',
              amount: POINTS_PER_BATTLE_VICTORY
            })
          })
          gs.queue.push(() => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationIdRef.current)
                animate()
                setBattleUI({ visible: false, enemyHealth: 100, playerHealth: 100, selectedAttackType: {}, dialogueText: '', isDialogueVisible: false })
                gsap.to('#overlappingDiv', { opacity: 0 })
                gs.battle.initiated = false
                audio.Map.play()
                setIsInventoryVisible(true)
              }
            })
          })
        }

        const randomAttack = gs.draggle.attacks[Math.floor(Math.random() * gs.draggle.attacks.length)]

        gs.queue.push(() => {
          const enemyMessage = gs.draggle.attack({
            attack: randomAttack,
            recipient: gs.emby,
            renderedSprites: gs.renderedSprites,
            audio,
            gsap,
            onComplete: () => {
              if (gs.emby.health <= 0) {
                gs.queue.push(() => {
                  const faintMessage = gs.emby.faint(audio, gsap)
                  setBattleUI((prev) => ({ ...prev, dialogueText: faintMessage, isDialogueVisible: true }))
                })
                gs.queue.push(() => {
                  gsap.to('#overlappingDiv', {
                    opacity: 1,
                    onComplete: () => {
                      cancelAnimationFrame(battleAnimationIdRef.current)
                      animate()
                      setBattleUI({ visible: false, enemyHealth: 100, playerHealth: 100, selectedAttackType: {}, dialogueText: '', isDialogueVisible: false })
                      gsap.to('#overlappingDiv', { opacity: 0 })
                      gs.battle.initiated = false
                      audio.Map.play()
                      setIsInventoryVisible(true)
                    }
                  })
                })
              }
            }
          })
          setBattleUI((prev) => ({ ...prev, dialogueText: enemyMessage, isDialogueVisible: true }))
        })

        schedulePostEnemyHeal()
      }
    })

    setBattleUI((prev) => ({
      ...prev,
      dialogueText: message,
      isDialogueVisible: true,
      enemyHealth: gs.draggle.health,
      playerHealth: gs.emby.health
    }))
  }

  const handleDialogueClick = () => {
    const gs = gameStateRef.current
    if (gs.queue.length > 0) {
      gs.queue[0]()
      gs.queue.shift()
    } else {
      setBattleUI((prev) => ({ ...prev, isDialogueVisible: false }))
    }
  }

  const animateBattle = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    const gs = gameStateRef.current

    battleAnimationIdRef.current = window.requestAnimationFrame(animateBattle)

    if (!gs.battleBackground) {
      const battleBackgroundImage = new Image()
      battleBackgroundImage.src = '/img/battleBackground.png'
      gs.battleBackground = new Sprite({
        position: { x: 0, y: 0 },
        image: battleBackgroundImage
      })
    }

    gs.battleBackground.draw(c)

    gs.renderedSprites.forEach((sprite) => {
      sprite.draw(c)
    })
  }

  // Game animation loop
  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    const gs = gameStateRef.current

    animationIdRef.current = window.requestAnimationFrame(animate)

    gs.renderables.forEach((renderable) => {
      renderable.draw(c)
    })

    let moving = true
    gs.player.animate = false

    updateJumpState()
    handleCollectiblePickups()

    const currentSpeed = getCurrentSpeed()
    gs.player.frames.hold = gs.keys.Shift?.pressed ? 6 : 10

    if (marketplaceState.isOpen) return
    if (gs.battle.initiated) return

    // Check for battle initiation
    if (gs.keys.w.pressed || gs.keys.a.pressed || gs.keys.s.pressed || gs.keys.d.pressed) {
      for (let i = 0; i < gs.battleZones.length; i++) {
        const battleZone = gs.battleZones[i]
        const overlappingArea =
          (Math.min(gs.player.position.x + gs.player.width, battleZone.position.x + battleZone.width) -
            Math.max(gs.player.position.x, battleZone.position.x)) *
          (Math.min(gs.player.position.y + gs.player.height, battleZone.position.y + battleZone.height) -
            Math.max(gs.player.position.y, battleZone.position.y))
        
        if (
          rectangularCollision({
            rectangle1: gs.player,
            rectangle2: battleZone
          }) &&
          overlappingArea > (gs.player.width * gs.player.height) / 2 &&
          Math.random() < 0.01
        ) {
          window.cancelAnimationFrame(animationIdRef.current)

          audio.Map.stop()
          audio.initBattle.play()
          audio.battle.play()

          gs.battle.initiated = true
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

    // Movement logic
    if (gs.keys.w.pressed && gs.lastKey === 'w') {
      gs.player.animate = true
      gs.player.image = gs.player.sprites.up

      checkForCharacterCollision({
        characters: gs.characters,
        player: gs.player,
        characterOffset: { x: 0, y: currentSpeed }
      })

      for (let i = 0; i < gs.boundaries.length; i++) {
        const boundary = gs.boundaries[i]
        if (
          rectangularCollision({
            rectangle1: gs.player,
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

      if (moving) gs.movables.forEach((movable) => (movable.position.y += currentSpeed))
    } else if (gs.keys.a.pressed && gs.lastKey === 'a') {
      gs.player.animate = true
      gs.player.image = gs.player.sprites.left

      checkForCharacterCollision({
        characters: gs.characters,
        player: gs.player,
        characterOffset: { x: currentSpeed, y: 0 }
      })

      for (let i = 0; i < gs.boundaries.length; i++) {
        const boundary = gs.boundaries[i]
        if (
          rectangularCollision({
            rectangle1: gs.player,
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

      if (moving) gs.movables.forEach((movable) => (movable.position.x += currentSpeed))
    } else if (gs.keys.s.pressed && gs.lastKey === 's') {
      gs.player.animate = true
      gs.player.image = gs.player.sprites.down

      checkForCharacterCollision({
        characters: gs.characters,
        player: gs.player,
        characterOffset: { x: 0, y: -currentSpeed }
      })

      for (let i = 0; i < gs.boundaries.length; i++) {
        const boundary = gs.boundaries[i]
        if (
          rectangularCollision({
            rectangle1: gs.player,
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

      if (moving) gs.movables.forEach((movable) => (movable.position.y -= currentSpeed))
    } else if (gs.keys.d.pressed && gs.lastKey === 'd') {
      gs.player.animate = true
      gs.player.image = gs.player.sprites.right

      checkForCharacterCollision({
        characters: gs.characters,
        player: gs.player,
        characterOffset: { x: -currentSpeed, y: 0 }
      })

      for (let i = 0; i < gs.boundaries.length; i++) {
        const boundary = gs.boundaries[i]
        if (
          rectangularCollision({
            rectangle1: gs.player,
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

      if (moving) gs.movables.forEach((movable) => (movable.position.x -= currentSpeed))
    }
  }

  const getCurrentSpeed = () => {
    const gs = gameStateRef.current
    if (gs.keys.Shift?.pressed) {
      return PLAYER_BASE_SPEED * PLAYER_SPRINT_MULTIPLIER
    }
    return PLAYER_BASE_SPEED
  }

  const updateJumpState = () => {
    const gs = gameStateRef.current
    const jump = gs.player.jumpState
    if (!jump) return

    if (!jump.isJumping) {
      if (jump.cooldown > 0) jump.cooldown--
      gs.player.drawOffset.y = 0
      return
    }

    jump.velocity -= PLAYER_JUMP_CONFIG.gravity
    jump.elevation += jump.velocity

    if (jump.elevation <= 0) {
      jump.elevation = 0
      jump.velocity = 0
      jump.isJumping = false
      jump.cooldown = PLAYER_JUMP_CONFIG.cooldownFrames
      gs.player.drawOffset.y = 0
      return
    }

    gs.player.drawOffset.y = -jump.elevation
  }

  const initiateJump = () => {
    const gs = gameStateRef.current
    const jump = gs.player.jumpState
    if (!jump || jump.isJumping || jump.cooldown > 0) return
    jump.isJumping = true
    jump.velocity = PLAYER_JUMP_CONFIG.power
  }

  const handleCollectiblePickups = async () => {
    const gs = gameStateRef.current
    if (gs.battle.initiated) return

    gs.collectibles.forEach((collectible) => {
      if (collectible.collected) return
      if (
        rectangularCollision({
          rectangle1: gs.player,
          rectangle2: collectible
        })
      ) {
        collectible.collected = true
        addCollectibleToInventory(collectible)
        showLootToast(`Collected ${collectible.name}!`)
      }
    })

    // Handle glowing points collection
    for (const glowingPoint of gs.glowingPoints) {
      if (glowingPoint.collected) continue
      if (
        rectangularCollision({
          rectangle1: gs.player,
          rectangle2: glowingPoint
        })
      ) {
        glowingPoint.collected = true
        showLootToast('Glowing point found! Claim the reward above.')
        setClaimPopup({
          visible: true,
          type: 'glow',
          amount: glowingPoint.pointsValue || 100
        })
        break // Only process one glowing point at a time
      }
    }
  }

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const gs = gameStateRef.current

      if (marketplaceState.isOpen) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'm') {
          closeMarketplace()
        }
        return
      }

      if (gs.player.isInteracting) {
        if (e.key === ' ') {
          gs.player.interactionAsset.dialogueIndex++
          const { dialogueIndex, dialogue } = gs.player.interactionAsset
          
          if (dialogueIndex <= dialogue.length - 1) {
            setCharacterDialogue({ text: dialogue[dialogueIndex], visible: true })
            return
          }

          const completedCharacter = gs.player.interactionAsset
          gs.player.isInteracting = false
          gs.player.interactionAsset.dialogueIndex = 0
          setCharacterDialogue({ text: '', visible: false })
          
          if (completedCharacter.isMarketplaceVendor) {
            openMarketplace()
          }
        }
        return
      }

      switch (e.key) {
        case ' ':
          if (gs.player.interactionAsset) {
            const firstMessage = gs.player.interactionAsset.dialogue[0]
            setCharacterDialogue({ text: firstMessage, visible: true })
            gs.player.isInteracting = true
          } else {
            initiateJump()
          }
          break
        case 'w':
          gs.keys.w.pressed = true
          gs.lastKey = 'w'
          break
        case 'a':
          gs.keys.a.pressed = true
          gs.lastKey = 'a'
          break
        case 's':
          gs.keys.s.pressed = true
          gs.lastKey = 's'
          break
        case 'd':
          gs.keys.d.pressed = true
          gs.lastKey = 'd'
          break
        case 'Shift':
          gs.keys.Shift.pressed = true
          break
      }
    }

    const handleKeyUp = (e) => {
      const gs = gameStateRef.current
      switch (e.key) {
        case 'w':
          gs.keys.w.pressed = false
          break
        case 'a':
          gs.keys.a.pressed = false
          break
        case 's':
          gs.keys.s.pressed = false
          break
        case 'd':
          gs.keys.d.pressed = false
          break
        case 'Shift':
          gs.keys.Shift.pressed = false
          break
      }
    }

    const handleClick = () => {
      if (!audioStarted) {
        audio.Map.play()
        setAudioStarted(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('click', handleClick)
    }
  }, [marketplaceState.isOpen, audioStarted])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'black'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          border: '6px solid #ffffff',
          boxShadow: '0 0 24px rgba(0, 0, 0, 0.85)'
        }}
      >
      <div
        id="overlappingDiv"
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          transform: 'scale(0.9)',
          transformOrigin: 'top left'
        }}
      >
      <ConnectButton />
      </div>

      <MarketplacePanel
        isOpen={marketplaceState.isOpen}
        items={marketplaceState.items}
        isLoading={marketplaceState.isLoading}
        error={marketplaceState.error}
        note={marketplaceState.note}
        playerPoints={points}
        onClose={closeMarketplace}
        onRefresh={() => fetchMarketplaceItems(true)}
        onPurchase={async (item) => {
          if (points < item.price) {
            setLootToast({ message: 'Not enough Stardust!', visible: true })
            setTimeout(() => setLootToast({ message: '', visible: false }), 2000)
            return
          }
          
          // Show loading state
          setLootToast({ message: 'Processing purchase on blockchain...', visible: true })
          
          // Call redeemPoints function for purchase
          if (account && suiClient && signAndExecuteTransaction) {
            if (!account) {
              console.log("No account connected");
              setLootToast({ message: 'Please connect your wallet first!', visible: true })
              setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
              return
            }
            
            const tx = new Transaction();
            tx.setSender(account.address);
            const packageId = "0x7f1212e08fcfe293b7299f1e5c0ccc2c6dafd9552d9e9c3bbd407934133748a3"; // Contract Address
            
            // public fun reedem_points(userPts:&mut UserPoints, amount:u256, ctx: &mut TxContext) {
            tx.moveCall({
              package: packageId,
              module: "pokemongame",
              function: "reedem_points",
              arguments: [
                tx.sharedObjectRef({
                  objectId: "0x80137994fcd221d2497df286dec9f7d316b19ea6a709c7f7aeeaafcd8d36fd53",        // nftCount
                  mutable: true,                  // read-only ref (&)
                  initialSharedVersion: 3304, // ONELABS
                }),
                tx.pure.u256(item.price),
              ],
            });
            
            // Prepare transaction for Enoki wallets (set OCT gas payment if needed)
            await prepareTransactionForEnoki(tx, suiClient, account.address, wallets?.currentWallet || null);
            
            console.log("Processing Transaction");
            
            signAndExecuteTransaction.mutate(
              {
                transaction: tx
              },
              {
                onError: (e) => {
                  console.log("Tx Failed! from here");
                  console.log(e);
                  
                  // Check if it's an epoch expiration error for Enoki wallets
                  if (isEpochExpirationError(e) && wallets?.currentWallet && isEnokiWallet(wallets.currentWallet)) {
                    const errorMessage = getEpochExpirationMessage(e);
                    console.error("Enoki Session Expired:", errorMessage);
                    setLootToast({ 
                      message: '⚠️ Your zkLogin session has expired! Please disconnect and reconnect your wallet.', 
                      visible: true 
                    })
                    setTimeout(() => setLootToast({ message: '', visible: false }), 5000)
                  } else {
                    setLootToast({ message: 'Transaction failed. Please try again.', visible: true })
                    setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
                  }
                },
                onSuccess: async ({ digest }) => {
                  try {
                    let p = await suiClient.waitForTransaction({
                      digest,
                      options: {
                        showEffects: true
                      }
                    });
                    console.log("Transaction Result:", p);
                    console.log("tx digest:", digest);
                    reset();
                    console.log("Tx Succesful!");
                    
                    // Add item to inventory and record purchase
                    addCollectibleToInventory({
                      id: item.id,
                      name: item.name,
                      description: item.description,
                      gifPath: item.gifPath || item.image_url
                    })
                    await recordMarketplacePurchase(item, item.price)
                    
                    // Update local points
                    const playerId = getPlayerId(account)
                    const newTotal = points - item.price
                    setPoints(newTotal)
                    const storageKey = `${POINTS_STORAGE_KEY}-${playerId}`
                    window.localStorage.setItem(storageKey, String(newTotal))
                    await persistPointsToSupabase(newTotal)
                    
                    setLootToast({ message: `Purchased ${item.name}!`, visible: true })
                    setTimeout(() => setLootToast({ message: '', visible: false }), 2000)
                  } catch (error) {
                    console.error('Error waiting for transaction:', error)
                    setLootToast({ message: 'Transaction completed but failed to verify.', visible: true })
                    setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
                  }
                }
              }
            );
          } else {
            // Fallback if wallet not connected
            const success = await deductPoints(item.price)
            if (success) {
              addCollectibleToInventory({
                id: item.id,
                name: item.name,
                description: item.description,
                gifPath: item.gifPath || item.image_url
              })
              await recordMarketplacePurchase(item, item.price)
              setLootToast({ message: `Purchased ${item.name}!`, visible: true })
              setTimeout(() => setLootToast({ message: '', visible: false }), 2000)
            } else {
              setTimeout(() => setLootToast({ message: '', visible: false }), 3000)
            }
          }
        }}
      />

      <PointsDisplay
        points={points}
        inventoryVisible={isInventoryVisible}
        onToggleInventory={() => setIsInventoryVisible((prev) => !prev)}
        canToggleInventory={!battleUI.visible}
      />

      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>

      <LootToast message={lootToast.message} isVisible={lootToast.visible} />

      {isInventoryVisible && (
        <InventoryPanel
          items={inventoryItems}
          bonuses={inventoryBonuses}
          onToggle={() => setIsInventoryVisible(false)}
        />
      )}

      <CharacterDialogue text={characterDialogue.text} isVisible={characterDialogue.visible} />

      <BattleUI
        isVisible={battleUI.visible}
        enemyHealth={battleUI.enemyHealth}
        playerHealth={battleUI.playerHealth}
        attacks={monsters.Emby.attacks}
        selectedAttackType={battleUI.selectedAttackType}
        dialogueText={battleUI.dialogueText}
        isDialogueVisible={battleUI.isDialogueVisible}
        onAttackClick={handleBattleAttack}
        onAttackHover={(attack) => setBattleUI((prev) => ({ ...prev, selectedAttackType: attack }))}
        onDialogueClick={handleDialogueClick}
      />

      {/* Claim Points Popup */}
      {claimPopup.visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setClaimPopup({ visible: false, type: null, amount: 100 })
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
              {claimPopup.type === 'battle' ? '🏆 Victory Reward' : '⭐ Glowing Point'}
            </h2>
            <p style={{ marginBottom: '24px', color: '#666', fontSize: '16px' }}>
              Claim <strong>{claimPopup.amount.toLocaleString()} points</strong> on-chain
              {claimPopup.type === 'battle' ? ' for winning the battle!' : ' from your discovery!'}
            </p>
            {!account && (
              <p style={{ marginBottom: '16px', color: '#ff6b6b', fontSize: '14px' }}>
                Please connect your wallet first
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setClaimPopup({ visible: false, type: null, amount: 2000 })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => getPoints(claimPopup.amount)}
                disabled={!account}
                style={{
                  padding: '12px 24px',
                  backgroundColor: account ? '#4CAF50' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: account ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: account ? 1 : 0.6
                }}
              >
                Claim Points
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

