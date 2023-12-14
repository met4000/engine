(() => {
  const ROUND = "O", CUBE = "#", EMPTY = ".";
  const CYCLE_LIMIT = 10000, CYCLE_TARGET = 1000000000;

  let grid = document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split(""));

  // modifies grid in-place
  function tip({ height, width, get, set }) {
    for (let col = 0; col < width; col++) {
      let lastOccupied = -1;
      for (let row = 0; row < height; row++) {
        if (get(row, col) === EMPTY) continue;

        if (get(row, col) === CUBE) {
          lastOccupied = row;
          continue;
        }

        // cell is round; roll it up
        lastOccupied++;
        set(row, col, EMPTY);
        set(lastOccupied, col, ROUND);
      }
    }
  }

  function tipNorth(grid) {
    tip({
      width: grid[0].length,
      height: grid.length,
      get: (row, col) => grid[row][col],
      set: (row, col, value) => grid[row][col] = value
    });
  }
  
  function tipSouth(grid) {
    tip({
      width: grid[0].length,
      height: grid.length,
      get: (row, col) => grid[grid.length - 1 - row][col],
      set: (row, col, value) => grid[grid.length - 1 - row][col] = value
    });
  }

  function tipEast(grid) {
    tip({
      width: grid.length,
      height: grid[0].length,
      get: (row, col) => grid[col][grid[0].length - 1 - row],
      set: (row, col, value) => grid[col][grid[0].length - 1 - row] = value
    });
  }

  function tipWest(grid) {
    tip({
      width: grid.length,
      height: grid[0].length,
      get: (row, col) => grid[col][row],
      set: (row, col, value) => grid[col][row] = value
    });
  }

  function cycle(grid) {
    tipNorth(grid);
    tipWest(grid);
    tipSouth(grid);
    tipEast(grid);
  }

  function hash(grid) {
    let str = "";
    for (let row = 0; row < grid.length; row++) {
      let streak = 0;
      for (let col = 0; col < grid[0].length; col++) {
        if (grid[row][col] === ROUND) { streak++; continue; }
        if (grid[row][col] === EMPTY) continue;

        str += `${streak},`;
        streak = 0;
      }
      str += `${streak},`;
    }

    return str;
  }

  let prevStates = {}, i = 0, currentHash = "";
  if (!(() => {
    for (; i < CYCLE_LIMIT; i++) {
      cycle(grid);

      currentHash = hash(grid);
      if (currentHash in prevStates) return true;

      prevStates[currentHash] = i;
    }
    return false;
  })()) throw new Error("cycle limit exceeded");

  let oldIndex = prevStates[currentHash];
  let cycleLength = i - oldIndex;
  let nRemaining = (CYCLE_TARGET - i) % cycleLength - 1;

  for (let i = 0; i < nRemaining; i++) cycle(grid);

  let load = [...grid].reverse().reduce((r, v, i) => r + v.filter(cell => cell === ROUND).length * (i + 1), 0);
  return load;
})();
