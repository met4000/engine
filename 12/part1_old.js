// document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split("").reduce((r, v) => r + (v === "?" ? 1 : 0), 0)).reduce((r, v) => r + 2**v, 0)
// returns 7985608 possible total interpretations on the input; i.e. should be brute forceable

// * note: takes a few seconds to execute, but does work fine

(() => {
  const OPERATIONAL = ".", DAMAGED = "#", UNKNOWN = "?";

  let lines = document.body.innerText.replace(/\n$/, "").split("\n").map(v => {
    let [conditions, damagedGroupsStr] = v.split(" ");
    conditions = conditions.split("");
    // damagedGroups = damagedGroups.split(",");
    return { conditions, damagedGroupsStr };
  });

  let totalArrangements = 0;
  for (let line of lines) {
    let nArrangements = 0;

    let nUnknown = line.conditions.filter(v => v === UNKNOWN).length;
    for (let n = 0, unknownPow = 2 ** nUnknown; n < unknownPow; n++) {
      // construct a possible condition
      let possibleCondition = [...line.conditions];
      for (let i = 0, unknown_index = 0; unknown_index < nUnknown && i < possibleCondition.length; i++) {
        if (possibleCondition[i] !== UNKNOWN) continue;

        possibleCondition[i] = n & (1 << unknown_index) ? DAMAGED : OPERATIONAL;
        unknown_index++;
      }

      // test if it satisfies the damaged groups
      let groups = [...possibleCondition.join("").matchAll(/(?:^|\.)(#+)(?=\.|$)/g)];
      let groupsStr = groups.map(v => v[1].length).join(",");
      if (groupsStr !== line.damagedGroupsStr) continue;

      nArrangements++;
    }

    totalArrangements += nArrangements;
  }

  return totalArrangements;
})();
