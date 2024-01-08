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

// ! doesn't support en passant or castling
// ! doesn't yet support promotion
export const enactMoves = (boardState: BoardState, moves: Move[]): BoardState => _enactMoves(`${moves.join(", ")}\n${boardState}`);
const _enactMoves = (str: string): BoardState => str
  .replace(/(1)q/g, "$1♛")
  .replace(/(8)q/g, "$1♕")

  .replace(/(1)r/g, "$1♜")
  .replace(/(8)r/g, "$1♖")
  
  .replace(/(1)b/g, "$1♝")
  .replace(/(8)b/g, "$1♗")

  .replace(/(1)n/g, "$1♞")
  .replace(/(8)n/g, "$1♘")

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
    
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)(.)(?:, )?(.*\n(?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)((?:.|\n)*\5｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)/, "$6・$7$1")
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)(.)(?:, )?(.*\n(?:.|\n)*\5｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)((?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)/, "$6$1$7・")
    
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)\3(?:, )?(.*\n(?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)(.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)/, "$5・$6$1")
    .replace(/^([♔-♞]|♟︎)(.)(.)(.)\3(?:, )?(.*\n(?:.|\n)*\3｜.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\4)(.*)(?:♟︎|[^♟︎])(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:♟︎|[^♟︎]|\n){21}\2)/, "$5$1$6・")

    // promotion
    .replace(/^([♕-♘])(?:, )?((?:.|\n)*８｜.*)♙/, "$2$1")
    .replace(/^([♕-♘])(?:, )?((?:.|\n)*１｜.*)♟︎/, "$2$1")
  )
  .replace(/^\n/, "")
;

