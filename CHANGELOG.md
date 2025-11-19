# Night Harvest — Changelog

## Day 1: Initial Release
**Date:** November 17, 2025

### Features
- **Game Loop:** Canvas-based real-time rendering with 60 FPS target.
- **Day/Night Cycle:** 60% day, 40% night phases repeating.
- **Resource Gathering:** Autonomous drones gather scrap from resource nodes and return to base.
- **Building Lights:** Place defensive light towers to illuminate areas and protect against enemies at night.
- **Enemy Spawning:** Enemies spawn from map edges during night; chase toward base and lit areas.
- **Base Defense:** Base takes damage from enemy contact; tracks health.
- **HUD:** Display day count, scrap, base health, current time of day.
- **Simple Controls:** Click buttons to deploy drones or build lights (fixed placement initially).

### Technical
- No build step; runs directly in browser via Live Server.
- Pure HTML5 Canvas + vanilla JavaScript.
- Responsive to window resize.

---

## Day 2: Placement UI & Difficulty Scaling
**Date:** November 18, 2025

### Features
- **Click-to-Place Lights:** Toggle placement mode with "Build Light" button, then click map to place. Visual preview shows placement radius.
- **Base Health HUD:** Added base HP display to inform players of damage taken.
- **Resource Regeneration:** New resource nodes spawn during daytime phase.
- **Enemy Difficulty Scaling:** Enemies get +15% faster and stronger each day. Enemy spawn rate increases (shorter intervals as days progress).
- **Wave Messages:** On-screen notifications show wave completion ("Wave X survived!") or game over ("Base destroyed! Day X").
- **Day Counter:** HUD dynamically displays current day.

### UI/UX
- Enhanced help text to guide new players.
- Pulsing animation on placement mode button to indicate active state.
- Larger, readable wave message overlay in center of screen.
- Responsive HUD layout on mobile.

### Fixes
- Fixed placement button logic to toggle mode cleanly.

---

## Day 3: Scrap Transfer, Resource Decay, and Bug Fixes
**Date:** November 19, 2025

### Features
- **Drone Scrap Transfer:** Drones now actually deliver carried scrap to the base on contact (full amount, no truncation).
- **Increased Gather Rate:** Drones gather 2.5x faster (25 units/sec vs 10). Efficiency increased to 80% (from 60%).
- **Resource Decay:** Resource nodes passively shrink over time (−0.12 per second), making nodes disappear naturally and adding time pressure.

### Bugs Fixed
- **Movement Math:** Fixed NaN/divide-by-zero errors when unit/enemy reaches target (added safe division checks).
- **Game Over Logic:** Added persistent game-over state; buttons disabled when base health ≤ 0.
- **Scrap Precision:** Removed `Math.floor()` truncation that was losing small amounts of scrap during delivery.
- **Target Cleanup:** Drones clear their target after delivering scrap, forcing re-pathfinding.

### Balance
- Game is now more playable; scrap flows meaningfully.
- Resource nodes provide time-based challenge (limited gathering window).
- Early game scrap boost (120 starting) helps first-time players.

---

## Day 4: Upgrade Shop, Enemy Variety, and Audio System
**Date:** November 19, 2025

### Features
- **Upgrade Shop:** New "🛍️ Shop" button opens purchase menu with three upgrades:
  - **Gather +50%:** Increases drone gather rate multiplier (×1.5). Cost: 100 scrap. One-time purchase.
  - **Drone HP +5:** Increases drone durability. Cost: 120 scrap. One-time purchase.
  - **Light Range +40:** Increases light tower radius for better coverage. Cost: 150 scrap. One-time purchase.
- **Enemy Types:** Two enemy archetypes now spawn:
  - **Scout (50% spawn rate, 80% tank spawn rate):** Faster (×1.3) but frailer (×0.8 HP). Marked with "S" label.
  - **Tank (20% spawn rate):** Slower (×0.6) but tougher (×1.8 HP). Rendered larger (red).
  - **Default (30% spawn rate):** Balanced stats.
- **Web Audio Synthesis:** Procedural sound effects (no audio files required):
  - **Upgrade Sound:** Two-note chime on purchase.
  - **Spawn Sound:** Short beep when deploying drones.
  - **Hit Sound:** Low-frequency blip on collision/damage.
  - Graceful fallback if audio unavailable (no errors).

### UI/UX
- Shop panel positioned in HUD with four buttons (three upgrades + close).
- Disabled upgrade buttons after purchase (visual feedback).
- Enemy type hints (color, size, label) help identify threat level.

### Technical
- Web Audio API synthesis using oscillators + gain nodes.
- No external dependencies or audio files.
- State tracking for upgrade purchases prevents rebuying.
- Scaled enemy stats by day multiplier and type.

### Balance
- Upgrades provide meaningful mid-game progression (scaling with longer games).
- Enemy variety increases tactical challenge (scouts require different defense than tanks).
- Audio feedback reinforces player actions without distraction.

---

## Summary: Progression from Day 1 → Day 4

| Aspect | Day 1 | Day 4 |
|--------|-------|-------|
| **Gameplay Loop** | Basic gather/build/defend | Advanced: gather → upgrade → scale difficulty |
| **Drones** | Static unit, fixed deployment | Customizable via upgrades, meaningful scrap transfer |
| **Resources** | Infinite nodes | Finite with decay, regen each day |
| **Enemies** | Single type, flat scaling | Multiple types, day-based difficulty curve |
| **Feedback** | Visual + wave messages | Visual + procedural audio + upgrades |
| **Progression** | Survive nights | Survive + invest scrap in upgrades for long-term scaling |

---

## Next Planned Expansions (Future Days)
- **Persistent save/load** (localStorage): Track high score, carry progress between sessions.
- **Advanced unit commands:** Manual selection, movement orders, hold positions.
- **More enemy types:** Ranged attackers, swarmers, bosses.
- **Map features:** Terrain obstacles, tunnels, regenerating safe zones.
- **Tutorial/help overlay:** Interactive walkthrough for new players.
- **Leaderboard:** Compare days survived with other players (local or online).
