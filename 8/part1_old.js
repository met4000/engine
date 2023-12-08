(() => {
  let [instructions, network] = document.body.innerText.split("\n\n");

  let networkMap = Object.fromEntries(network.split("\n").filter(v => v).map(v => {
    let [node, lNode, rNode] = /(\w+)\s*=\s*\((\w+),\s*(\w+)\)/g.exec(v).slice(1);
    return [node, { L: lNode, R: rNode }];
  }));

  let currentNode = "AAA", targetNode = "ZZZ";
  let nSteps = 0;

  for (; currentNode !== targetNode; nSteps++) {
    let currentInstruction = instructions[nSteps % instructions.length];
    currentNode = networkMap[currentNode][currentInstruction];
  }

  return nSteps;
})();
