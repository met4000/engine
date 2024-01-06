// func to make RegExp powerful enough;
// repeatedly apply a replacement until the string stops changing
String.prototype.repeatReplace = function (f) {
  let lastStr = this, str = f(lastStr);
  while (lastStr != str) {
    lastStr = str;
    str = f(str);
  }
  return str;
};

// helper func that creates multiple replacements
// by iterating over the array provided
String.prototype.replaceTemplate = function (searchTemplate, replaceTemplate, arr) {
  let searchFunc = searchTemplate, replaceFunc = replaceTemplate;
  if (typeof searchTemplate !== "function") searchFunc = _ => String(searchTemplate);
  if (typeof replaceTemplate !== "function") replaceFunc = _ => String(replaceTemplate);

  let str = this;
  for (let v of arr) str = str.replace(searchFunc(v), replaceFunc(v));
  return str;
}

// string literal tag for making templates for `.replaceTemplate`
// makes a lambda from the literal string an lambdas provided
function template(strings, ...lambdas) {
  return (...args) => {
    let str = strings.raw[0];

    for (let i in lambdas) {
      let lambda = lambdas[i];
      if (typeof lambda !== "function") lambda = _ => lambdas[i];

      i = parseInt(i);
      str += lambda(...args);
      str += strings.raw[i + 1];
    }

    return str;
  }
}

// like the `template` tag, but makes a regex
function templateRegExp(string, ...lambdas) {
  return function (...args) {
    let [_, pattern, flags] = /^\/(.*)\/(\w*)$/.exec(template(string, ...lambdas)(...args));
    return new RegExp(pattern, flags);
  };
}

// range (inclusive)
function range(a, b, delta = 1) {
  return Array.from({ length: Math.abs(b - a) / Math.abs(delta) + 1 }).map((_, i) => a + i * delta * Math.sign(b - a));
}



//document.body.innerText =
`８｜♜♞♝♛♚♝♞♜
７｜♟︎♟︎♟︎♟︎♟︎♟︎♟︎♟︎
６｜・・・・・・・・
５｜・・・・・・・・
４｜・・・・・・・・
３｜・・・・・・・・
２｜♙♙♙♙♙♙♙♙
１｜♖♘♗♕♔♗♘♖
ー＋ーーーーーーーー
　｜ａｂｃｄｅｆｇｈ

[Result "*"]

1. *`
// main program is below:



