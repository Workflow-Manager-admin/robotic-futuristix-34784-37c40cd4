import React, { useState, useEffect } from "react";

/**
 * Utility Functions
 */

// PUBLIC_INTERFACE
function getInitialBoard() {
  /** Returns initial empty 3x3 tic-tac-toe board */
  return Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));
}

const PLAYERS = [
  {
    name: "Player 1",
    symbol: "X",
    avatar: "🤖", // Animated via CSS
    avatarColor: "#00FFFF"
  },
  {
    name: "Player 2",
    symbol: "O",
    avatar: "🦾", // Animated via CSS
    avatarColor: "#A0A0A0"
  }
];

// PUBLIC_INTERFACE
function checkWinner(board) {
  /** Returns symbol of winner, or null. If tie returns false. */
  const lines = [
    // rows
    [ [0,0],[0,1],[0,2] ], [ [1,0],[1,1],[1,2] ], [ [2,0],[2,1],[2,2] ],
    // cols
    [ [0,0],[1,0],[2,0] ], [ [0,1],[1,1],[2,1] ], [ [0,2],[1,2],[2,2] ],
    // diags
    [ [0,0],[1,1],[2,2] ], [ [0,2],[1,1],[2,0] ],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]];
    }
  }
  // Tie
  if (board.flat().every(Boolean)) return false;
  return null;
}

// PUBLIC_INTERFACE
function aiMove(board, aiSymbol, humanSymbol) {
  /** Naive (medium) AI: Win if possible, block if necessary, else random */
  // 1. Win
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (!board[r][c]) {
        let copy = board.map((row) => row.slice());
        copy[r][c] = aiSymbol;
        if (checkWinner(copy) === aiSymbol) return [r, c];
      }
  // 2. Block
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (!board[r][c]) {
        let copy = board.map((row) => row.slice());
        copy[r][c] = humanSymbol;
        if (checkWinner(copy) === humanSymbol) return [r, c];
      }
  // 3. Center, corners, sides
  const preferred = [ [1,1], [0,0],[0,2],[2,0],[2,2], [0,1],[1,0],[2,1],[1,2] ];
  for (let [r, c] of preferred) if (!board[r][c]) return [r, c];
  return null;
}

/**
 * Sound hooks & functions
 */
const SOUNDS = {
  move: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b081c511.mp3",
  win: "https://cdn.pixabay.com/audio/2022/10/16/audio_127ca76750.mp3",
  draw: "https://cdn.pixabay.com/audio/2022/10/16/audio_125cc003e8.mp3",
  select: "https://cdn.pixabay.com/audio/2022/10/16/audio_12466f2d7e.mp3",
  robot: "https://cdn.pixabay.com/audio/2022/07/26/audio_123b25fda2.mp3",
};

function useSoundEffect(url, enabled=true) {
  // Simple effect to play sound
  const play = () => {
    if (!enabled || !url) return;
    const audio = new window.Audio(url);
    audio.volume = 0.24;
    audio.play();
  };
  return play;
}

const metallicGridGradient =
  "linear-gradient(145deg, #282845 40%, #455387 55%, #1A1A2E 90%)";
const neonBlueGlow = "0 0 16px #00D2DF, 0 0 22px #0ff";
const neonAccent = "#00D2DF";

/**
 * Robot Avatar SVGs (with minimal anim via CSS)
 */
