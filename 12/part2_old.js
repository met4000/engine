// brute force 2, electric boogaloo

(() => {
  const OPERATIONAL = ".", DAMAGED = "#", UNKNOWN = "?";
  const N_UNFOLD = 5;

  let lines = document.body.innerText.replace(/\n$/, "").split("\n").map(v => {
    let [conditions, damagedGroups] = v.split(" ");
    conditions = conditions.split("");
    damagedGroups = damagedGroups.split(",").map(v => parseInt(v));

    let unfoldedConditions = conditions, unfoldedDamagedGroups = damagedGroups;
    for (let i = 0; i < N_UNFOLD - 1; i++) {
      unfoldedConditions = unfoldedConditions.concat(UNKNOWN, conditions);
      unfoldedDamagedGroups = unfoldedDamagedGroups.concat(damagedGroups);
    }

    return { conditions: unfoldedConditions, damagedGroups: unfoldedDamagedGroups };
  });

  let cache = {};
  function computeNumArrangements(conditions, damagedGroups, currentGroupLength = 0) {
    // conditions list has ended - either succeed or fail
    if (!conditions.length) {
      // no remaining groups, and no current groups - successful
      if (!damagedGroups.length && !currentGroupLength) return 1;

      // too many damaged groups remaining
      if (damagedGroups.length > 1) return 0;

      // current group and the last remaining group don't match
      if (damagedGroups[0] !== currentGroupLength) return 0;

      return 1;
    }

    // check cache
    let key = `${currentGroupLength};${conditions.join("")};${damagedGroups.join(",")}`;
    if (cache[key] !== undefined) return cache[key];

    let returnValue = undefined;
    switch (conditions[0]) {
      case OPERATIONAL:
        if (!currentGroupLength) {
          let nOperational = 1;
          while (conditions[nOperational] === OPERATIONAL) nOperational++;
          returnValue = computeNumArrangements(conditions.slice(nOperational), damagedGroups, 0);
          break;
        }

        // check group is right size
        if (damagedGroups[0] !== currentGroupLength) {
          returnValue = 0;
          break;
        }

        // move onto next group
        returnValue = computeNumArrangements(conditions.slice(1), damagedGroups.slice(1), 0);
        break;
      
      case DAMAGED:
        // no groups left
        if (!damagedGroups.length) {
          returnValue = 0;
          break;
        }

        // group too long
        if (currentGroupLength >= damagedGroups[0]) {
          returnValue = 0;
          break;
        }

        // make the current group longer
        let nDamaged = 1;
        while (conditions[nDamaged] === DAMAGED) nDamaged++;
        returnValue = computeNumArrangements(conditions.slice(nDamaged), damagedGroups, currentGroupLength + nDamaged);
        break;
      
      case UNKNOWN:
        let nArrangements = 0;
        nArrangements += computeNumArrangements([OPERATIONAL].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
        nArrangements += computeNumArrangements([DAMAGED].concat(conditions.slice(1)), damagedGroups, currentGroupLength);
        returnValue = nArrangements;
        break;
    }

    if (returnValue === undefined) throw new Error("condition not handled");

    cache[key] = returnValue;
    return returnValue;
  }

  let totalArrangements = 0;
  for (let line of lines) {
    let nArrangements = computeNumArrangements(line.conditions, line.damagedGroups, 0);
    console.log(nArrangements);
    totalArrangements += nArrangements;
  }

  return totalArrangements;
})();
