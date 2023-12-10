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
  return v => {
    let str = strings.raw[0];

    for (let i in lambdas) {
      let lambda = lambdas[i];
      if (typeof lambda !== "function") lambda = _ => lambdas[i];

      i = parseInt(i);
      str += lambda(v);
      str += strings.raw[i + 1];
    }

    return str;
  }
}

// like the `template` tag, but makes a regex
function templateRegExp(string, ...lambdas) {
  return function (v) {
    let [_, pattern, flags] = /^\/(.*)\/(\w*)$/.exec(template(string, ...lambdas)(v));
    return new RegExp(pattern, flags);
  };
}

// range (inclusive)
function range(a, b, delta = 1) {
  return Array.from({ length: Math.abs(b - a) / Math.abs(delta) + 1 }).map((_, i) => a + i * delta * Math.sign(b - a));
}


// common funcs, implemented using regex

// TODO remove `m` flags

// funcs that operate on things may accept a
// regex to specify the inputs, and will generally
// delete everything else captured by the regex

// ! TODO bug with 30+30+30...(30 times)
// operates on /(\d+)\+(\d+)/
// evaluates parentheses
String.prototype.r_add = function () { return this
  // (a + (b + c) + d) -> a + b + c + d
  .repeatReplace(v => v
    .replace(/\((\d+(?:\+\d+)*)\)/g, "$1")
  )

  // trim 0s
  .repeatReplace(v => v
    .replace(/\+0|0\+/g, "")
  )

  // ab -> a0 + b
  .repeatReplace(v => v
    .replace(/\b(\d+?)([1-9])(0*)\b/gm, "$10$3+$2$3")
  )

  // b + a0 -> a0 + b
  .repeatReplace(v => v
    .replace(/\b(\d)(0*)\+(\d)(0+)\2\b/gm, "$3$4$2+$1$2")
  )

  // sort; 10 + 20 -> 20 + 10
  .repeatReplace(v => v
    .replaceTemplate(templateRegExp`/\b(${n => n})(0*)\+([${n => n + 1}-9])\2\b/gm`, "$3$2+$1$2", range(1, 8))
  )

  // evaluate addition

  .repeatReplace(v => v
    // 80 + 40 = 100 + 20

    .replaceTemplate(templateRegExp`/\b9(0*)\+${n => n}\1\b/gm`, template`10$1+${n => n - 1}$1`, range(2, 9))
    .replace(/\b9(0*)\+1\1\b/gm, "10$1")

    .replaceTemplate(templateRegExp`/\b8(0*)\+${n => n}\1\b/gm`, template`10$1+${n => n - 2}$1`, range(3, 8))
    .replaceTemplate(templateRegExp`/\b8(0*)\+${n => n}\1\b/gm`, template`${n => 8 + n}$1`, range(1, 2))

    .replaceTemplate(templateRegExp`/\b7(0*)\+${n => n}\1\b/gm`, template`10$1+${n => n - 3}$1`, range(4, 7))
    .replaceTemplate(templateRegExp`/\b7(0*)\+${n => n}\1\b/gm`, template`${n => 7 + n}$1`, range(1, 3))

    .replaceTemplate(templateRegExp`/\b6(0*)\+${n => n}\1\b/gm`, template`10$1+${n => n - 4}$1`, range(5, 6))
    .replaceTemplate(templateRegExp`/\b6(0*)\+${n => n}\1\b/gm`, template`${n => 6 + n}$1`, range(1, 4))

    .replaceTemplate(templateRegExp`/\b5(0*)\+${n => n}\1\b/gm`, template`${n => 5 + n}$1`, range(1, 5))
    .replaceTemplate(templateRegExp`/\b4(0*)\+${n => n}\1\b/gm`, template`${n => 4 + n}$1`, range(1, 4))
    .replaceTemplate(templateRegExp`/\b3(0*)\+${n => n}\1\b/gm`, template`${n => 3 + n}$1`, range(1, 3))
    .replaceTemplate(templateRegExp`/\b2(0*)\+${n => n}\1\b/gm`, template`${n => 2 + n}$1`, range(1, 2))
    .replace(/\b1(0*)\+1\1\b/gm, "2$1")

    // sort by length
    .repeatReplace(v => v
      .replace(/\b(\d)(0*)\+(\d)(0+)\2\b/gm, "$3$4$2+$1$2")
    )

    // sort by number
    .repeatReplace(v => v
      .replaceTemplate(templateRegExp`/\b(${n => n})(0*)\+([${n => n + 1}-9])\2\b/gm`, "$3$2+$1$2", range(1, 8))
    )
  )

  // a0 + b -> ab
  .repeatReplace(v => v
    .replace(/\b(\d+?)0(0*?)(0*)\+(\d\3)\b/, "$1$2$4")
  )
};

