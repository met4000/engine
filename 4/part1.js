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


document.body.innerText
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

// calculate the score (2 ** (num bars - 1))
.replace(/\|$/gm, "!")
.repeatReplace(v => v
	.replace(/\|(!+)/gm, "$1$1")
)

// add the scores together
.replace(/\n/g, "")
.replace(/^$/g, "0")
.repeatReplace(v => v
	.replace(/^!/g, "1")
	.replaceTemplate(templateRegExp`/(${n => n})!/g`, template`${n => n + 1}`, range(0, 8))
	.replace(/9!/g, "!0")
)
