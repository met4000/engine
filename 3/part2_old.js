(() => {
  let input = document.body.innerText;

  let lineLength = input.indexOf("\n");
  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    if (/[\d\.\n]/.test(input[i])) continue;

    let numberIndices = new Set();
    let product = 1;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let offset_i = i + dx + dy * (lineLength + 1);
        if (offset_i === i) continue;

        if (!/\d/.test(input[offset_i])) continue;

        while (/\d/.test(input[offset_i - 1])) offset_i--;
        if (numberIndices.has(offset_i)) continue;
        numberIndices.add(offset_i);

        let num = parseInt(input.slice(
          offset_i,
          offset_i + input.slice(offset_i).search(/[^\d]/)
        ));
        product *= num;
      }
    }

    if (numberIndices.size !== 2) continue;
    sum += product;
  }

  return sum;
})()
