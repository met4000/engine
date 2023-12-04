document.body.innerText.split("\n").filter(v => v)
.map(line => line
  .replace(/Card\s*\d+:\s*/, "")
	.split(/\s*\|\s*/).map(v => v.split(/\s+/).map(n => parseInt(n)))
)
.map(([winning_n, have_n]) => [new Set(winning_n), have_n])
.map(([winning_n, have_n]) => have_n.filter(
	n => winning_n.has(n)
))
.map(v => v.length ? 1 << (v.length - 1) : 0)
.reduce((r, v) => r + v)