// assumes positive integers
// operates on /(\d+)\*(\d+)/, uses /[!]/ with multiplied numbers
// evaluates parentheses, evaluates addition/subtraction
String.prototype.r_mult = function () { return this
  // (a) -> a
  .repeatReplace(v => v
    .replace(/\((\d+)\)/g, "$1")
  )

  .repeatReplace(v => v
    // a * b * c * d -> ((a ! b) * c * d)
    .replace(/(^|[^\*])\b(\d+)\*(\d+)((?:\*\d+)*)/g, "$1(($2!$3)$4)")

    // (a ! 0) or (0 ! a) -> 0
    .replace(/\b(?:\d+!0|0!\d+)\b/g, "0")
    
    // distribute; ab ! cd -> a0 * c0 + a0 * d + b * c0 + b * d
    .repeatReplace(v => v
      // over RHS: a ! bc -> a ! b0 + a ! c
      .repeatReplace(v => v
        .replace(/(\d+)!(\d+)([1-9])(0*)/g, "$1!$20$4+$1!$3$4")
      )

      // over LHS: ab ! c -> a0 ! c + b ! c
      .repeatReplace(v => v
        .replace(/(\d+)([1-9])(0*)!(\d+)/g, "$10$3!$4+$2$3!$4")
      )
    )

    // sort by digit
    .repeatReplace(v => v
      .replaceTemplate(templateRegExp`/([${n => n + 1}-9])(0*)!(${n => n})(0*)/g`, "$3$4!$1$2", range(1, 8))
    )

    // multiply individual digits
    .replace(/1(0*)!([1-9])(0*)/g, "$2$1$3")
    .replaceTemplate(templateRegExp`/2(0*)!${n => n}(0*)/g`, template`${n => 2 * n}$1$2`, range(2, 9))
    .replaceTemplate(templateRegExp`/3(0*)!${n => n}(0*)/g`, template`${n => 3 * n}$1$2`, range(3, 9))
    .replaceTemplate(templateRegExp`/4(0*)!${n => n}(0*)/g`, template`${n => 4 * n}$1$2`, range(4, 9))
    .replaceTemplate(templateRegExp`/5(0*)!${n => n}(0*)/g`, template`${n => 5 * n}$1$2`, range(5, 9))
    .replaceTemplate(templateRegExp`/6(0*)!${n => n}(0*)/g`, template`${n => 6 * n}$1$2`, range(6, 9))
    .replaceTemplate(templateRegExp`/7(0*)!${n => n}(0*)/g`, template`${n => 7 * n}$1$2`, range(7, 9))
    .replaceTemplate(templateRegExp`/8(0*)!${n => n}(0*)/g`, template`${n => 8 * n}$1$2`, range(8, 9))
    .replaceTemplate(templateRegExp`/9(0*)!${n => n}(0*)/g`, template`${n => 9 * n}$1$2`, range(9, 9))

    // add components back together
    .r_add_sub()

    // (a) -> a
    .repeatReplace(v => v
      .replace(/\((\d+)\)/g, "$1")
    )
  )
};

