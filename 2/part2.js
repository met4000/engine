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

// calculate the value on each line

document.body.innerText
.replace(/Game \d+: /gm, "")
.replace(/;/gm, ",")

// reorder (into: reds, greens, blues)
.repeatReplace(v => v
	.replace(/(\d+) (blue), (\d+) (red|green)/gm, "$3 $4, $1 $2")
	.replace(/(\d+) (green), (\d+) (red)/gm, "$3 $4, $1 $2")
)

// add length tokens
.repeatReplace(v => v
	.replace(/(\d*?)(!*)(\d)(\d*) (\w+)/gm, "$1$3!$2$4 $5")
)

// reduce down to same and max size
.repeatReplace(v => v
	.replace(/(\d+)(!+?)(!+) (\w+), (\d+)\3 \4(,?)/gm, "$1$2$3 $4$6") // length LHS > RHS
	.replace(/(\d+)(!+) (\w+), (\d+)(!+)\2 \3(,?)/gm, "$4$5$2 $3$6") // length LHS < RHS
)

// replace length tokens with marker tokens
.replace(/(\d+)!+/gm, "|$1")

// remove smaller entries
.repeatReplace(v => v
	.repeatReplace(v => v
		// LHS < RHS
		.replace(/(\d*)\|(0)(\d*) (\w+), (\d*)\|([1-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(1)(\d*) (\w+), (\d*)\|([2-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(2)(\d*) (\w+), (\d*)\|([3-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(3)(\d*) (\w+), (\d*)\|([4-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(4)(\d*) (\w+), (\d*)\|([5-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(5)(\d*) (\w+), (\d*)\|([6-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(6)(\d*) (\w+), (\d*)\|([7-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(7)(\d*) (\w+), (\d*)\|([8-9])(\d*) \4/gm, "$5|$6$7 $4")
		.replace(/(\d*)\|(8)(\d*) (\w+), (\d*)\|([9-9])(\d*) \4/gm, "$5|$6$7 $4")

		// LHS > RHS
		.replace(/(\d*)\|([1-9])(\d*) (\w+), (\d*)\|(0)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([2-9])(\d*) (\w+), (\d*)\|(1)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([3-9])(\d*) (\w+), (\d*)\|(2)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([4-9])(\d*) (\w+), (\d*)\|(3)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([5-9])(\d*) (\w+), (\d*)\|(4)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([6-9])(\d*) (\w+), (\d*)\|(5)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([7-9])(\d*) (\w+), (\d*)\|(6)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([8-9])(\d*) (\w+), (\d*)\|(7)(\d*) \4/gm, "$1|$2$3 $4")
		.replace(/(\d*)\|([9-9])(\d*) (\w+), (\d*)\|(8)(\d*) \4/gm, "$1|$2$3 $4")

		// final digit and LHS = RHS
		.replace(/(\d*)\|(\d) (\w+), (\d*)\|\2 \3/gm, "$1|$2 $3")
	)

	// move on to the next digit
	// * this is abusing the fact that these replacements aren't executed associatively
	.replace(/(\d*)\|(\d)(\d*) (\w+)/gm, "$1$2|$3 $4")
)

// * part one would differ from here on: would filter based on bounds for each colour (and would also have the game number still in)

// strip to just numbers and separators
.replace(/ ?(\d+)\| \w+/gm, "$1").replace(/,/g, "*")


// multiply

// sort from highest to lowest length using length tokens (as before)
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

// a * b * c -> (a * b) * c
.replace(/(\d+)\*(\d+)\*(\d+)/gm, "($1*$2)*$3")

// do a * b, then result * c
.repeatReplace(v => v
	// a * b -> a + a + a + ...
	.repeatReplace(v => v
		// a * bc -> a * b0 + a * c
		.repeatReplace(v => v
			.replace(/(\d+)\*(\d+)([1-9])(0*)/gm, "$1*$20$4+$1*$3$4")
		)

		// a * b00 -> a * (b-1)99 + a
		.repeatReplace(v => v
			// has to be done in order, so that it doesn't go 30 -> 2|0 -> 1|0
			.replace(/(\d+)\*(1)(0*)/gm, "$1*|$3+$1")
			.replace(/(\d+)\*(2)(0*)/gm, "$1*1|$3+$1")
			.replace(/(\d+)\*(3)(0*)/gm, "$1*2|$3+$1")
			.replace(/(\d+)\*(4)(0*)/gm, "$1*3|$3+$1")
			.replace(/(\d+)\*(5)(0*)/gm, "$1*4|$3+$1")
			.replace(/(\d+)\*(6)(0*)/gm, "$1*5|$3+$1")
			.replace(/(\d+)\*(7)(0*)/gm, "$1*6|$3+$1")
			.replace(/(\d+)\*(8)(0*)/gm, "$1*7|$3+$1")
			.replace(/(\d+)\*(9)(0*)/gm, "$1*8|$3+$1")

			// replace trailing 0s with 9s (from underflows)
			.repeatReplace(v => v
				.replace(/(\d*)\|(0)/gm, "$19|")
			)
			.replace(/(\d+)\|/gm, "$1")
			.replace(/\d+\*\|\+/gm, "")
		)
	)


	// add

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
		.replace(/\b(1)(0*)\+([2-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(2)(0*)\+([3-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(3)(0*)\+([4-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(4)(0*)\+([5-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(5)(0*)\+([6-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(6)(0*)\+([7-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(7)(0*)\+([8-9])\2\b/gm, "$3$2+$1$2")
		.replace(/\b(8)(0*)\+([9-9])\2\b/gm, "$3$2+$1$2")
	)

	// add
	.repeatReplace(v => v
		// 80 + 40 = 100 + 20
		.replace(/\b9(0*)\+9\1\b/gm, "10$1+8$1").replace(/\b9(0*)\+8\1\b/gm, "10$1+7$1").replace(/\b9(0*)\+7\1\b/gm, "10$1+6$1").replace(/\b9(0*)\+6\1\b/gm, "10$1+5$1").replace(/\b9(0*)\+5\1\b/gm, "10$1+4$1").replace(/\b9(0*)\+4\1\b/gm, "10$1+3$1").replace(/\b9(0*)\+3\1\b/gm, "10$1+2$1").replace(/\b9(0*)\+2\1\b/gm, "10$1+1$1").replace(/\b9(0*)\+1\1\b/gm, "10$1")
		.replace(/\b8(0*)\+8\1\b/gm, "10$1+6$1").replace(/\b8(0*)\+7\1\b/gm, "10$1+5$1").replace(/\b8(0*)\+6\1\b/gm, "10$1+4$1").replace(/\b8(0*)\+5\1\b/gm, "10$1+3$1").replace(/\b8(0*)\+4\1\b/gm, "10$1+2$1").replace(/\b8(0*)\+3\1\b/gm, "10$1+1$1").replace(/\b8(0*)\+2\1\b/gm, "10$1").replace(/\b8(0*)\+1\1\b/gm, "9$1")
		.replace(/\b7(0*)\+7\1\b/gm, "10$1+4$1").replace(/\b7(0*)\+6\1\b/gm, "10$1+3$1").replace(/\b7(0*)\+5\1\b/gm, "10$1+2$1").replace(/\b7(0*)\+4\1\b/gm, "10$1+1$1").replace(/\b7(0*)\+3\1\b/gm, "10$1").replace(/\b7(0*)\+2\1\b/gm, "9$1").replace(/\b7(0*)\+1\1\b/gm, "8$1")
		.replace(/\b6(0*)\+6\1\b/gm, "10$1+2$1").replace(/\b6(0*)\+5\1\b/gm, "10$1+1$1").replace(/\b6(0*)\+4\1\b/gm, "10$1").replace(/\b6(0*)\+3\1\b/gm, "9$1").replace(/\b6(0*)\+2\1\b/gm, "8$1").replace(/\b6(0*)\+1\1\b/gm, "7$1")
		.replace(/\b5(0*)\+5\1\b/gm, "10$1").replace(/\b5(0*)\+4\1\b/gm, "9$1").replace(/\b5(0*)\+3\1\b/gm, "8$1").replace(/\b5(0*)\+2\1\b/gm, "7$1").replace(/\b5(0*)\+1\1\b/gm, "6$1")
		.replace(/\b4(0*)\+4\1\b/gm, "8$1").replace(/\b4(0*)\+3\1\b/gm, "7$1").replace(/\b4(0*)\+2\1\b/gm, "6$1").replace(/\b4(0*)\+1\1\b/gm, "5$1")
		.replace(/\b3(0*)\+3\1\b/gm, "6$1").replace(/\b3(0*)\+2\1\b/gm, "5$1").replace(/\b3(0*)\+1\1\b/gm, "4$1")
		.replace(/\b2(0*)\+2\1\b/gm, "4$1").replace(/\b2(0*)\+1\1\b/gm, "3$1")
		.replace(/\b1(0*)\+1\1\b/gm, "2$1")

		// sort by length
		.repeatReplace(v => v
			.replace(/\b(\d)(0*)\+(\d)(0+)\2\b/gm, "$3$4$2+$1$2")
		)

		// sort by number
		.repeatReplace(v => v
			.replace(/\b(1)(0*)\+([2-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(2)(0*)\+([3-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(3)(0*)\+([4-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(4)(0*)\+([5-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(5)(0*)\+([6-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(6)(0*)\+([7-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(7)(0*)\+([8-9])\2\b/gm, "$3$2+$1$2")
			.replace(/\b(8)(0*)\+([9-9])\2\b/gm, "$3$2+$1$2")
		)
	)

	// a0 + b -> ab
	.repeatReplace(v => v
		.replace(/\b(\d+?)0(0*?)(0*)\+(\d\3)\b/m, "$1$2$4")
	)

	// (a) * c -> a * c
	.replace(/\(|\)/gm, "")
)


// add the values together (taken from day 1 part 2)

.repeatReplace(v => v.replace(/^(\d+?)([1-9])(0*)$/gm, "$10$3\n$2$3"))

.repeatReplace(v => v.replace(/^(\d)(0*)\n(\d)(0+)\2$/gm, "$3$4$2\n$1$2"))

.repeatReplace(v => v.replace(/^(1)(0*)\n([2-9])\2$/gm, "$3$2\n$1$2").replace(/^(2)(0*)\n([3-9])\2$/gm, "$3$2\n$1$2").replace(/^(3)(0*)\n([4-9])\2$/gm, "$3$2\n$1$2").replace(/^(4)(0*)\n([5-9])\2$/gm, "$3$2\n$1$2").replace(/^(5)(0*)\n([6-9])\2$/gm, "$3$2\n$1$2").replace(/^(6)(0*)\n([7-9])\2$/gm, "$3$2\n$1$2").replace(/^(7)(0*)\n([8-9])\2$/gm, "$3$2\n$1$2").replace(/^(8)(0*)\n([9-9])\2$/gm, "$3$2\n$1$2"))

.repeatReplace(v => v
	.replace(/^9(0*)\n9\1$/gm, "10$1\n8$1").replace(/^9(0*)\n8\1$/gm, "10$1\n7$1").replace(/^9(0*)\n7\1$/gm, "10$1\n6$1").replace(/^9(0*)\n6\1$/gm, "10$1\n5$1").replace(/^9(0*)\n5\1$/gm, "10$1\n4$1").replace(/^9(0*)\n4\1$/gm, "10$1\n3$1").replace(/^9(0*)\n3\1$/gm, "10$1\n2$1").replace(/^9(0*)\n2\1$/gm, "10$1\n1$1").replace(/^9(0*)\n1\1$/gm, "10$1")

	.replace(/^8(0*)\n8\1$/gm, "10$1\n6$1").replace(/^8(0*)\n7\1$/gm, "10$1\n5$1").replace(/^8(0*)\n6\1$/gm, "10$1\n4$1").replace(/^8(0*)\n5\1$/gm, "10$1\n3$1").replace(/^8(0*)\n4\1$/gm, "10$1\n2$1").replace(/^8(0*)\n3\1$/gm, "10$1\n1$1").replace(/^8(0*)\n2\1$/gm, "10$1").replace(/^8(0*)\n1\1$/gm, "9$1")

	.replace(/^7(0*)\n7\1$/gm, "10$1\n4$1").replace(/^7(0*)\n6\1$/gm, "10$1\n3$1").replace(/^7(0*)\n5\1$/gm, "10$1\n2$1").replace(/^7(0*)\n4\1$/gm, "10$1\n1$1").replace(/^7(0*)\n3\1$/gm, "10$1").replace(/^7(0*)\n2\1$/gm, "9$1").replace(/^7(0*)\n1\1$/gm, "8$1")

	.replace(/^6(0*)\n6\1$/gm, "10$1\n2$1").replace(/^6(0*)\n5\1$/gm, "10$1\n1$1").replace(/^6(0*)\n4\1$/gm, "10$1").replace(/^6(0*)\n3\1$/gm, "9$1").replace(/^6(0*)\n2\1$/gm, "8$1").replace(/^6(0*)\n1\1$/gm, "7$1")

	.replace(/^5(0*)\n5\1$/gm, "10$1").replace(/^5(0*)\n4\1$/gm, "9$1").replace(/^5(0*)\n3\1$/gm, "8$1").replace(/^5(0*)\n2\1$/gm, "7$1").replace(/^5(0*)\n1\1$/gm, "6$1")

	.replace(/^4(0*)\n4\1$/gm, "8$1").replace(/^4(0*)\n3\1$/gm, "7$1").replace(/^4(0*)\n2\1$/gm, "6$1").replace(/^4(0*)\n1\1$/gm, "5$1")

	.replace(/^3(0*)\n3\1$/gm, "6$1").replace(/^3(0*)\n2\1$/gm, "5$1").replace(/^3(0*)\n1\1$/gm, "4$1")

	.replace(/^2(0*)\n2\1$/gm, "4$1").replace(/^2(0*)\n1\1$/gm, "3$1")

	.replace(/^1(0*)\n1\1$/gm, "2$1")

	.repeatReplace(v => v.replace(/^(\d{1})\n(\d{2,})$|^(\d{2})\n(\d{3,})$|^(\d{3})\n(\d{4,})$|^(\d{4})\n(\d{5,})$|^(\d{5})\n(\d{6,})$/gm, "$2$4$6$8$10\n$1$3$5$7$9"))

	.repeatReplace(v => v.replace(/^(1)(0*)\n([2-9])\2$/gm, "$3$2\n$1$2").replace(/^(2)(0*)\n([3-9])\2$/gm, "$3$2\n$1$2").replace(/^(3)(0*)\n([4-9])\2$/gm, "$3$2\n$1$2").replace(/^(4)(0*)\n([5-9])\2$/gm, "$3$2\n$1$2").replace(/^(5)(0*)\n([6-9])\2$/gm, "$3$2\n$1$2").replace(/^(6)(0*)\n([7-9])\2$/gm, "$3$2\n$1$2").replace(/^(7)(0*)\n([8-9])\2$/gm, "$3$2\n$1$2").replace(/^(8)(0*)\n([9-9])\2$/gm, "$3$2\n$1$2"))
)

.repeatReplace(v => v.replace(/^(\d+?)0(0*?)(0*)\n(\d\3)$/m, "$1$2$4"))

.replace(/\n/g, "")
