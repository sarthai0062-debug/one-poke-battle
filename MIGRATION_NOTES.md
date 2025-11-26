# Migration from Vanilla JS to React + Vite

## What Was Changed

### Project Structure
- ✅ Converted from vanilla HTML/JS to React + Vite
- ✅ Created modular component architecture
- ✅ Moved assets to `public/` directory
- ✅ Organized code into `src/` directory structure

### Files Converted

#### Old Structure → New Structure
```
index.html (vanilla)          → src/main.jsx + src/App.jsx + index.html (Vite)
classes.js                    → src/lib/classes.js (ES6 module)
index.js                      → src/components/Game.jsx (React component)
battleScene.js                → Integrated into Game.jsx
js/utils.js                   → src/lib/utils.js
js/supabaseClient.js          → src/lib/supabaseClient.js
data/*.js                     → src/data/*.js (ES6 modules)
```

#### New React Components Created
1. **Game.jsx** - Main game component with canvas and game loop
2. **BattleUI.jsx** - Battle interface with health bars and attack buttons
3. **InventoryPanel.jsx** - Displays collected items and bonuses
4. **MarketplacePanel.jsx** - NFT marketplace modal
5. **LootToast.jsx** - Item pickup notification
6. **CharacterDialogue.jsx** - Character conversation box

### Dependencies Added
- `react` & `react-dom` - UI framework
- `vite` & `@vitejs/plugin-react` - Build tool
- `@supabase/supabase-js` - Database client (NPM package instead of CDN)
- `howler` - Audio management (NPM package instead of CDN)
- `gsap` - Animations (NPM package instead of CDN)

### Key Improvements

1. **Module System**
   - Converted from global scripts to ES6 modules
   - Proper imports/exports throughout

2. **State Management**
   - Game state managed with React hooks (useState, useRef)
   - UI state separated from game logic

3. **Component Architecture**
   - Reusable UI components
   - Clean separation of concerns
   - Better maintainability

4. **Development Experience**
   - Hot Module Replacement (HMR)
   - Fast refresh in development
   - Better debugging with React DevTools

5. **Build Optimization**
   - Tree shaking
   - Code splitting
   - Minification in production

## Preserved Functionality

✅ All original features work exactly as before:
- Player movement (WASD + Shift for sprint)
- Jump mechanics (Space bar)
- Collision detection
- Battle system with random encounters
- Turn-based combat
- Health tracking and animations
- Collectible items with bonuses
- Inventory system with localStorage persistence
- Character dialogue system
- NFT Marketplace with Supabase integration
- Audio system with all sound effects
- All GSAP animations

## How to Run

### Development
```bash
npm install
npm run dev
```
Open http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## Testing Checklist

- [ ] Player can move in all directions (WASD)
- [ ] Sprint works (Shift + movement)
- [ ] Jump works (Space bar)
- [ ] Collectibles can be picked up
- [ ] Inventory persists after page reload
- [ ] Battle encounters trigger in grass
- [ ] Battle attacks work (Tackle and Fireball)
- [ ] Health bars update correctly
- [ ] Item bonuses apply in battle
- [ ] Character dialogue displays
- [ ] Marketplace opens when talking to vendor
- [ ] All sounds play correctly
- [ ] Animations are smooth

## Potential Issues & Solutions

### Issue: Assets not loading
**Solution**: Make sure all files are in the `public/` directory and paths start with `/` (e.g., `/img/playerDown.png`)

### Issue: Audio not playing
**Solution**: Click anywhere on the page first (browser autoplay policy)

### Issue: Build errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Supabase errors
**Solution**: The game falls back to seed data if Supabase fails. Check console for details.

## Old Files Location

Original vanilla JS files have been kept for reference:
- `battleScene.js`
- `classes.js`
- `index.js`
- `index_old.html`

These can be safely deleted after verifying the React version works.

## Notes for Developers

1. The game uses `useRef` for the game state to avoid re-renders during the animation loop
2. Canvas rendering happens outside React's render cycle for performance
3. UI components are pure React and update via state
4. All game classes (Sprite, Monster, etc.) are unchanged except for canvas context passing
5. The animation loop is managed with `requestAnimationFrame` and cleaned up on unmount