// operates on /(\d+)-(\d+)/, uses /[`!|]/ with added/subtracted numbers
// evaluates parentheses, evaluates addition
String.prototype.r_add_sub = function () { return this
  .repeatReplace(v => v
    // (a) -> a
    .repeatReplace(v => v
      .replace(/\(([+-]?\d+)\)/g, "$1")
    )

    // +/- a +/- b +/- c -> (add_sub: +/- a +/- b +/- c)
    .replace(/(^|[^+-])([+-]?\d+(?:[+-]+\d+)+)/g, "$1(add_sub:$2)")

    // (add_sub:a -> (add_sub:+a
    .replace(/(\(add_sub:)(\d)/g, "$1+$2")

    // split, preserving sign
    .repeatReplace(v => v
      .replace(/([\+-])(\d+?)([1-9])(0*)\b/g, "$1$20$4$1$3$4")
    )

    // convert to tokens; 30 -> |||!0
    .replace(/([+-])(\d)(0*)/g, "$1$2!$3")
    .replaceTemplate(templateRegExp`/([+-])${n => n}(\|*!0*)/g`, template`$1${n => n - 1}|$2`, range(9, 2))
    .replace(/([+-])1(\|*!0*)/g, "$1|$2")
    .replace(/([+-])0!/g, "")

    .repeatReplace(v => v
      .repeatReplace(v => v
        // sort by 0s, preserving sign
        .repeatReplace(v => v
          .replace(/([\+-])(\|*)!(0*)([\+-])(\|*)!(0+)\3\b/g, "$4$5!$6$3$1$2!$3")
        )

        // add, add / sub, sub
        .replace(/([+-])(\|*)!(0*)\1(\|*)!\3/g, "$1$2$4!$3")

        // sub, add -> add, sub
        .replace(/-(\|*)!(0*)\+(\|*)!\2/g, "+$3!$2-$1!$2")

        // add, sub
        .replace(/\+(\|*)(\|*)!(0*)-\2!\3/g, "+$1!$3") // LHS >= RHS
        .replace(/\+(\|*)!(0*)-(\|*)\1!\2/g, "-$3!$2") // LHS <= RHS

        // carry
        .replace(/([+-])(\|*)\|{10}!(0*)/g, "$1|!0$3$1$2!$3")

        // 00 -> 0, and a + 0 -> a
        .replace(/[+-]!(0+)/g, "+!")
        .replace(/([+-]\|*!0*)(?:[+-]!)+/g, "$1")

        // (a) -> a
        .repeatReplace(v => v
          .replace(/\(([+-]\|+!0*)\)/g, "$1")
        )
      )

      // if the result will be negative, flip the signs; (sub:-a+b) -> -(sub:a-b)
      .replace(/(\(add_sub:)-/g, "-$1`-")
      .repeatReplace(v => v
        .replace(/`\+(\|*!0*)/g, "-$1`")
        .replace(/`-(\|*!0*)/g, "+$1`")
      )
      .replace(/([!0])\`\)/g, "$1)")

      // +-a -> -a, --a -> a
      .repeatReplace(v => v
        .replace(/(?:\+-|-\+)\(/g, "-(")
        .replace(/--()/g, "(")
      )

      // un-carry where needed for remaining subtractions; +||!0 -||! -> +|!0 +||||||||||! -||!
      .repeatReplace(v => v
        .replace(/\+(\|*)\|!(0*?)0(0*)-(\|*)!\3([+-]|\))/g, `+$1!$20$3+${"|".repeat(10)}!$2$3-$4!$3$5`)
      )
    )

    // convert from tokens back to digits
    .replace(/([+-])(\|*)!/g, "$1$20!")
    .replaceTemplate(templateRegExp`/([+-])(\|*)\|${n => n}!/g`, template`$1$2${n => n + 1}!`, range(0, 8))
    .replace(/([+-])(\d)!(0*)/g, "$1$2$3")

    // a0 + b -> ab
    .repeatReplace(v => v
      .replace(/([+-])(\d+?)(0*)0(0*)\1(\d\4)\b/, "$1$2$3$5")
    )

    // (add_sub:+a) -> a
    .replace(/\(add_sub:\+(\d+)\)/g, "$1")
  )
};

// assumes positive integers // TODO generalise (move sign out and cancel)
// uses r_add_sub
String.prototype.r_qdiv = function (paramRegex = /\((\d+)\/(\d+)\)/g, outFormat = "($1r$2)") { return this
  .replace(paramRegex, "(qdiv:$1,$2)")
  
  // uses repeated subtraction - Q,R,D - see wikipedia
  .replace(/\(qdiv:([^,)]+?),([^,)]+?)\)/g, "(qdiv:0,$1,$2)")
  .repeatReplace(v => v
    // return Q and R if R < D
    .replace(/\(qdiv:([^,)]+?),([^,)]+?),([^,)]+?)\)/g, "(qdiv:$1,($2<$3))")
    .r_lt()
    .replace(/\(qdiv:([^,)]+?),\(([^,)]+?)<([^,)]+?):T\)\)/g, "(qdiv:$1,$2)")
    .replace(/\(qdiv:([^,)]+?),\(([^,)]+?)<([^,)]+?):F\)\)/g, "(qdiv:$1,$2,$3)")
    
    // Q += 1, R -= D
    .replace(/\(qdiv:([^,)]+?),([^,)]+?),([^,)]+?)\)/g, "(qdiv:($1+1),($2-$3),$3)")
    .r_add_sub()
  )

  .replace(/\(qdiv:([^,)]+?),([^,)]+?)\)/g, outFormat)
};

// assumes positive integers
// TODO define floor/ceil behaviour for non-positive values
// uses r_qdiv
String.prototype.r_idiv = function (floor = true, paramRegex = /\((\d+)\/(\d+)\)/g, outFormat = "($1)") { return this
  .replace(paramRegex, "(idiv:$1,$2)")

  .replace(/\(idiv:([^,)]+?),([^,)]+?)\)/g, "(idiv:($1/$2))")
  .r_qdiv()
  .replace(/\(idiv:\(([^,)]+?)r([^,)]+?)\)\)/g, floor ? "(idiv:$1)" : "(idiv:$1,$2)")
  
  // ceil
  .replace(/\(idiv:([^,)]+?),0\)/g, "(idiv:$1)")
  .replace(/\(idiv:([^,)]+?),([^,)]+?)\)/g, "(idiv:($1+1))")
  .r_add_sub()
  
  .replace(/\(idiv:([^,)]+?)\)/g, outFormat)
};

// uses r_add_sub
String.prototype.r_lt = function (paramRegex = /\(([+-]?\d+)<([+-]?\d+)\)/g, trueStr = "($1<$2:T)", falseStr = "($1<$2:F)") { return this
  .replace(paramRegex, "(lt:$1,$2)")

  // compute a - b
  .replace(/\(lt:([^,)]+?),([^,)]+?)\)/g, "(lt:$1,$2:$1-$2)")
  .r_add_sub()
  
  // a - b < 0 => a < b
  .replace(/\(lt:([^,)]+?),([^,)]+?):-[^)]+\)/g, trueStr)
  .replace(/\(lt:([^,)]+?),([^,)]+?):[^)]+\)/g, falseStr)
};

// assumes positive integer
// evaluates addition/subtraction
// TODO use an optimised addition op rather than what the current r_add is (i.e. optimise r_add)
String.prototype.r_isqrt = function (paramRegex = /\(isqrt:(\d+)\)/g, outFormat = "($1)") { return this
  .replace(paramRegex, "(isqrt:$1)")
  
  // use addition-based linear search - y:a,d,L - see wikipedia
  .replace(/\(isqrt:([^)]+)\)/g, "(isqrt:$1:1,3,0)")
  .repeatReplace(v => v
    // return L if y < a
    .replace(/\(isqrt:(\d+):(\d+),(\d+),(\d+)\)/g, "(isqrt:($1<$2),$3,$4)")
    .r_lt()
    .replace(/\(isqrt:\((\d+)<(\d+):T\),(\d+),(\d+)\)/g, "(isqrt:$4)")
    .replace(/\(isqrt:\((\d+)<(\d+):F\),(\d+),(\d+)\)/g, "(isqrt:$1:$2,$3,$4)")
    
    // a += d, d += 2, L += 1
    .replace(/\(isqrt:(\d+):(\d+),(\d+),(\d+)\)/g, "(isqrt:$1:($2+$3),($3+2),($4+1))")
    .r_add_sub()
  )

  .replace(/\(isqrt:(\d+)\)/g, outFormat)
};


// * solution:

// not including newline
// const INPUT_WIDTH = 5;
const INPUT_WIDTH = 140;


document.body.innerText.replace(/\n$/, "")

// traversal uses % for up, ^ for down, & for left, * for right for the previous movement

// start traversal from first pipe found going away from the start (only need to check 3 sides)
.replace(templateRegExp`/([7|F])(.{${INPUT_WIDTH}})S/s`(), "$1%$2s") // up
.replace(/([F\-L])S/, "$1&s") // left
.replace(/S([J\-7])/, "s$1*") // right

// traverse, marking the path
// marked versions; F: f, 7: 1, J: j, L: l, |: ', -: _
.repeatReplace(v => v
  // move right
  .replace(/(?:(F)%|(-)\*|(L)\^)(.)/, "$1$2$3!$4*")
  .replace(/F!/g, "f").replace(/7!/g, "1").replace(/J!/g, "j").replace(/L!/g, "l").replace(/\|!/g, "'").replace(/-!/g, "_")
  
  // move down
  .replace(templateRegExp`/(?:(7)\*|(\|)\^|(F)&)(.{${INPUT_WIDTH}}.)/s`(), "$1$2$3!$4^")
  .replace(/F!/g, "f").replace(/7!/g, "1").replace(/J!/g, "j").replace(/L!/g, "l").replace(/\|!/g, "'").replace(/-!/g, "_")
  
  // move left
  .replace(/(?:(J)\^|(-)&|(7)%)/, "&$1$2$3!")
  .replace(/F!/g, "f").replace(/7!/g, "1").replace(/J!/g, "j").replace(/L!/g, "l").replace(/\|!/g, "'").replace(/-!/g, "_")
  
  // move up
  .replace(templateRegExp`/(.)(.{${INPUT_WIDTH}})(?:(L)&|(\|)%|(J)\*)/s`(), "$1%$2$3$4$5!")
  .replace(/F!/g, "f").replace(/7!/g, "1").replace(/J!/g, "j").replace(/L!/g, "l").replace(/\|!/g, "'").replace(/-!/g, "_")
)
.replace(/[%^&*]/, "")

// count number of tiles in the path
.replace(/[^sf1jl'_]/g, "")
.replace(/./g, "+1")
.replace(/^/, "0")
.r_add_sub()

// halve the number of tiles to get the max distance
.replace(/$/, "/2")
.r_idiv(true, /(\d+)\/(\d+)/g, "$1")
