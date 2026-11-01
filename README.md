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

---

# Deutsch Party (`deutsch/`)

A Kahoot-style German quiz (control language: French) with cute rivals and a drawing reward.
It is a separate home-screen app at the `deutsch/` address of this site (…/deutsch/), installed the same way as above.

Modes: articles (der/die/das), verb conjugation (all 6 persons), vocabulary & spelling, grammar (sein/ihr, im/in der/auf dem, es gibt), and a mixed "Grand Quiz".

## Adding the words of the week

1. In `deutsch/words.js`, add a line to `weeks` (e.g. `{ week: 1, label: "Semaine du 3 novembre" }`) and add the new nouns/verbs/words with `week: 1`.
   The newest week comes up about 3.5× more often; all older words stay in rotation.
2. Change `VERSION` in `deutsch/sw.js` (e.g. `deutsch-v2`) so the iPhone/iPad picks up the update.