// generate moves
// TODO add notation for check/checkmate?

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
  // doesn't know about pawn promotion or en-passant
  // TODO check piece is on board
  // TODO change pawns from $ and % to ^ and _
  // .replace(/！♙(.*\n.*\nー)/, "||*,_**,♙!$1") // starting rank
  // .replace(/！♙/, "|*,_**,♙!")
  // .replace(/！♗/, "%%%%%%%%****,♗!")
  // .replace(/！♘/, "<****,>****,♘!")
  // .replace(/！♖/, "%%%%%%%%****,♖!")
  // .replace(/！♕/, "$$$$$$$$$$$$$$$$****,%%%%%%%%****,♕!")
  // .replace(/！♔/, "$$****,%****,♔!")
  
  // ! only pawn forward moves and knight moves for now
  .replace(/！♙(.*\n.*\nー)/, "||*,_**,♙!$1") // starting rank
  .replace(/！♙/, "|*,_**,♙!")
  .replace(/！♘/, "<****,>****,♘!")
  .replace(/！([♔-♙])/, "$1!")

  // uses a @ to mark where the previous check was (and & after moving the check)

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
      .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){10})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){10}(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*)?[$*]+,[^\n]*([^\n])!(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4・$5$7$8\n$6 ~x$7$1 (-$3)") // up
      // TODO other directions
      
      // if occupied and |, remove marker
      .replace(/@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){10}(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*)?[|*]+,[^\n]*([^\n])!)/s, "$1") // up

      // remove initial preceding/trailing space
      .replace(/・?`・?/, "")
      .replace(/&/, "@")

      // TODO deal with final movement in a direction, and changing direction
      .replace(/(^[^@]*)([$|]*)\*(\**)([$|]+)(,)/, "$1$3$2$4$5") // must have hit something; remove any remaining distance and change direction
      .replace(/@([^$|*]+)\*(\**)([$|]+)(,)/, "・$1$3$2$4") // remove marker and change to next direction
      .replace(/([^$|*])[$|]+,/, "$1") // remove move types with all directions completed

      // increment distance by 1 (if it is already more than 0)
      .replace(/([$|])(\*+[$|])/, "$2$1")
    )
  )


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
      .replace(/([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){9})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){10})*)?[%_]*\*{2}[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "$1#$2・$3\n$4 ~x～ (-$1)") // up-right
      .replace(/([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){11})@(`?(?:(?:[♔-♞・\n１-８｜]|♟︎){11}(?:(?:[♔-♞・\n１-８｜]|♟︎){12})*)?[%_]*\*[%_],[^\n]*([^\n])!.*Possible Moves:)/s, "$1#$2・$3\n$4 ~x～ (-$1)") // up-left
      // TODO other directions

      // remove initial preceding/trailing space
      .replace(/・?`・?/, "")
      .replace(/&/, "@")

      // add current marker coords
      .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*@?)#((?:(?:(?:[^♔-♞・\n１-８｜♟︎ー]*[♔-♞・\n１-８｜]|♟︎)!?){11})*.{21})([ａ-ｈ])(.*)～/s, "$1$2$3$4$5$4$1") // TODO
      .replace(/#(.*ー)/s, "$1")

      // TODO deal with final movement in a direction, and changing direction
      .replace(/(^[^@]*)([%_]*)\*(\**)([%_]+)(,)/, "$1$3$2$4$5") // must have hit something; remove any remaining distance and change direction
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
  .replace(/(<\*{4},[^\n]*([^\n])!(?=.{0,8}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){8})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(<\*{3})\*(,[^\n]+!)/, "$1$2")

  // ***
  .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){22})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){22})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(<\*{2})\*(,[^\n]+!)/, "$1$2")

  // **
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/(<\*)\*(,[^\n]+!)/, "$1$2")
  
  // *
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/<\*,([^\n]+!)/, "$1")
  
  // >

  // ****
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/(>\*{3})\*(,[^\n]+!)/, "$1$2")
  
  // ***
  .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){20})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){20})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(>\*{2})\*(,[^\n]+!)/, "$1$2")
  
  // **
  .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){12})(・)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞・\n１-８｜]|♟︎){12})([♚-♞]|♟︎)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(>\*)\*(,[^\n]+!)/, "$1$2")
  
  // *
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)(・)((?:[♔-♞・\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞・\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/>\*,([^\n]+!)/, "$1")


  // add current coord to current moves
  .repeatReplace(v => v
    .replace(/([１-８])(｜(?:[♔-♞・]|♟︎)*(?:[♔-♞・]|♟︎)!(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*)~/s, "$1$2$3$4$3$1")
  )

  .replace(/(!)(\n[１-８]｜)/, "$2$1")
  .replace(/!/, "！")
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


// enact the move
.replace(/^.*Selected Move: (.{6})/s, "$1\n$&")
.replace(/^(.) (.)(.)(.)(.)\n((?:.|\n)*\5｜.*).(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:.|\n){21}\4)((?:.|\n)*\3｜.*).(?=(?:(?:[♔-♞・\n１-８｜]|♟︎){11})*(?:.|\n){21}\2)/, "$6$1$7・")

// add the move to the PGN

.replace(/(Selected Move: .{6}).*$/m, "$1")

.replace(/(Selected Move:.*)ａ/, "$1a")
.replace(/(Selected Move:.*)ｂ/, "$1b")
.replace(/(Selected Move:.*)ｃ/, "$1c")
.replace(/(Selected Move:.*)ｄ/, "$1d")
.replace(/(Selected Move:.*)ｅ/, "$1e")
.replace(/(Selected Move:.*)ｆ/, "$1f")
.replace(/(Selected Move:.*)ｇ/, "$1g")
.replace(/(Selected Move:.*)ｈ/, "$1h")

.replace(/(Selected Move:.*)１/, "$11")
.replace(/(Selected Move:.*)２/, "$12")
.replace(/(Selected Move:.*)３/, "$13")
.replace(/(Selected Move:.*)４/, "$14")
.replace(/(Selected Move:.*)５/, "$15")
.replace(/(Selected Move:.*)６/, "$16")
.replace(/(Selected Move:.*)７/, "$17")
.replace(/(Selected Move:.*)８/, "$18")
.replace(/(Selected Move:.*)９/, "$19")

.replace(/\*\n\nSelected Move: . (.{4})/, "$1 *")
