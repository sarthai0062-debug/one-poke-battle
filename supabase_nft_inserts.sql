-- Supabase NFT Marketplace Insert Statements
-- Run these in your Supabase SQL Editor

-- 1. Ember Flare Charm - Fire attack booster
INSERT INTO public.nft_marketplace (name, description, price, image_url)
VALUES (
  'Ember Flare Charm',
  'A mystical charm forged from Draggle scales. Permanently increases Fireball damage by 35% and adds a burn effect that deals 5 damage per turn for 2 turns.',
  450,
  './img/fireball.png'
);

-- 2. Emby Guardian Relic - Healing and protection
INSERT INTO public.nft_marketplace (name, description, price, image_url)
VALUES (
  'Emby Guardian Relic',
  'An ancient artifact blessed by Emby spirits. Restores 40 HP at battle start and grants a protective shield that reduces all incoming damage by 15% for the first 3 turns.',
  520,
  './img/embySprite.png'
);

-- 3. Draggle Scale Armor - Defense and counter-attack
INSERT INTO public.nft_marketplace (name, description, price, image_url)
VALUES (
  'Draggle Scale Armor',
  'Crafted from the toughest Draggle scales found in Pellet Town. Reduces enemy attack damage by 25% and reflects 10% of damage back to attackers. Perfect for long battles.',
  600,
  './img/draggleSprite.png'
);

