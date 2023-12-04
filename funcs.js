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


// common funcs, implemented using regex

// TODO remove `m` flags

// funcs that operate on things may accept a
// regex to specify the inputs, and will generally
// delete everything else captured by the regex

// operates on /(\d+)\+(\d+)/
// evaluates parentheses
String.prototype.r_add = function () { return this
	// (a + (b + c) + d) -> a + b + c + d
	.repeatReplace(v => v
		.replace(/\((\d+(?:\+\d+)*)\)/g, "$1")
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

// operates on /(\d+)\*(\d+)/, uses /[!|]/ with multiplied numbers
// evaluates parentheses, evaluates addition
String.prototype.r_mult = function () { return this
	// (a) -> a
	.repeatReplace(v => v
		.replace(/\((\d+)\)/g, "$1")
	)

	// sort from highest to lowest length
	.repeatReplace(v => v
		.replace(/(\d*?)(!*)(\d)(\d*)(\*|$)/gm, "$1$3!$2$4$5")
	)
	.repeatReplace(v => v
		.replace(/(\d+)(!+)\*(\d+)(!+)\2(\*|$)/gm, "$3$4$2*$1$2$5")
	)
	
	// sort from highest to lowest, using just the first digit (will make it somewhat faster when multiplying)
	.repeatReplace(v => v
		.replace(/(1)(\d*)(!+)\*([2-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(2)(\d*)(!+)\*([3-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(3)(\d*)(!+)\*([4-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(4)(\d*)(!+)\*([5-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(5)(\d*)(!+)\*([6-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(6)(\d*)(!+)\*([7-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(7)(\d*)(!+)\*([8-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
		.replace(/(8)(\d*)(!+)\*([9-9])(\d*)\3(\*|$)/gm, "$4$5$3*$1$2$3$6")
	)
	.replace(/(\d+)!+/gm, "$1")

	
	// evaluate multiplication

	.repeatReplace(v => v
		// a * b * c * d -> ((a ! b) * c * d)
		.replace(/(^|[^\*])\b(\d+)\*(\d+)((?:\*\d+)*)/g, "$1(($2!$3)$4)")
		
		// a ! b -> a + a + ... + a
		.repeatReplace(v => v
			// a ! bc -> a ! b0 + a ! c
			.repeatReplace(v => v
				.replace(/(\d+)!(\d+)([1-9])(0*)/gm, "$1!$20$4+$1!$3$4")
			)

			// a ! b00 -> a ! (b-1)99 + a
			.repeatReplace(v => v
				// has to be done in order, so that it doesn't go 30 -> 2|0 -> 1|0
				.replace(/(\d+)!1(0*)/gm, "$1!|$2+$1")
				.replaceTemplate(templateRegExp`/(\d+)!${n => n}(0*)/gm`, template`$1!${n => n - 1}|$2+$1`, range(2, 9))

				// replace trailing 0s with 9s (from underflows)
				.repeatReplace(v => v
					.replace(/(\d*)\|(0)/gm, "$19|")
				)
				.replace(/(\d+)\|/gm, "$1")
				.replace(/\d+!\|\+/gm, "")
			)
		)

		.r_add()

		// (a) -> a
		.repeatReplace(v => v
			.replace(/\((\d+)\)/g, "$1")
		)
	)
};
