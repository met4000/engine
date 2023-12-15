(() => {
  const OP_SET = "=", OP_REMOVE = "-";

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

  /** @type {{ label: String, focalLength: number }[][]} */
  let boxes = Array.from({ length: 256 }).map(() => []);

  for (let str of sequence) {
    let [_, label, operation, focalLength] = new RegExp(`(\\w+)([${OP_SET}${OP_REMOVE}])(\\d+)?`).exec(str);
    let hash = hash_1a(label);
    
    switch (operation) {
      case OP_SET:
        let lens = boxes[hash].find(v => v.label === label);
        if (lens !== undefined) { lens.focalLength = focalLength; break; }

        lens = { label, focalLength };
        boxes[hash].push(lens);
        break;
      
      case OP_REMOVE:
        boxes[hash] = boxes[hash].filter(v => v.label !== label);
        break;
      
      default:
        throw new Error(`unknown operation '${operation}'`);
    }
  }

  //return Object.fromEntries(boxes.map((v, i) => [i, v]).filter(([i, v]) => v.length));

  let sum = 0;
  for (let box_n = 1; box_n <= boxes.length; box_n++) {
    let box = boxes[box_n - 1];
    for (let lens_n = 1; lens_n <= box.length; lens_n++) {
      let lens = box[lens_n - 1];
      let power = box_n * lens_n * lens.focalLength;
      sum += power;
    }
  }
  return sum;
})();
