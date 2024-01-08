import { range, template, templateRegExp } from "./funcs.js";

export const ENGINE_NAME = "Regex Engine"; 
export const ENGINE_VERSION = "0.1.0";
export const ENGINE_AUTHOR = "met4000";

export type BoardState = string;
export const printBoardState = (boardState: BoardState): string => boardState;

export type Move = string;

// TODO
export const loadFEN = (fen: string): BoardState => fen
  .replace(/ .*$/, `\nー＋ーーーーーーーー\n　｜ａｂｃｄｅｆｇｈ`)
  .replace(/\//g, "\n$&｜")
  .replace(/^/, "/｜")
  .replaceTemplate("/", template`${(n: number) => String.fromCharCode("０".charCodeAt(0) + n)}`, range(8, 1)) // specifically reverse order

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
const _enactMoves = (str: string): BoardState => str
  .replaceTemplate(
    templateRegExp`/${(n: number) => String(n)}/g`,
    (n: number) => String.fromCharCode("０".charCodeAt(0) + n),
    range(1, 8)
  )
  .replaceTemplate(
    templateRegExp`/${(n: number) => String.fromCharCode("a".charCodeAt(0) + n - 1)}/g`,
    (n: number) => String.fromCharCode("ａ".charCodeAt(0) + n - 1),
    range(1, 8)
  )

  .repeatReplace(v => v
    .replace(/^([^♔-♟︎])(.)(.*\n(?:.|\n)*\2｜.*)(♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\1)/, "$4$&")
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)(.)(?:, )?(.*\n(?:.|\n)*\5｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)((?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)/, "$6$1$7・")
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)(.)(?:, )?(.*\n(?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)((?:.|\n)*\5｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)/, "$6・$7$1")
  )
  .replace(/^\n/, "")
;

// TODO
export const nextMove = (boardState: BoardState): Move => "e2e4";
