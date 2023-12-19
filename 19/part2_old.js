(() => {
  const PART_PROPERTIES = ["x", "m", "a", "s"], MIN_PROP_VALUE = 1, MAX_PROP_VALUE = 4000, START_WORKFLOW = "in";

  let [workflowStrs,] = document.body.innerText.replace(/\n$/, "").split("\n\n").map(v => v.split("\n"));

  /** @type {{ [name: string]: (({ type: "OPERATOR", op: "<" | ">", prop: "x" | "m" | "a" | "s", value: number } | { type: "DEFAULT" }) & { destination: string })[] } }} */
  let workflows = {};
  for (let workflowStr of workflowStrs) {
    /** @type {string[]} */
    let [, name, rulesStrs] = /^(\w+){(.+)}$/.exec(workflowStr);
    let rules = rulesStrs.split(",").map(rulesStr => {
      let matchResult = /([xmas])([<>])(\d+):(\w+)/.exec(rulesStr); // should use PART_PROPERTIES
      if (!matchResult) return { type: "DEFAULT", destination: rulesStr };
      let [, prop, op, value, destination] = matchResult;
      return { type: "OPERATOR", op, prop, value: parseInt(value), destination };
    });

    workflows[name] = rules;
  }

  /**
   * 
   * @param {string} workflowName 
   * @param {number} workflowRule 
   * @param {{ [prop: string]: { min: number, max: number } }} values 
   * @returns {number}
   */
  function f(workflowName, workflowRule, values) {
    if (workflowName === "R") return 0;
    if (workflowName === "A") {
      let nAccepted = 1;
      for (let prop of PART_PROPERTIES) nAccepted *= values[prop].max - values[prop].min + 1;
      return nAccepted;
    }

    let nAccepted = 0;

    let rule = workflows[workflowName][workflowRule];
    switch (rule.type) {
      case "OPERATOR":
        let validRange = { ...values[rule.prop] }, invalidRange = { min: 0, max: -1 };
        switch (rule.op) {
          case "<":
            if (rule.value <= validRange.max) {
              validRange.max = rule.value - 1;
              invalidRange = { min: rule.value, max: values[rule.prop].max };
            }
            break;
            
          case ">":
            if (rule.value >= validRange.min) {
              validRange.min = rule.value + 1;
              invalidRange = { min: values[rule.prop].min, max: rule.value };
            }
            break;
          
          default:
            throw new Error(`unknown rule operator type '${rule.op}'`);
        }

        if (validRange.min <= validRange.max) {
          nAccepted += f(rule.destination, 0, { ...values, [rule.prop]: validRange });
        }

        if (invalidRange.min <= invalidRange.max) {
          nAccepted += f(workflowName, workflowRule + 1, { ...values, [rule.prop]: invalidRange });
        }

        break;

      case "DEFAULT":
        nAccepted += f(rule.destination, 0, values);
        break;

      default:
        throw new Error(`unknown rule type '${rule.type}'`);
    }

    return nAccepted;
  }

  return f(
    START_WORKFLOW,
    0,
    Object.fromEntries(PART_PROPERTIES.map(prop => [prop, { min: MIN_PROP_VALUE, max: MAX_PROP_VALUE }]))
  );
})();
