(() => {
	let input = document.body.innerText;
	let maps = input.split("\n\n").map(v => v
		.replace(/^\n|\n$/g, "")
		.replace(/^.+:\s*/, "")
    .split("\n")
  );
  
  let values = Object.fromEntries(
    maps.shift()[0].split(" ").map(v => [v, parseInt(v)])
  );
  
  for (let map of maps) {
    for (let line of map) {
      let [destinationMin, sourceMin, range] = line.split(" ").map(v => parseInt(v));
      for (let value in values) {
        value = parseInt(value);
        if (value >= sourceMin && value < sourceMin + range) {
          values[value] = destinationMin + value - sourceMin;
        }
      }
    }
    
    values = Object.fromEntries(
      Object.values(values).map(v => [v, v])
    );
  }

	return Object.values(values).reduce((r, v) => r < v ? r : v);
})();
