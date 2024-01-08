import { EOL } from "os";
import { stderr, stdin, stdout } from "process";

import { BoardState, ENGINE_AUTHOR, ENGINE_NAME, ENGINE_VERSION, enactMoves, loadFEN, nextMove, printBoardState } from "./engine.js";

let debugMode = false; // TODO use
let exitCode: number | undefined;
let boardState: BoardState;

const getNextInput = () => new Promise<Buffer>(resolve => stdin.once("data", data => resolve(data)));

/**
 * Only does DEBUG level logs if {@link debugMode} is true.
 * 
 * ! DEV level should be removed later - should only exist while WIP
 */
const log = (level: "DEV" | "DEBUG" | "INFO" | "ERROR", str: string) => {
  if (level === "DEBUG" && !debugMode) return;

  stdout.write(`info string ${level}: ${str}${EOL}`);
  if (level === "ERROR") stderr.write(`${str}${EOL}`);
}
const send = (str: string) => stdout.write(`${str}${EOL}`);


// * as per UCI standard, commands should test for matches with the _end_ of commands,
// * and ignore anything they don't recognise earlier

const commands: { regexp: RegExp, exec: (groups: RegExpExecArray) => void }[] = [
  {
    regexp: /uci\s*$/,
    exec(groups) {
      send(`id name ${ENGINE_NAME} v${ENGINE_VERSION}`);
      send(`id author ${ENGINE_AUTHOR}`);

      // TODO send setting support via `option` command

      send("uciok");
    },
  }, {
    regexp: /debug(?:\s+(on|off))?\s*$/,
    exec(groups) {
      const newModeStr = groups[1];

      let newMode: boolean;
      switch (newModeStr) {
        case "on":
          newMode = true;
          break;
        
        case "off":
          newMode = false;
          break;

        default:
          newMode = !debugMode;
          break;
      }

      debugMode = newMode;
    },
  }, {
    regexp: /isready\s*$/,
    exec(groups) {
      send("readyok");
    },
  }, {
    regexp: /setoption\s+name\s+(\b.+?\b)(?:\s+value\s+(\b.+\b))?\s*$/,
    exec(groups) {
      const name = groups[1], value = groups[2];
      // TODO add any options that get supported
    },
  }, {
    regexp: /register\s+(later)\s*$|register\s+(name|code)\s+(\b.+?\b)(?:\s+(name|code)\s+(\b.+?\b))?\s*$/,
    exec(groups) {
      if (groups[1] === "later") return;
      send("registration checking");
      send("registration ok");
    },
  }, {
    regexp: /ucinewgame\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO ucinewgame");
    },
  }, {
    regexp: /position(?:\s+(fen\s+(\b.+?\b)|startpos))?(\s+moves\s+(\b.+?\b))?\s*$/,
    exec(groups) {
      const posType = groups[1], fenStr = groups[2], movesStr = groups[4];
      let fen: string = fenStr;
      if (posType === "startpos") fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      if (fen !== undefined) boardState = loadFEN(fen);

      if (movesStr === undefined) return;
      const moves = movesStr.split(" ");
      boardState = enactMoves(boardState, moves);
    },
  }, {
    regexp: /go\s+.+\s*$/, // ! TODO
    exec(groups) {
      send(nextMove(boardState));
    },
  }, {
    regexp: /stop\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO stop");
    },
  }, {
    regexp: /ponderhit\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO ponderhit");
    },
  }, {
    regexp: /quit\s*$/,
    exec(groups) {
      exitCode = 0;
    },
  }, {
    // * custom command
    regexp: /boardstate\s*$/,
    exec(groups) {
      send(printBoardState(boardState));
    },
  }
];

mainLoop:
while (exitCode === undefined) {
  const data = await getNextInput();
  const commandStr = data.toString().replace(/[\r\n]+$/, "");

  for (const command of commands) {
    const groups = command.regexp.exec(commandStr);
    if (groups === null) continue;

    command.exec(groups);
    continue mainLoop;
  }

  log("ERROR", `unable to process command: '${commandStr}'`);
}

process.exitCode = exitCode;

stdin.destroy();
stdout.destroy();
stderr.destroy();
