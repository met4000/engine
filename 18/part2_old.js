(() => {
  const DEBUG = false;

  const numberToDirection = n => ["R", "D", "L", "U"][n];

  const directions = {
    "L": { dx: -1 },
    "R": { dx: 1 },
    "U": { dy: -1 },
    "D": { dy: 1 },
  };

  const add = (a, b) => ({
    x: (a.x ?? 0) + (a.dx ?? 0) + (b.x ?? 0) + (b.dx ?? 0),
    y: (a.y ?? 0) + (a.dy ?? 0) + (b.y ?? 0) + (b.dy ?? 0)
  });
  const mult = (a, n) => ["x", "y", "dx", "dy"].reduce((r, v) => (v in r && (r[v] *= n), r), { ...a });

  let instructions = document.body.innerText.replace(/\n$/, "").split("\n")
  .map(v => /^(\w) (\d+) \((#[0-9a-f]+)\)$/.exec(v))
  .map(([,,, colour]) => ({ direction: numberToDirection(colour[6]), distance: parseInt(colour.slice(1, 6), 16) }));

  /** map of y, to arrays of x @type {{ [y: number]: number[] }} */
  let corners = {};

  let currentCoords = { x: 0, y: 0 }, lastDirection = instructions[instructions.length - 1].direction;
  for (let { direction, distance } of instructions) {
    if (lastDirection !== direction) {
      corners[currentCoords.y] = (corners[currentCoords.y] ?? []).concat(currentCoords.x);
    }

    let delta = mult(directions[direction], distance);
    currentCoords = add(currentCoords, delta);

    lastDirection = direction;
  }

  // sort by y and then x
  let cornersArr = Object.entries(corners).map(
    ([y, x_arr]) => ({ y: parseInt(y), x_arr: new Set(x_arr.sort((a, b) => a - b)) })
  ).sort((a, b) =>  a.y - b.y);

  // print dig plan
  if (DEBUG) {
    let str = "";
    let min_x = cornersArr.map(({ x_arr }) => [...x_arr][0]).reduce((r, v) => v < r ? v : r, Infinity);
    let max_x = cornersArr.map(({ x_arr }) => [...x_arr][x_arr.size - 1]).reduce((r, v) => v > r ? v : r, -Infinity);
    let _prev_y = cornersArr[0].y;
    for (let { y, x_arr } of cornersArr) {
      let nRowsSincePrev = y - _prev_y - 1;
      if (nRowsSincePrev > 0) str += `${".".repeat(max_x - min_x + 1)}\n`.repeat(nRowsSincePrev);

      for (let x = min_x; x <= max_x; x++) str += x_arr.has(x) ? "!" : ".";

      str += "\n";
      _prev_y = y;
    }
    console.log(str);
  }

  // find the area
  let area = 0;
  /** @type {Set<number>} */
  let currentEdges = new Set();
  let prev_y = cornersArr[0].y;
  for (let { y, x_arr } of cornersArr) {
    let nRowsSincePrev = y - prev_y - 1; // excluding the current and the previous row
    if (nRowsSincePrev > 0) {
      // add area for skipped rows
      
      let skippedSliceArea = 0;
      let prev_x = [...currentEdges][0], interior = false;
      for (let x of currentEdges) {
        if (interior) skippedSliceArea += x - prev_x + 1;
        interior = !interior;
        prev_x = x;
      }
      if (interior) throw new Error("odd number of edges");

      let skippedArea = skippedSliceArea * nRowsSincePrev;
      area += skippedArea;
    }

    let sliceArea = 0;
    /** @type {Set<number>} */
    let newEdges = new Set();
    let x_values = [...new Set([...x_arr, ...currentEdges])].sort((a, b) => a - b); // sorted and de-duped
    let prev_x = x_values[0], interior = false;
    for (let x = x_values.shift(); x !== undefined; x = x_values.shift()) {
      if (interior) sliceArea += x - prev_x - 1; // not including the current value; added later
      interior = !interior;

      let isCorner = x_arr.has(x), wasEdge = currentEdges.has(x);

      if (!isCorner && wasEdge) {
        // continuing edge
        newEdges.add(x);
        sliceArea += 1;

        prev_x = x;
        continue;
      }

      // otherwise: corner of some kind
      // get the paired corner
      let next_x = x_values.shift();

      if (next_x === undefined) throw new Error("missing corner pair (no more corners)");
      if (!x_arr.has(next_x)) throw new Error("missing corner pair (found edge instead of corner)");
      
      // add edges
      let nextWasEdge = currentEdges.has(next_x);
      if (!wasEdge && !nextWasEdge) {
        // new block
        newEdges.add(x);
        newEdges.add(next_x);

        interior = !interior;
      } else if (wasEdge && nextWasEdge) {
        // terminating block
        // no edges to add

        interior = !interior;
      } else {
        // moving edge
        let newEdge = wasEdge ? next_x : x;
        newEdges.add(newEdge);
      }

      sliceArea += next_x - x + 1;

      prev_x = next_x;
    }
    if (interior) throw new Error("odd number of corners/edges");

    area += sliceArea;

    currentEdges = newEdges;
    prev_y = y;
  }

  return area;
})();