export const nextMove = (boardState: BoardState): Move => boardState
  // ! currently using old engine code
  // TODO rewrite

  .replace(/$/, "\n\nPossible Moves:")

  // add a marker to the first piece
  .replace(/[♔-♙]/, "！$&")

  // iterate through pieces, checking their moves
  .repeatReplace(v => v
    // TODO add support for deliberately missing directions (e.g. for black downwards moving pawns)
    // `$`; orthogonal move(s) or capture(s) - directions start up and go clockwise
    // `%`; diagonal move(s) or capture(s) - directions start up-left and go clockwise
    // `|`; orthogonal move(s)
    // `_`; diagonal capture(s)
    // `<`; knight move(s) - up left
    // `>`; knight move(s) - up right
    // repeated tokens; up to and including that many moves of that type
    // star; the number of directions/angles to move in
    // comma after move info

    // move types must be in the same order as above

    // piece movement
    // TODO doesn't know about pawn promotion or en-passant
    .replace(/！♙(.*\n.*\nー)/, "||*,_**,♙!$1") // starting rank
    .replace(/！♙/, "|*,_**,♙!")
  //   .replace(/！♗/, "%%%%%%%%****,♗!")
    .replace(/！♘/, "<****,>****,♘!")
  //   .replace(/！♖/, "$$$$$$$$****,♖!")
  //   .replace(/！♕/, "$$$$$$$$$$$$$$$$****,%%%%%%%%****,♕!")
  //   .replace(/！♔/, "$$****,%****,♔!")

    // uses a @ to mark where the previous check was (and & after moving the check)

    // ! bug with duplicated moves

    // ! bug with rook movement
    // orthogonal movement ($ and |)
    .repeatReplace(v => v
      .replace(/([$|]+)(\*|\*{4}),/, "@`$1$2,")
      // TODO other directions

      // increment distance by 1
      .replace(/([$|])(\*+)/, "$2$1")

      .repeatReplace(v => v
        // if unoccupied, add marker
        .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){10})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){10}(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*)?[$|*]+,[^\n]*([^\n])!(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2&$4・$5$7$8\n$6 ~$7$1") // up
        // TODO right, down, left

        // TODO check for wall collision (or friendly piece)
        
        // if not unoccupied and $, remove marker and add move
        .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){10})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){10}(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*)?[$*]+,[^\n]*([^\n])!(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4・$5$7$8\n$6 ~$7$1 (-$3)") // up
        // TODO other directions
        
        // if occupied and |, remove marker
        .replace(/@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){10}(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*)?[|*]+,[^\n]*([^\n])!)/s, "・$1") // up

        // remove initial preceding/trailing space
        .replace(/・?`・?/, "")
        .replace(/&/, "@")

        // TODO deal with final movement in a direction, and changing direction
        .replace(/(^[^@*]*)\*(\**)([$|]+)(,)/, "$1$3$2$4") // must have hit something; remove any remaining distance and change direction
        .replace(/@([^$|*]+)\*(\**)([$|]+)(,)/, "・$1$3$2$4") // remove marker and change to next direction
        .replace(/([^$|*])[$|]+,/, "$1") // remove move types with all directions completed

        // increment distance by 1 (if it is already more than 0)
        .replace(/([$|])(\*+[$|])/, "$2$1")
      )
    )


    // ! bug with bishop and king movement
    // diagonal movement (% and _)
    .repeatReplace(v => v
      .replace(/([%_]+)(\*|\*{2}),/, "@`$1$2,")
      // TODO other directions

      // increment distance by 1
      .replace(/([%_])(\*+)/, "$2$1")

      .repeatReplace(v => v
        // if unoccupied, move marker and add move
        .replace(/(・)((?:[♔-♞・\n１-８｜]|♟︎){9})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){10})*)?[%_]*\*{2}[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "&#$2・$3\n$4 ~～") // up-right
        .replace(/(・)((?:[♔-♞・\n１-８｜]|♟︎){11})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){12})*)?[%_]*\*[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "&#$2・$3\n$4 ~～") // up-left
        // TODO up-right, down-right, down-left
        
        // if unoccupied and _, remove added move
        .replace(/([^,][_]*\*[_],[^\n]*([^\n])!.*Possible Moves:).*~～/s, "$1")

        // if wall or friendly, remove marker
        .replace(/([♔-♙｜\n])((?:[♔-♞・\n１-８｜]|♟︎){9})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){10})*)?[%_]*\*{2}[%_],[^\n]*([^\n])!)/s, "$1$2・$3") // up-right
        .replace(/([♔-♙｜\n])((?:[♔-♞・\n１-８｜]|♟︎){11})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){12})*)?[%_]*\*[%_],[^\n]*([^\n])!)/s, "$1$2・$3") // up-left
        
        // if occupied, remove marker and add move
        .replace(/([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){9})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){10})*)?[%_]*\*{2}[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "$1#$2・$3\n$4 ~～ (-$1)") // up-right
        .replace(/([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){11})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){12})*)?[%_]*\*[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "$1#$2・$3\n$4 ~～ (-$1)") // up-left
        // TODO other directions

        // remove initial preceding/trailing space
        .replace(/・?`・?/, "")
        .replace(/&/, "@")

        // add current marker coords
        .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*@?)#((?:(?:(?:[^♔-♞・\n１-８｜♟︎ー]*[♔-♞・\n１-８｜]|♟︎)!?){11})*.{21})([ａ-ｈ])(.*)～/s, "$1$2$3$4$5$4$1") // TODO
        .replace(/#(.*ー)/s, "$1")

        // TODO deal with final movement in a direction, and changing direction
        .replace(/(^[^@*]*)\*(\**)([%_]+)(,)/, "$1$3$2$4") // must have hit something; remove any remaining distance and change direction
        .replace(/@([^%_*]+)\*(\**)([%_]+)(,)/, "・$1$3$2$4") // remove marker and change to next direction
        .replace(/([^%_*])[%_]+,/, "$1") // remove move types with all directions completed

        // increment distance by 1 (if it is already more than 0)
        .replace(/([%_])(\*+[%_])/, "$2$1")
      )
    )


    // knight movement (<, >)
    
    // <

    // ****
    .replace(/(<\*{4},[^\n]*([^\n])!(?=.{0,8}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){8})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
    .replace(/(<\*{4},[^\n]*([^\n])!(?=.{0,8}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){8})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3 (-$4)")
    .replace(/(<\*{3})\*(,[^\n]+!)/, "$1$2")

    // ***
    .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){22})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
    .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){22})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3 (-$4)")
    .replace(/(<\*{2})\*(,[^\n]+!)/, "$1$2")

    // **
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1 (-$3)")
    .replace(/(<\*)\*(,[^\n]+!)/, "$1$2")
    
    // *
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1 (-$3)")
    .replace(/<\*,([^\n]+!)/, "$1")
    
    // >

    // ****
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1 (-$3)")
    .replace(/(>\*{3})\*(,[^\n]+!)/, "$1$2")
    
    // ***
    .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){20})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
    .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){20})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3 (-$4)")
    .replace(/(>\*{2})\*(,[^\n]+!)/, "$1$2")
    
    // **
    .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){12})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
    .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){12})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3 (-$4)")
    .replace(/(>\*)\*(,[^\n]+!)/, "$1$2")
    
    // *
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1 (-$3)")
    .replace(/>\*,([^\n]+!)/, "$1")


    // add current coord to current moves
    .repeatReplace(v => v
      .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*(?:[♔-♞・]|♟︎)!(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*)~/s, "$1$2$3$4$3$1")
    )

    .replace(/!/, "！")
    .repeatReplace(v => v
      .replace(/(！)(\n[１-８]｜|[♚-♞・]|♟︎)/, "$2$1")
    )
  )

  .replace(/！/, "")


  // evaluate the position after each move
  // TODO something more advanced than sum of material

  // add `ＥＶＡＬ：+` to the end of each move
  .replace(/Possible Moves:\n.+/, "$& ＥＶＡＬ：")
  .repeatReplace(v => v
    .replace(/ＥＶＡＬ：\n(?!.*ＥＶＡＬ：).+/, "$& ＥＶＡＬ：")
  )

  // calculate difference in point material
  .replace(/\((.+)\) ＥＶＡＬ：/g, "$&$1")
  .repeatReplace(v => v
    // ! will get confused about combining infinities
    // ? maybe define ([+-])\infty([+-])\infty => $1\infty and enforce keeping recursing stuff in order

    // TODO switch to centi-pawn precision and multiple 'digits' (still token based)

    .replace(/(ＥＶＡＬ：.+)♔/g, "$1∞")
    .replace(/(ＥＶＡＬ：.+)♚/g, "$1-∞")

    .replace(/(ＥＶＡＬ：.+)♕/g, "$10!!!!!!!!!!!!!!!!!!!!") // 20
    .replace(/(ＥＶＡＬ：.+)♖/g, "$10!!!!!!!!!!") // 10
    .replace(/(ＥＶＡＬ：.+)♗/g, "$10!!!!!!") // 6
    .replace(/(ＥＶＡＬ：.+)♘/g, "$10!!!!!") // 5
    .replace(/(ＥＶＡＬ：.+)♙/g, "$10!!") // 2

    .replace(/(ＥＶＡＬ：.+)♛/g, "$1-0!!!!!!!!!!!!!!!!!!!!") // -20
    .replace(/(ＥＶＡＬ：.+)♜/g, "$1-0!!!!!!!!!!") // -10
    .replace(/(ＥＶＡＬ：.+)♝/g, "$1-0!!!!!!") // -6
    .replace(/(ＥＶＡＬ：.+)♞/g, "$1-0!!!!!") // -5
    .replace(/(ＥＶＡＬ：.+)♟︎/g, "$1-0!!") // -2
  )
  .repeatReplace(v => v
    .replace(/(ＥＶＡＬ：.*?)(?:[+-]+0!+)*([+-]+∞)(?:[+-]+0!+)*/g, "$1$2")

    .replace(/(ＥＶＡＬ：.*)(?:\+|--)+/g, "$1+")
    .replace(/(ＥＶＡＬ：.*)(?:\+-|-\+)/g, "$1-")

    .replace(/(ＥＶＡＬ：.*)([+-])(!+)\2(!+)/g, "$1$2$3$4")

    .replace(/(ＥＶＡＬ：.*)(\+0!*)!(-0!*)!/g, "$1$2$3")
    .replace(/(ＥＶＡＬ：.*)(-0!*)!(\+0!*)!/g, "$1$2$3")
    
    .replace(/(ＥＶＡＬ：.*)[+-]0(?!!)/g, "$1")
  )


  // select move

  // sort by evaluation
  .repeatReplace(v => v
    // sort by sign
    .replace(/^(.+ＥＶＡＬ：(?:-.*)?)\n(.+ＥＶＡＬ：\+.*)$|^(.+ＥＶＡＬ：-.*)\n(.+ＥＶＡＬ：)$/gm, "$2$4\n$1$3")
  )
  .repeatReplace(v => v
    // sort by magnitude
    .replace(/^(.+ＥＶＡＬ：\+0(!+))\n(.+ＥＶＡＬ：\+0\2!+)$/gm, "$3\n$1")
    .replace(/^(.+ＥＶＡＬ：\+0!+)\n(.+ＥＶＡＬ：\+∞)$/gm, "$2\n$1")
    
    .replace(/^(.+ＥＶＡＬ：-0(!+)!+)\n(.+ＥＶＡＬ：-0\2)$/gm, "$3\n$1")
    .replace(/^(.+ＥＶＡＬ：-∞)\n(.+ＥＶＡＬ：-0(!+))$/gm, "$2\n$1")
  )

  // choose the top rated move
  .replace(/Possible Moves:\n(. [^\n]*).*/s, "Selected Move: $1")

  // * end of old engine code

  // format as engine response

  .replace(/^.*Selected Move: .+?(....) .*$/s, "$1")

  .replaceTemplate(
    templateRegExp`/${(n: number) => String.fromCharCode("０".charCodeAt(0) + n)}/g`,
    (n: number) => String(n),
    range(1, 8)
  )
  .replaceTemplate(
    templateRegExp`/${(n: number) => String.fromCharCode("ａ".charCodeAt(0) + n - 1)}/g`,
    (n: number) => String.fromCharCode("a".charCodeAt(0) + n - 1),
    range(1, 8)
  )
;
