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

// calculate the calibration value for each line

Object.entries({
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9
}).reduce((r, [num_str, num]) => r.replaceAll(num_str, num_str + num + num_str), document.body.innerText).replace(/(?:^|\n)(?:\D*(\d)[^\n]*(\d)\D*|\D*(\d)\D*)(?:$|\n)/gm, "\n$1$2$3$3").replace(/^\n/, "")

// add the values together

.repeatReplace(v => v.replace(/^(\d+?)([1-9])(0*)$/gm, "$10$3\n$2$3"))

.repeatReplace(v => v.replace(/^(\d{1})\n(\d{2,})$|^(\d{2})\n(\d{3,})$|^(\d{3})\n(\d{4,})$|^(\d{4})\n(\d{5,})$|^(\d{5})\n(\d{6,})$/gm, "$2$4$6$8$10\n$1$3$5$7$9"))

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