function RobotAvatar({ color, isActive, isWinner, ai }) {
  // With minimal SVG+emoji fallback
  return (
    <div
      className={`robot-avatar${ai ? " ai" : ""}${
        isActive ? " robot-active" : ""
      }${isWinner ? " robot-winner" : ""}`}
      style={{
        filter: `drop-shadow(0 0 8px ${color})`,
        color: color
      }}
      title={ai ? "AI ROBOT" : "Human"}
    >
      {ai ? (
        // Simple SVG robot head with anim
        <svg viewBox="0 0 48 48" width="54" height="54" style={{ display: "block" }}>
          <ellipse cx="24" cy="25" rx="17" ry="13" fill="#222a42" stroke={color} strokeWidth="3"/>
          <ellipse cx="16" cy="26" rx="3" ry="4" fill={isActive ? "#00ffff" : "#555"}/>
          <ellipse cx="32" cy="26" rx="3" ry="4" fill={isActive ? "#00ffff" : "#555"}/>
          <rect x="18" y="33.5" width="12" height="3" rx="1.5" fill={isWinner ? "#00ff5e" : "#0ff"} style={{transition:'fill 0.2s'}} />
          <rect x="20" y="13" width="8" height="4" rx="1.8" fill="#111"/>
          <circle cx="24" cy="11" r="2" fill={isActive ? "#00D2DF" : "#aaa"} >
            <animate attributeName="r" values="2;3;2" dur="0.9s" repeatCount="indefinite" />
          </circle>
        </svg>
      ) : (
        // Emoji for player
        <span style={{ fontSize: 48 }} role="img" aria-label="robot">
          🤖
        </span>
      )}
    </div>
  );
}

