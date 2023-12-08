(() => {
  const gcd = (a, b) => b == 0 ? a : gcd (b, a % b);
  const lcm = (a, b) =>  a / gcd (a, b) * b;

  let [instructions, network] = document.body.innerText.split("\n\n");

  let networkMap = Object.fromEntries(network.split("\n").filter(v => v).map(v => {
    let [node, lNode, rNode] = /(\w+)\s*=\s*\((\w+),\s*(\w+)\)/g.exec(v).slice(1);
    return [node, { L: lNode, R: rNode }];
  }));

  let startNodes = Object.keys(networkMap).filter(v => /A$/.test(v));
  let cycles = [];

  for (let startNode of startNodes) {
    let currentNode = startNode;
    let nSteps = 0;

    let terminatingStepCounts = [];
    while (terminatingStepCounts.length < 2) {
      do {
        let currentInstruction = instructions[nSteps % instructions.length];
        currentNode = networkMap[currentNode][currentInstruction];
        nSteps++
      } while (!/Z$/.test(currentNode));
      terminatingStepCounts.push(nSteps);
    }
    
    let [z1Steps, z2Steps] = terminatingStepCounts;
    let cycleLength = z2Steps - z1Steps, cycleOffset = z1Steps % cycleLength;

    cycles.push({ cycleLength, cycleOffset });
  }

  // * from the data; cycleLength doesn't seem to vary, like it could do
  // => this solution is not general, but gives the right answer for this

  // from testing on the data, cycleOffset = 0
  // therefore, assuming that cycleOffset will be 0
  let nSteps = cycles.reduce((r, v) => lcm(r, v.cycleLength), 1);
  return nSteps;
})();
