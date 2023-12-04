(() => {
	let lines = document.body.innerText.split("\n").filter(v => v);
	let cardCounts = {};

	for (let l in lines) {
		l = parseInt(l);
		cardCounts[l] ??= 1;

		let [_, winning_ns, have_ns] = /^Card\s+\d+:\s+(.+)\s+\|\s+(.+)$/.exec(lines[l]);
		winning_ns = new Set(winning_ns.split(/\s+/));
		have_ns = have_ns.split(/\s+/);

		let matches = 0;
		for (let n of have_ns) if (winning_ns.has(n)) matches++;

		// add extra tickets
		for (let i = 0; i < matches; i++) cardCounts[l + i + 1] = (cardCounts[l + i + 1] ?? 1) + cardCounts[l];
	}

	return Object.values(cardCounts).reduce((r, v) => r + v);
})()
