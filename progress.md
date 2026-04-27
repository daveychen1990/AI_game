Original prompt: PLEASE IMPLEMENT THIS PLAN: build a playable TypeScript + Phaser + Vite web demo for a 1770 North America imperial strategy roguelite with a DOM HUD, random starting region, emperor attributes, strategic actions, event cards, and a historical parchment/copperplate presentation.

- 2026-04-22: Created `codex/1770-web-prototype` orphan branch because the repository had no commits, which also made git worktrees unavailable for this session.
- 2026-04-22: Added initial project config and wrote failing simulation tests first for run creation, strategic action resolution, and event choice flow.
- 2026-04-23: Implemented the tested simulation/controller/presenter layers, then added the Phaser map scene, DOM HUD, copperplate/parchment styling, and browser automation hooks.
- 2026-04-23: Playwright smoke reached event state with no console error artifact, but the canvas screenshot was black under WebGL; switched Phaser to the Canvas renderer for stable headless visual capture.
- 2026-04-23: Verified calibrated map-node clicking with the bundled Playwright client; selected `hudson-valley` appeared in `render_game_to_text`, screenshot highlighted the target, and no console error file was produced.
- 2026-04-23: Added Chinese emperor roster data with Zhao Kuangyin unlocked by default, implemented his `杯酒释兵权` expansion ability, and covered the roster, controller restart options, ability resolution, and selection render snapshot with tests.
- 2026-04-23: Added a DOM emperor selection screen before campaign start, with locked silhouettes, hover/focus ability tooltips, a selected-emperor detail panel, and campaign launch using the selected emperor.
