import { range, template, templateRegExp } from "./funcs.js";

export const ENGINE_NAME = "Regex Engine"; 
export const ENGINE_VERSION = "0.1.0";
export const ENGINE_AUTHOR = "met4000";

export type BoardState = string;
export const printBoardState = (boardState: BoardState): string => boardState;

export type Move = string;

// TODO
export const loadFEN = (fen: string): BoardState => fen
  // .replace(/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR, "")
  .replace(/ .*$/, `\nー＋ーーーーーーーー\n　｜ａｂｃｄｅｆｇｈ`)
  .replace(/\//g, "\n$&｜")
  .replace(/^/, "/｜")
  .replaceTemplate("/", template`${(n: number) => ({
    1: "１",
    2: "２",
    3: "３",
    4: "４",
    5: "５",
    6: "６",
    7: "７",
    8: "８",
  })[n] as string}`, range(8, 1)) // specifically reverse order

  .replace(/k/g, "♚")
  .replace(/K/g, "♔")

  .replace(/q/g, "♛")
  .replace(/Q/g, "♕")

  .replace(/r/g, "♜")
  .replace(/R/g, "♖")
  
  .replace(/b/g, "♝")
  .replace(/B/g, "♗")

  .replace(/n/g, "♞")
  .replace(/N/g, "♘")

  .replace(/p/g, "♟︎")
  .replace(/P/g, "♙")

  .replaceTemplate(templateRegExp`/${(n: number) => String(n)}/g`, template`${(n: number) => String(n - 1)}・`, range(8, 1))
  .replace(/0/g, "")
;

export const enactMoves = (boardState: BoardState, moves: Move[]): BoardState => _enactMoves(`${moves.join(", ")}\n${boardState}`);
const _enactMoves = (str: string): string => str; // TODO

// TODO
export const nextMove = (boardState: BoardState): Move => "e2e4";
