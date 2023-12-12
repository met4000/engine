// brute force 2, electric boogaloo

(() => {
  const OPERATIONAL = ".", DAMAGED = "#", UNKNOWN = "?";

  let lines = document.body.innerText.replace(/\n$/, "").split("\n").map(v => {
    let [conditions, damagedGroups] = v.split(" ");
    conditions = conditions.split("");
    damagedGroups = damagedGroups.split(",").map(v => parseInt(v));

    // unfold (x5 => add 4 more)
    for (let i = 0; i < 4; i++) {
      conditions = conditions.concat(UNKNOWN, conditions);
      damagedGroups = damagedGroups.concat(damagedGroups);
    }

    return { conditions, damagedGroups };
  });

  function computeNumArrangements(conditions, damagedGroups, currentGroupLength = 0) {
    // conditions list has ended - either succeed or fail
    if (!conditions.length) {
      // no remaining groups, and no current groups - successful
      if (!damagedGroups.length && !currentGroupLength) return 1;

      // too many damaged groups remaining
      if (damagedGroups.length > 1) return 0;

      // current group and the last remaining group match - successful
      if (damagedGroups[0] === currentGroupLength) return 1;

      return 0;
    }

    switch (conditions[0]) {
      case OPERATIONAL:
        if (!currentGroupLength) return computeNumArrangements(conditions.slice(1), damagedGroups, 0);

        // check group is right size
        if (damagedGroups[0] !== currentGroupLength) return 0;

        // move onto next group
        return computeNumArrangements(conditions.slice(1), damagedGroups.slice(1), 0);
      
      case DAMAGED:
        // no groups left
        if (!damagedGroups.length) return 0;

        // group too long
        if (currentGroupLength >= damagedGroups[0]) return 0;

        // make the current group longer
        return computeNumArrangements(conditions.slice(1), damagedGroups, currentGroupLength + 1);
      
      case UNKNOWN:
        let nArrangements = 0;
        nArrangements += computeNumArrangements([OPERATIONAL].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
        nArrangements += computeNumArrangements([DAMAGED].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
        return nArrangements;
    }

    throw new Error("condition not handled");
  }

  let totalArrangements = 0;
  for (let line of lines) {
    let nArrangements = computeNumArrangements(line.conditions, line.damagedGroups, 0);
    console.log(nArrangements);
    totalArrangements += nArrangements;
  }

  return totalArrangements;
})();
