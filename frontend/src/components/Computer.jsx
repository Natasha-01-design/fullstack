
import Dictionary from "./Dictionary";


const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1,
  F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1,
  P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};


const canFormWordFromRack = (word, rack) => {
  const rackLetters = rack.map(t => t.letter.toUpperCase());
  for (const letter of word.toUpperCase()) {
    const idx = rackLetters.indexOf(letter);
    if (idx === -1) return false;
    rackLetters.splice(idx, 1);
  }
  return true;
};


const findAnchors = (board) => {
  const anchors = [];

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c].tile) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && !board[nr][nc].tile) {
            anchors.push({ row: nr, col: nc });
          }
        }
      }
    }
  }

 
  if (anchors.length === 0) anchors.push({ row: 7, col: 7 });
  return anchors;
};


const scoreWord = (board, placement) => {
  let score = 0;
  let wordMultiplier = 1;

  for (const p of placement) {
    const cell = board[p.row][p.col];
    const letter = p.tile.letter.toUpperCase();
    let letterScore = LETTER_VALUES[letter] || 0;

   
    if (!cell.tile) {
      if (cell.bonus === "DL") letterScore *= 2;
      else if (cell.bonus === "TL") letterScore *= 3;
      else if (cell.bonus === "DW") wordMultiplier *= 2;
      else if (cell.bonus === "TW") wordMultiplier *= 3;
    }

    score += letterScore;
  }

  return score * wordMultiplier;
};


const tryPlaceWord = (board, word, row, col, direction) => {
  const placement = [];

  for (let i = 0; i < word.length; i++) {
    const r = direction === "H" ? row : row + i;
    const c = direction === "H" ? col + i : col;

 
    if (r < 0 || r >= 15 || c < 0 || c >= 15) return null;

    const cell = board[r][c];
    const letter = word[i].toUpperCase();

 
    if (cell.tile && cell.tile.letter !== letter) return null;

   
    placement.push({
      row: r,
      col: c,
      tile: { letter, value: LETTER_VALUES[letter] || 0 },
    });
  }

  const usesNewTile = placement.some(p => !board[p.row][p.col].tile);
  if (!usesNewTile) return null;

  return placement;
};


export const Computer = async (game, rack, dictionary = Dictionary) => {
  const anchors = findAnchors(game.board);
  const allWords = await dictionary.getAllWords();
  console.log("AI Dictionary size:", allWords?.length);

  

  let bestMove = null;
  let bestScore = 0;

function getPerpendicularWord(board, row, col, direction, letter) {
  let word = letter;

  if (direction === "H") {
    
    let r = row - 1;
    while (r >= 0 && board[r][col].tile) {
      word = board[r][col].tile.letter + word;
      r--;
    }
    r = row + 1;
    while (r < 15 && board[r][col].tile) {
      word += board[r][col].tile.letter;
      r++;
    }
  } else {
  
    let c = col - 1;
    while (c >= 0 && board[row][c].tile) {
      word = board[row][c].tile.letter + word;
      c--;
    }
    c = col + 1;
    while (c < 15 && board[row][c].tile) {
      word += board[row][c].tile.letter;
      c++;
    }
  }

  return word;
}

  for (const word of allWords) {
    if (word.length < 2) continue; // too short
    if (!canFormWordFromRack(word, rack)) continue;
    if (game.playedWords.includes(word.toUpperCase())) continue;

    for (const anchor of anchors) {
      for (const dir of ["H", "V"]) {
        const placement = tryPlaceWord(game.board, word, anchor.row, anchor.col, dir);
        if (!placement) continue;

 
        let valid = true;
        for (const p of placement) {
          if (!game.board[p.row][p.col].tile) {
            const perpDir = dir === "H" ? "V" : "H";
            const perp = getPerpendicularWord(game.board, p.row, p.col, perpDir, p.tile.letter);
            if (perp.length > 1 && !(await Dictionary.isValid(perp))) {
              valid = false;
              break;
            }
          }
        }
        if (!valid) continue;

        const score = scoreWord(game.board, placement);

        
        let totalScore = score;
        for (const p of placement) {
          if (!game.board[p.row][p.col].tile) {
            const perpDir = dir === "H" ? "V" : "H";
            const perp = getPerpendicularWord(game.board, p.row, p.col, perpDir, p.tile.letter);
            if (perp.length > 1) {
              let perpScore = 0;
              for (const letter of perp) {
                perpScore += LETTER_VALUES[letter.toUpperCase()] || 0;
              }
              totalScore += perpScore;
            }
          }
        }

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestMove = { word: word.toUpperCase(), placement, score: totalScore };
        }
      }
    }
  }

  return bestMove; 
};
