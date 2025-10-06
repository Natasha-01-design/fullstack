# TODO: Fix Scrabble Game Issues

## Issues to Fix
- Player scores doubling after playing
- Computer scores not being recorded
- Computer AI doesn't validate perpendicular words formed by intersecting tiles

## Plan
1. Update Computer.jsx AI logic to validate all perpendicular words formed by new tiles and calculate total score including these words.
2. Update Game.jsx to add the computer player's score after the AI move using the total score from the AI.
3. Ensure consistent scoring logic to avoid doubling by applying multipliers only once.

## Steps
- [x] Modify Computer.jsx to validate perpendicular words and compute total score
- [x] Update Game.jsx computer turn logic to record the score
- [x] Test the fixes to ensure no score doubling and proper computer scoring
