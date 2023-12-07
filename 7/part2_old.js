document.body.innerText.split("\n").filter(v => v).map(v => v.split(" ")).sort((_a, _b) => {
  let a = { hand: _a[0], type: 2 }, b = { hand: _b[0], type: 2 };

  for (let obj of [a, b]) {
    let sortedHand = obj.hand.split("").sort().filter(v => v !== "J").join("");
    if (/(.)\1{4}/.test(sortedHand)) obj.type = 10; // 5
    else if (/(.)\1{3}/.test(sortedHand)) obj.type = 8; // 4
    else if (/(.)\1{2}(.)\2|(.)\3(.)\4{2}/.test(sortedHand)) obj.type = 7; // 3 + 2
    else if (/(.)\1{2}/.test(sortedHand)) obj.type = 6; // 3
    else if (/(.)\1.?(.)\2/.test(sortedHand)) obj.type = 5; // 2 + 2
    else if (/(.)\1/.test(sortedHand)) obj.type = 4; // 2

    let nJokers = (obj.hand.match(/J/g) ?? []).length;
    obj.type = Math.min(obj.type + 2 * nJokers, 10);
  }

  if (a.type != b.type) return a.type - b.type;

  // same type; check order

  let [aMapped, bMapped] = [a, b].map(v => v.hand.split("").map(v => ({
    "A": 14,
    "K": 13,
    "Q": 12,
    "J": 1,
    "T": 10,
  }[v] ?? parseInt(v))));
  while (aMapped.length && bMapped.length) {
    let cmp = aMapped.shift() - bMapped.shift();
    if (cmp === 0) continue;
    return cmp;
  }

  return 0;
}).reduce((r, v, i) => r + parseInt(v[1]) * (i + 1), 0);
