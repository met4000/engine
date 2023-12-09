(() => {
  let sequences = document.body.innerText.split("\n").filter(v => v).map(v => v.split(" ").map(v => parseInt(v)));

  let sum = 0;
  for (let sequence of sequences) {
    let prediction = 0;
    while (!sequence.every(v => v === 0)) {
      prediction += sequence[sequence.length - 1];
      sequence = sequence.flatMap((_, i) => i ? [sequence[i] - sequence[i - 1]] : []);
    }
    sum += prediction;
  }

  return sum;
})();
