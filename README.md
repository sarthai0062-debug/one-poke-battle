# One Poke Battle - React + Vite

A Pokemon-style 2D game built with React and Vite, featuring blockchain integration with Sui Network and NFT marketplace functionality.
- Exploration mode with player movement (WASD controls)
- Battle system with turn-based combat
- Collectible items with inventory system
- Character dialogue and interactions
- NFT Marketplace integration with Supabase
- Audio system with background music and sound effects
- Smooth animations using GSAP

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

## 🌐 Deploy to Vercel

This project is configured for easy deployment on Vercel:

1. **Connect your GitHub repository** to Vercel
2. **Import the project** - Vercel will auto-detect Vite configuration
3. **Deploy** - No additional configuration needed!

The `vercel.json` file is already configured with:
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- SPA routing support (all routes redirect to index.html)
- Optimized caching for static assets (GIFs, images, audio)
- Node.js 18 specified via `.nvmrc`

Your app will be live at: `https://your-project-name.vercel.app`

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

## 🔧 Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **GSAP** - Animation library
- **Howler.js** - Audio management
- **Supabase** - Backend database
- **HTML5 Canvas** - Game rendering

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

## 📝 Notes

- The game automatically saves inventory progress to localStorage
- Battle encounters occur randomly when walking in grass areas (1% chance)
- All game logic runs on a canvas animation loop
- The UI is built with React components overlaying the canvas

## 🐛 Troubleshooting

If you encounter issues:
1. Clear browser cache and localStorage
2. Make sure all assets are in the `public` directory
3. Check browser console for errors
4. Verify Node.js version is 18 or higher

## 📄 License

This is a demonstration project. Feel free to use and modify as needed.