function RoboTicFuturistix() {
  // Player types: 0 = two player, 1 = vs robot
  const [mode, setMode] = useState(0); // 0: 2P, 1: vs AI
  const [board, setBoard] = useState(getInitialBoard());
  const [current, setCurrent] = useState(0); // whose turn: 0 or 1
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [winner, setWinner] = useState(null); // "X", "O", false (for tie), or null
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sound hooks (toggleable)
  const playMove = useSoundEffect(SOUNDS.move);
  const playWin = useSoundEffect(SOUNDS.win);
  const playDraw = useSoundEffect(SOUNDS.draw);
  const playRobot = useSoundEffect(SOUNDS.robot);

  useEffect(() => {
    if (winner) {
      if (winner === false) playDraw();
      else {
        playWin();
      }
    }
    // eslint-disable-next-line
  }, [winner]);

  // AI turn effect (simulate thinking with delay)
  useEffect(() => {
    if (
      mode === 1 &&
      !winner &&
      (current === 1 || (current === 0 && isAIRobot(PLAYERS[0])))
    ) {
      if ((mode === 1 && current === 1)) {
        // AI robot is always player 2 (O)
        playRobot();
        const t = setTimeout(() => {
          const move = aiMove(board, PLAYERS[1].symbol, PLAYERS[0].symbol);
          if (move) makeMove(...move);
        }, 460 + 300 * Math.random());
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line
  }, [current, board, winner, mode]);

  function isAIRobot(player) {
    return mode === 1 && player === PLAYERS[1];
  }

  /** Handle cell click */
  function makeMove(r, c) {
    if (winner || board[r][c]) return;
    setBoard((old) => {
      const newBoard = old.map((row) => row.slice());
      newBoard[r][c] = PLAYERS[current].symbol;
      return newBoard;
    });
    playMove();
    setCurrent((cur) => 1 - cur);
  }

  // After each move, check winner & score
  useEffect(() => {
    const result = checkWinner(board);
    if (result !== null) {
      setWinner(result);
      if (result === "X" || result === "O") {
        setScore((sc) => ({ ...sc, [result]: sc[result] + 1 }));
      }
    }
    // eslint-disable-next-line
  }, [board]);

  // Reset/Restart
  function handleRestart() {
    setBoard(getInitialBoard());
    setCurrent(winner && winner === "O" ? 1 : 0); // Loser starts
    setWinner(null);
    playMove();
  }

  function handleModeSelect(modeVal) {
    setMode(modeVal);
    setBoard(getInitialBoard());
    setCurrent(0);
    setWinner(null);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(rowIdx, colIdx) {
    if (
      winner ||
      board[rowIdx][colIdx] ||
      (mode === 1 && current === 1)
    ) {
      // Don't allow human to act in AI's turn
      return;
    }
    makeMove(rowIdx, colIdx);
  }

  // Settings Modal (Difficulty, fx toggle, etc. Minimal for now).
  function renderSettings() {
    return (
      <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
        <div className="settings-modal" onClick={e => e.stopPropagation()}>
          <h2>Settings</h2>
          <div>
            <label>
              <span>Game Mode:</span>
              <select value={mode} onChange={e => handleModeSelect(Number(e.target.value))}>
                <option value={0}>Two Player (Versus)</option>
                <option value={1}>Play vs Robot AI</option>
              </select>
            </label>
          </div>
          <button className="btn" onClick={() => setSettingsOpen(false)}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="futuristix-main-bg">
      {/* Scoreboard */}
      <div className="futuristix-scoreboard">
        <div className="futuristix-score-container">
          <RobotAvatar
            color={PLAYERS[0].avatarColor}
            isActive={current === 0 && !winner}
            ai={mode === 1 ? false : false}
            isWinner={winner === PLAYERS[0].symbol}
          />
          <div className="futuristix-score">
            <div className="futuristix-player-name">
              {PLAYERS[0].name}
            </div>
            <div className="futuristix-score-digit neon-blue">
              {score[PLAYERS[0].symbol]}
            </div>
          </div>
        </div>
        <div className="futuristix-score-vs">
          <span style={{color: neonAccent, textShadow: "0 0 8px #00D2DF"}}>VS</span>
        </div>
        <div className="futuristix-score-container">
          <RobotAvatar
            color={PLAYERS[1].avatarColor}
            isActive={current === 1 && !winner}
            ai={mode === 1}
            isWinner={winner === PLAYERS[1].symbol}
          />
          <div className="futuristix-score">
            <div className="futuristix-player-name">
              {mode === 1 ? "Robot AI" : PLAYERS[1].name}
            </div>
            <div className="futuristix-score-digit neon-blue">
              {score[PLAYERS[1].symbol]}
            </div>
          </div>
        </div>
      </div>
      {/* Board */}
      <div className="futuristix-board-outer">
        <div className="futuristix-board">
          {board.map((row, i) => (
            <div className="futuristix-row" key={i}>
              {row.map((cell, j) => {
                let isLit =
                  !!cell ||
                  (!!winner &&
                    [ [0,0],[0,1],[0,2],
                      [1,0],[1,1],[1,2],
                      [2,0],[2,1],[2,2] ]
                      .some(([x, y]) => x === i && y === j));
                let winnerCell = false;
                if (winner && winner !== false) {
                  // Show win line
                  const lines = [
                    [ [0,0],[0,1],[0,2] ], [ [1,0],[1,1],[1,2] ], [ [2,0],[2,1],[2,2] ],
                    [ [0,0],[1,0],[2,0] ], [ [0,1],[1,1],[2,1] ], [ [0,2],[1,2],[2,2] ],
                    [ [0,0],[1,1],[2,2] ], [ [0,2],[1,1],[2,0] ],
                  ];
                  for (let line of lines) {
                    const [a, b, c] = line;
                    if (
                      board[a[0]][a[1]] &&
                      board[a[0]][a[1]] === board[b[0]][b[1]] &&
                      board[a[0]][a[1]] === board[c[0]][c[1]] &&
                      (
                        (a[0] === i && a[1] === j) ||
                        (b[0] === i && b[1] === j) ||
                        (c[0] === i && c[1] === j)
                      )
                    ) {
                      winnerCell = true;
                      break;
                    }
                  }
                }
                return (
                  <div
                    className={
                      "futuristix-cell" +
                      (isLit ? " lit" : "") +
                      (winnerCell ? " winner" : "")
                    }
                    key={j}
                    onClick={() => handleCellClick(i, j)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Cell ${i * 3 + j + 1}`}
                  >
                    {cell ? (
                      <span
                        className={
                          "futuristix-symbol " +
                          (cell === "X" ? "ex" : "oh")
                        }
                      >
                        {cell}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Winner / draw / turn info */}
      <div className="futuristix-status-bar">
        {winner === null && (
          <span>
            { mode === 1 && current === 1
              ? <><span style={{color: neonAccent}}>Robot</span> is thinking...</>
              : <>Turn: <span style={{color: neonAccent}}>
                {mode === 1 && current === 0
                  ? "You"
                  : PLAYERS[current].name}
              </span></> }
          </span>
        )}
        {winner === false && (
          <span className="draw-msg">
            <b>No Winner: It's a Draw!</b>
          </span>
        )}
        {(winner === "X" || winner === "O") && (
          <span className="win-msg">
            <b>
              {mode === 1 && winner === "O"
                ? "Robot AI"
                : winner === "X"
                ? PLAYERS[0].name
                : PLAYERS[1].name
              } Wins!
            </b>
          </span>
        )}
      </div>
      {/* Controls */}
      <div className="futuristix-controls">
        <button className="btn neon" onClick={handleRestart}>
          Restart
        </button>
        <button
          className="btn neon"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          Settings
        </button>
      </div>
      {/* Settings Modal */}
      {settingsOpen && renderSettings()}
      {/* Styles */}
      <style>{`
        .futuristix-main-bg {
          background: ${metallicGridGradient};
          min-height: 100vh;
          padding: 0 0 36px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        .futuristix-scoreboard {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 48px;
          background: radial-gradient(circle at 50% 120%, #101010a2 58%, #1A1A2E 94%);
          width: 100%;
          min-height: 100px;
          padding-top: 32px;
        }
        .futuristix-score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 110px;
        }
        .futuristix-player-name {
          color: #fff;
          font-weight: 600;
          margin-top: 6px;
          font-size: 1.09rem;
          letter-spacing: 0.03em;
          text-shadow: 0 0 5px #0ff3, 0 1px 7px #000b;
        }
        .futuristix-score-digit {
          font-size: 2.5rem;
          font-family: "Orbitron", "Roboto Mono", monospace;
          font-weight: 900;
          margin-top: 0.1em;
        }
        .neon-blue {
          color: #00D2DF;
          text-shadow: ${neonBlueGlow};
        }
        .futuristix-score-vs {
          font-size: 1.5rem;
          font-family: "Orbitron", "Roboto", monospace;
          font-weight: bold;
          align-self: flex-end;
        }
        .robot-avatar {
          margin-bottom: 6px;
          transition: filter 0.24s, scale 0.22s, box-shadow 0.22s;
          border-radius: 50%;
          background: radial-gradient(circle, #232d3b 65%, #3ff7fa22 100%);
          box-shadow: 0 2px 12px #0008, 0 0 14px #00f6;
          border: 2.8px solid #333;
          padding: 6px 2px 2px 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .robot-avatar.ai svg {
          animation: bot-float 1.18s infinite alternate;
        }
        .robot-avatar.robot-active {
          scale: 1.13;
          border-color: #00D2DF;
          box-shadow: 0 0 32px #00d2df7c, 0 0 42px #00f3;
          filter: brightness(1.16) drop-shadow(0 0 12px #00E);
        }
        .robot-avatar.robot-winner {
          border-color: #0f0;
          scale: 1.26;
          box-shadow: 0 0 32px #0f6, 0 0 62px #00d2df5a;
        }
        @keyframes bot-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-9px);}
        }

        .futuristix-board-outer {
          width: 402px;
          margin: 22px 0 0 0;
          padding: 22px 12px 18px 12px;
          border-radius: 24px;
          background: linear-gradient(133deg, #142342 35%, #254466 72%);
          box-shadow: 0 0 16px #00d2df29;
          display: flex;
          justify-content: center;
        }
        @media (max-width: 549px) {
          .futuristix-board-outer {
            width: 98vw; min-width:0; max-width: 99vw; padding: 7vw 2vw;
          }
        }
        .futuristix-board {
          display: flex;
          flex-direction: column;
          background: ${metallicGridGradient};
          border-radius: 18px;
          box-shadow: 0 0 26px #18e, 0 2px 34px #0007;
          padding: 12px;
          width: 348px;
        }
        .futuristix-row {
          display: flex;
        }
        .futuristix-cell {
          width: 94px;
          height: 94px;
          margin: 3.5px;
          border-radius: 12px;
          background: linear-gradient(153deg, #2C4152 42%, #c5d1f7 130%, #0ff2);
          border: 3.5px solid #00D2DF40;
          box-shadow: 0 1.5px 5.5px #0ee1, 0 0 26px #1A1A2e21;
          font-size: 2.9rem;
          color: #00D2DF;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.19s, scale 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .futuristix-cell.lit {
          background: linear-gradient(133deg, #192C45 55%, #61e9ff 140%);
          box-shadow: 0 0 22px #00D2DF, 0 0 34px #0ff6;
        }
        .futuristix-cell.winner {
          border-color: #0f0;
          box-shadow: 0 0 40px #0f0d, 0 0 58px #44fa, 0 0 54px #00D2DF;
          animation: winner-glow 0.23s infinite alternate;
        }
        .futuristix-symbol {
          font-family: "Orbitron", "Roboto Mono", monospace;
        }
        .futuristix-symbol.ex {
          color: #00D2DF;
          text-shadow: 0 0 12px #00D2DF,  0 0 4px #0ff8;
        }
        .futuristix-symbol.oh {
          color: #d2d2e8;
          text-shadow: 0 0 8px #fff, 0 0 4px #bcbcff80;
        }
        @keyframes winner-glow {
          0% { box-shadow: 0 0 28px #0fa4, 0 0 38px #00D2DF; }
          100% { box-shadow: 0 0 50px #44f, 0 0 80px #00ffad; }
        }

        .futuristix-status-bar {
          margin: 16px 0 0 0;
          min-height: 28px;
          font-size: 1.24rem;
          text-align: center;
          color: #c2e9fd;
          text-shadow: 0 0 8px #07ffde8a, 0 1px 9px #012e;
          font-family: "Orbitron", "Roboto Mono", monospace;
        }
        .futuristix-status-bar .win-msg, .futuristix-status-bar .draw-msg {
          color: #fffd38;
          text-shadow: 0 0 14px #ffdead, 0 1px 20px #ffc400a7;
        }
        .futuristix-controls {
          width: 348px;
          margin-top: 22px;
          display: flex;
          flex-direction: row;
          gap: 18px;
          justify-content: center;
        }
        .btn.neon {
          background: linear-gradient(96deg, #00D2DF 60%, #092242 130%);
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-size: 1.15rem;
          border-radius: 6px;
          box-shadow: 0 2px 14px #00d2df33, 0 0 8px #00ffff33;
          padding: 9px 19px;
          outline: none;
          border: none;
          transition: background 0.17s, scale .09s;
        }
        .btn.neon:active { scale: 0.94; }
        .btn.neon:hover {
          background: linear-gradient(83deg, #24eff8 65%, #009fbb 130%);
          color: #0C1122;
          box-shadow: 0 2px 40px #00f5, 0 0 20px #00dfea33;
        }
        .modal-overlay {
          position: fixed; z-index:9999; left:0; top:0; width:100vw; height:100vh; background:rgba(0,24,36,0.92); display:flex; align-items: center; justify-content: center;
        }
        .settings-modal {
          background: #101a29e8;
          border-radius: 18px;
          min-width: 272px;
          max-width: 98vw;
          padding: 28px 26px 22px 32px;
          box-shadow: 0 0 32px #00d2df90, 0 2px 18px #092848a5;
          color: #e8f8ff;
          font-family: "Orbitron", "Roboto", monospace;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .settings-modal h2 {
          color:${neonAccent};
          text-shadow: 0 0 14px #0feff0;
        }
        .settings-modal label {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .settings-modal select {
          font-family: "Orbitron", "Roboto", monospace;
          font-size: 1.09rem;
          border-radius: 5px;
          outline: none;
          background:#262e42;
          color: #0ff;
          border: 1.6px solid #00D2DF99;
          margin-left: 9px;
        }
        @media (max-width: 489px) {
          .futuristix-board { width: 99vw; padding: 2vw 1vw;}
          .futuristix-scoreboard { flex-direction: column; gap: 8px; }
          .futuristix-controls {width: 99vw;}
        }
      `}
      </style>
    </div>
  );
}

export default RoboTicFuturistix;
