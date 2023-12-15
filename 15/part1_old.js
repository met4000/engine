(() => {
  function hash_1a(str) {
    let currentValue = 0;

    for (let char of str) {
      let charCode = char.charCodeAt(0);
      currentValue += charCode;
      currentValue *= 17;
      currentValue %= 256;
    }

    return currentValue;
  }

  let sequence = document.body.innerText.replace(/\n$/, "").split(",");

  let sequenceHashes = sequence.map(v => hash_1a(v));
  let sum = sequenceHashes.reduce((r, v) => r + v, 0);
  return sum;
})();
