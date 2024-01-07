import { stderr, stdin, stdout } from "process";

let debugMode = false; // TODO use
let exitCode: number | undefined;

const getNextInput = () => new Promise<Buffer>(resolve => stdin.once("data", data => resolve(data)));

/**
 * Only does DEBUG level logs if {@link debugMode} is true.
 * 
 * ! DEV level should be removed later - should only exist while WIP
 */
const log = (level: "DEV" | "DEBUG" | "INFO" | "ERROR", str: string) => {
  if (level === "DEBUG" && !debugMode) return;

  stdout.write(`info string ${level}: ${str}\n`);
  if (level === "ERROR") stderr.write(`${str}\n`);
}

const commands: { regexp: RegExp, exec: (groups: RegExpExecArray) => string | void }[] = [
  {
    regexp: /uci\s*$/,
    exec(groups) {
      // TODO:
      // - identify using `id` command
      // - send setting support via `option` command
      // - return `uciok`
      log("DEV", "TODO uci");
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
      // TODO wait for init
      return "readyok";
    },
  }, {
    regexp: /setoption\s+name\s+(\b.+?\b)(?:\s+value\s+(\b.+\b))?\s*$/,
    exec(groups) {
      const name = groups[1], value = groups[2];

      // TODO
      log("DEV", `TODO setoption; name: '${name}', value: '${value}'`);
    },
  }, {
    regexp: /register\s+(later)\s*$|register\s+(name|code)\s+(\b.+?\b)(?:\s+(name|code)\s+(\b.+?\b))?\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO register; TODO parse");
    },
  }, {
    regexp: /ucinewgame\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO ucinewgame");
    },
  }, {
    regexp: /position(?:\s+(?:(fen)\s+(\b.+?\b)|(startpos)))?\s+moves\s+(\b.+?\b)?\s*$/,
    exec(groups) {
      // TODO
      log("DEV", "TODO position; TODO parse");
    },
  }, {
    regexp: /go\s+.+\s*$/, // ! TODO
    exec(groups) {
      // TODO
      log("DEV", "TODO go; TODO regexp and parse");
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
  },
];

mainLoop:
while (exitCode === undefined) {
  const data = await getNextInput();
  const commandStr = data.toString().replace(/\n+$/, "");

  // * as per standard, commands should test for matches with the _end_ of commands,
  // * and ignore anything they don't recognise earlier

  for (const command of commands) {
    const groups = command.regexp.exec(commandStr);
    if (groups === null) continue;

    const returnStr = command.exec(groups);
    if (returnStr !== undefined) stdout.write(`${returnStr}\n`);
    continue mainLoop;
  }

  log("ERROR", `unable to process command: '${commandStr}'`);
}

process.exitCode = exitCode;

stdin.destroy();
stdout.destroy();
stderr.destroy();
