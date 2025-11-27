# 🎮 One Poke Battle

<div align="center">

![One Poke Battle](https://img.shields.io/badge/One%20Poke%20Battle-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Sui Network](https://img.shields.io/badge/Sui%20Network-Integrated-orange)

**A Pokemon-style 2D game with blockchain integration, NFT marketplace, and on-chain rewards!**

[🌐 Live Demo](https://one-poke-battle.vercel.app/) • [📖 Documentation](#-features) • [🚀 Deploy](#-deploy-to-vercel)

</div>

---

## ✨ What is One Poke Battle?

One Poke Battle is a fully-featured Pokemon-style 2D game built with modern web technologies. Explore Pellet Town, battle monsters, collect items, and earn blockchain rewards! The game features:

- 🎯 **Exploration Mode** - Navigate through Pellet Town with WASD controls
- ⚔️ **Turn-Based Battles** - Fight monsters in strategic combat
- 🎒 **Inventory System** - Collect items with special battle bonuses
- 💎 **NFT Marketplace** - Buy and sell items powered by Supabase
- ⛓️ **Blockchain Integration** - Earn and redeem points on Sui Network
- 🎨 **Animated GIFs** - Beautiful animated inventory items
- 🎵 **Audio System** - Immersive sound effects and background music

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Live Deployment

**🎮 Play the game now:** [https://one-poke-battle.vercel.app/](https://one-poke-battle.vercel.app/)

The game is fully deployed and ready to play! Connect your wallet, explore Pellet Town, and start collecting rewards.

### Deploy to Vercel

This project is pre-configured for easy deployment on Vercel:

1. **Connect your GitHub repository** to Vercel
2. **Import the project** - Vercel will auto-detect Vite configuration
3. **Deploy** - No additional configuration needed!

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing support (all routes redirect to index.html)
- Optimized caching for static assets (GIFs, images, audio)
- Node.js 18 specified via `.nvmrc`

### Build Requirements
- Node.js 18+ (specified in `.nvmrc`)
- npm 9+ (specified in `package.json` engines)

## 🎮 Controls

- **WASD**: Move player
- **Shift**: Sprint/Run faster
- **Space**: Jump (when not near character) / Interact (when near character)
- **Esc/M**: Close marketplace
- **Mouse Click**: Advance dialogue in battle

## 🏗️ Project Structure

```
├── public/               # Static assets
│   ├── audio/           # Sound effects and music
│   └── img/             # Game sprites and images
├── src/
│   ├── components/      # React components
│   │   ├── Game.jsx            # Main game component
│   │   ├── BattleUI.jsx        # Battle interface
│   │   ├── InventoryPanel.jsx  # Inventory display
│   │   ├── MarketplacePanel.jsx # NFT marketplace
│   │   ├── LootToast.jsx       # Item pickup notifications
│   │   └── CharacterDialogue.jsx # Character dialogue box
│   ├── data/           # Game data
│   │   ├── attacks.js          # Attack definitions
│   │   ├── monsters.js         # Monster data
│   │   ├── collectibles.js     # Collectible items
│   │   ├── collisions.js       # Collision map
│   │   ├── battleZones.js      # Battle trigger zones
│   │   └── characters.js       # NPC character map
│   ├── lib/            # Core game logic
│   │   ├── classes.js          # Game entity classes
│   │   ├── audio.js            # Audio system
│   │   ├── utils.js            # Utility functions
│   │   └── supabaseClient.js   # Supabase integration
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
└── vite.config.js      # Vite configuration
```

## 🎯 Features

### Exploration Mode
- Walk around the Pellet Town map
- Collect special items (Ancient Orb, Sun Shard, Aqua Bloom)
- Talk to NPCs
- Sprint by holding Shift
- Jump with Space bar

### Battle System
- Random encounters in grass areas
- Turn-based combat with Emby vs Draggle
- Multiple attack types (Tackle, Fireball)
- Health tracking and animations
- Victory/defeat conditions

### Inventory System
- Collect items that grant special bonuses
- Item effects apply in battles:
  - Ancient Orb: +30% Fireball damage
  - Sun Shard: Restore 25 HP at battle start
  - Aqua Bloom: Heal 15 HP after enemy attacks
- Persistent storage using localStorage

### NFT Marketplace
- Browse NFT listings from Supabase
- Fallback to local seed data if database is empty
- Vendor NPC interaction to access marketplace
- Animated GIF support for inventory and marketplace items

### Blockchain Integration
- **Sui Network Integration** - Full blockchain support via @mysten/dapp-kit
- **Wallet Connection** - Connect with Sui-compatible wallets
- **Earn Points** - Collect glowing points and win battles to earn Stardust
- **Redeem Points** - Spend Stardust in the marketplace for powerful items
- **On-Chain Transactions** - All point operations are recorded on-chain
- **Real-Time Updates** - Balance updates instantly after transactions

## 🔧 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool and dev server
- **GSAP** - Professional animation library
- **HTML5 Canvas** - High-performance game rendering

### Backend & Services
- **Supabase** - PostgreSQL database for marketplace and player data
- **Sui Network** - Blockchain for on-chain points and transactions
- **@mysten/dapp-kit** - Sui wallet integration and transaction handling

### Audio & Assets
- **Howler.js** - Advanced audio management
- **Animated GIFs** - Beautiful item animations
- **Pixel Art Sprites** - Retro-style game graphics

## 🎨 Game Assets

All sprites and audio files are located in the `public` directory:
- Character sprites (player, villager, old man)
- Monster sprites (Emby, Draggle)
- Map tiles and backgrounds
- Sound effects and background music

## 🔐 Supabase Configuration

The game connects to Supabase for the NFT marketplace feature. The configuration is in `src/lib/supabaseClient.js`. To use your own database:

1. Create a Supabase project
2. Create a table named `nft_marketplace` with columns:
   - `id` (text, primary key)
   - `name` (text)
   - `description` (text)
   - `price` (integer)
   - `image_url` (text)
3. Update the Supabase URL and anon key in `src/lib/supabaseClient.js`

## 🎯 Gameplay Features

### Collectibles & Rewards
- **Glowing Points** - Collect 20 glowing points scattered across the map
- **Battle Rewards** - Win battles to earn 50 Stardust points
- **Collectible Items** - Find special items that grant battle bonuses
- **Claim System** - Claim your rewards on-chain via wallet transactions

### Battle System
- **Random Encounters** - 1% chance when walking on grass tiles
- **Turn-Based Combat** - Strategic battles with multiple attack types
- **Item Bonuses** - Collected items provide combat advantages
- **Victory Rewards** - Earn points and items for winning battles

### Inventory & Marketplace
- **Animated Items** - Beautiful GIF animations for all collectibles
- **Item Effects** - Each item provides unique battle bonuses
- **Marketplace** - Purchase powerful items with earned Stardust
- **Persistent Storage** - Progress saved to localStorage and Supabase

## 📝 Technical Notes

- The game automatically saves inventory progress to localStorage and Supabase
- Battle encounters occur randomly when walking in grass areas (1% chance)
- All game logic runs on a canvas animation loop for smooth 60fps gameplay
- The UI is built with React components overlaying the canvas
- Blockchain transactions are handled asynchronously with proper error handling

## 🐛 Troubleshooting

If you encounter issues:
1. Clear browser cache and localStorage
2. Make sure all assets are in the `public` directory
3. Check browser console for errors
4. Verify Node.js version is 18 or higher

## 🔗 Links

- **🌐 Live Game:** [https://one-poke-battle.vercel.app/](https://one-poke-battle.vercel.app/)
- **📦 GitHub Repository:** [https://github.com/sarthai0062-debug/one-poke-battle](https://github.com/sarthai0062-debug/one-poke-battle)
- **📊 Vercel Dashboard:** [View Deployments](https://vercel.com/sarss-projects/one-poke-battle)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📄 License

This is a demonstration project. Feel free to use and modify as needed.

---

<div align="center">

**Made with ❤️ using React, Vite, and Sui Network**

⭐ Star this repo if you like it!

</div>

