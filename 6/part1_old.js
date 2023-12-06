(() => {
  let [times, distances] = document.body.innerText.split("\n").filter(v => v).map(
    v => v.replace(/^.+?(?=\d)/, "").split(/\s+/).map(v => parseInt(v))
  );

  let races = times.map((_, i) => ({ time: times[i], record: distances[i] }));

  let product = 1;
  for (let race of races) {
    let rangeStart = 0, rangeEnd = race.time;
    while ((race.time - rangeStart) * rangeStart <= race.record) rangeStart++;
    while ((race.time - rangeEnd) * rangeEnd <= race.record) rangeEnd--;

    let nWinningValues = rangeEnd - rangeStart + 1;

    product *= nWinningValues;
  }

  return product;
})();
