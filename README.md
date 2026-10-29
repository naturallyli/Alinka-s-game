# Alinka's Day

A cozy 3D game for one player. Alinka does chores, homework and cooking to earn stars, then spends them to make friends in the garden.

## Play on an iPhone or iPad

1. Open the game's address in **Safari** (it needs internet the first time).
2. Tap **Share**, then **Add to Home Screen**.
3. Start the game from the new Alinka icon. After the first start it works without internet.

Progress is saved on the device. Grown-ups can back it up from the grown-up corner (press and hold ⚙️ for 2 seconds).

## Changing the game

The game's source is `src/game.html`. Tasks, star values, friends and vocabulary are in the `CONFIG` block near the top of its script.

After a change:
1. Run `python3 build.py`. It rebuilds `index.html` (the home-screen app) and `alinka-offline.html` (a single file that works without internet).
2. Change `VERSION` in `sw.js`, so phones pick up the new version.
