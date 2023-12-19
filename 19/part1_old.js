(() => {
  let [workflowStrs, partStrs] = document.body.innerText.replace(/\n$/, "").split("\n\n").map(v => v.split("\n"));

  /** @type {{ [name: string]: (({ type: "OPERATOR", op: "<" | ">", prop: "x" | "m" | "a" | "s", value: number } | { type: "DEFAULT" }) & { destination: string })[] } }} */
  let workflows = {};
  for (let workflowStr of workflowStrs) {
    /** @type {string[]} */
    let [, name, rulesStrs] = /^(\w+){(.+)}$/.exec(workflowStr);
    let rules = rulesStrs.split(",").map(rulesStr => {
      let matchResult = /([xmas])([<>])(\d+):(\w+)/.exec(rulesStr);
      if (!matchResult) return { type: "DEFAULT", destination: rulesStr };
      let [, prop, op, value, destination] = matchResult;
      return { type: "OPERATOR", op, prop, value: parseInt(value), destination };
    });

    workflows[name] = rules;
  }

  let parts = partStrs.map(partStr => {
    let [x, m, a, s] = /^{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}$/.exec(partStr).slice(1).map(n => parseInt(n));
    return { x, m, a, s };
  });

  let acceptedParts = parts.filter(part => {
    let currentWorkflow = "in";
    while (true) {
      ruleLoop:
      for (let rule of workflows[currentWorkflow]) {
        switch (rule.type) {
          case "OPERATOR":
            let partValue = part[rule.prop];
            
            /** @type {(a: number, b: number) => boolean} */
            let comparison;
            switch (rule.op) {
              case "<":
                comparison = (a, b) => a < b;
                break;
              
              case ">":
                comparison = (a, b) => a > b;
                break;
              
              default:
                throw new Error(`unknown rule operator type '${rule.op}'`);
            }

            if (comparison(partValue, rule.value)) {
              currentWorkflow = rule.destination;
              break ruleLoop;
            }
            break;

          case "DEFAULT":
            currentWorkflow = rule.destination;
            break ruleLoop;

          default:
            throw new Error(`unknown rule type '${rule.type}'`);
        }
      }

      if (currentWorkflow === "A") return true;
      if (currentWorkflow === "R") return false;
    }
  });

  return acceptedParts.reduce((r, part) => r + part.x + part.m + part.a + part.s, 0);
})();
