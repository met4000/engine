(() => {
  const EMPTY_SPACE = ".", EXPANSION_AMOUNT = 1000000 - 1;

  let grid = document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split(""));

  // find galaxy coords
  let galaxies = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== EMPTY_SPACE) {
        galaxies.push({ x, y });
      }
    }
  }


  // expand by modifying the galaxy coords

  galaxies = galaxies.map(v => ({ ...v, expanded_x: v.x, expanded_y: v.y }));

  // rows
  for (let y = 0; y < grid.length; y++) {
    if (grid[y].every(v => v === EMPTY_SPACE)) {
      for (let galaxy of galaxies) {
        if (galaxy.y < y) continue;
        galaxy.expanded_y += EXPANSION_AMOUNT;
      }
    }
  }

  // columns
  columnExpansionLoop:
  for (let x = 0; x < grid[0].length; x++) {
    // check if everything is empty
    for (let y = 0; y < grid.length; y++) {
      if (grid[y][x] !== EMPTY_SPACE) {
        continue columnExpansionLoop;
      }
    }

    for (let galaxy of galaxies) {
      if (galaxy.x < x) continue;
      galaxy.expanded_x += EXPANSION_AMOUNT;
    }
  }

  galaxies = galaxies.map(v => ({ x: v.expanded_x, y: v.expanded_y }));

  // calculate distances
  let offsets = galaxies.map((v, i) => galaxies.slice(i + 1).map(_v => ({
    dx: Math.abs(v.x - _v.x),
    dy: Math.abs(v.y - _v.y)
  })));
  return offsets.reduce((r, v) => r + v.reduce((r, v) => r + (v.dx + v.dy), 0), 0);
})();
