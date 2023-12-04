// helper func to make RegExp powerful enough to add numbers;
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
			i = parseInt(i);
			str += lambdas[i](v);
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
function range(a, b) {
	return Array.from({ length: b - a + 1 }).map((_, i) => i + a)
}


// * solution:


document.body.innerText.replace(/\n$/, "") // remove trailing newline

.replace(/^Card\s+\d+:\s+(.+)$/gm, "$1")
.replace(/ +/gm, " ")


// sort LHS in decreasing order, and RHS in increasing order

// make everything 2 digits
.replace(/\b(\d)\b/g, "0$1")

// mark LHS numbers and RHS numbers
.replace(/(\d+)(?=[\d ]*\|)/g, "L$1")
.replace(/ (\d+)/g, " R$1")

.repeatReplace(v => v
	// sort LHS
	.replaceTemplate(templateRegExp`/L(\d?)(${n => n})(\d?) L\1([${n => n + 1}-9])(\d?)/g`, "L$1$4$5 L$1$2$3", range(0, 8))
	
	// sort RHS
	.replaceTemplate(templateRegExp`/R(\d?)([${n => n + 1}-9])(\d?) R\1(${n => n})(\d?)/g`, "R$1$4$5 R$1$2$3", range(0, 8))
)

// count the number of matches (the number of bars, minus 1)
.repeatReplace(v => v
	// LHS = RHS
	.replace(/L(\d+) (\|+) R\1/g, "$2|")

	// LHS < RHS
	.replaceTemplate(templateRegExp`/L(\d?)(${n => n})(\d?) (\|+) R\1([${n => n + 1}-9])(\d?)/g`, "$4 R$1$5$6", range(0, 8))

	// LHS > RHS
	.replaceTemplate(templateRegExp`/L(\d?)([${n => n + 1}-9])(\d?) (\|+) R\1(${n => n})(\d?)/g`, "L$1$2$3 $4", range(0, 8))
)

// remove leftover numbers and the extra bars
.replace(/^.*?\|(\|*).*$/gm, "$1")

// add line copy count
.replace(/^/gm, "1")

// add current line marker
.replace(/^/, "*")

.repeatReplace(v => v
	// mark lines for each match
	.repeatReplace(v => v
		.replace(/\*([\d\+]+)(\|*)\|((?:\n.*?)+[^!])(\n|$)/, "*$1$2$3!$4")
	)

	// add card count to marked lines
	.repeatReplace(v => v
		.replace(/\*([\d\+]+)((?:\n.+)*?\n[\d\+]+)(\|*)!/, "*$1$2+$1$3")
	)

	// perform addition

	// b + a0 -> a0 + b
	.repeatReplace(v => v
		.replace(/\b(\d)(0*)\+(\d)(0+)\2\b/gm, "$3$4$2+$1$2")
	)

	// sort; 10 + 20 -> 20 + 10
	.repeatReplace(v => v
		.replaceTemplate(templateRegExp`/\b(${n => n})(0*)\+([${n => n + 1}-9])\2\b/gm`, "$3$2+$1$2", range(1, 8))
	)

	// add
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


	// move line marker to next line
	.replace(/\*([\d\+]+\n)/, "$1*")
)

// remove line marker
.replace(/\*/, "")

// add card counts

.replace(/\n/g, "+")

// b + a0 -> a0 + b
.repeatReplace(v => v
	.replace(/\b(\d)(0*)\+(\d)(0+)\2\b/gm, "$3$4$2+$1$2")
)

// sort; 10 + 20 -> 20 + 10
.repeatReplace(v => v
	.replaceTemplate(templateRegExp`/\b(${n => n})(0*)\+([${n => n + 1}-9])\2\b/gm`, "$3$2+$1$2", range(1, 8))
)

// add
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
	.replace(/\b(\d+?)0(0*?)(0*)\+(\d\3)\b/m, "$1$2$4")
)
