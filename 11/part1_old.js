(() => {
  const EMPTY_SPACE = ".";

  let grid = document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split(""));

  // expand rows
  grid = grid.flatMap(v => v.every(v => v === EMPTY_SPACE) ? [v, v] : [v]);
  
  // expand columns (by transposing, expanding, then transposing back)
  grid = grid[0].map((_, col_i) => grid.map(row => row[col_i]));
  grid = grid.flatMap(v => v.every(v => v === EMPTY_SPACE) ? [v, v] : [v]);
  grid = grid[0].map((_, col_i) => grid.map(row => row[col_i]));

  // find galaxy coords
  let galaxies = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== EMPTY_SPACE) {
        galaxies.push({ x, y });
      }
    }
  }

  // calculate distances
  let offsets = galaxies.map((v, i) => galaxies.slice(i + 1).map(_v => ({
    dx: Math.abs(v.x - _v.x),
    dy: Math.abs(v.y - _v.y)
  })));
  return offsets.reduce((r, v) => r + v.reduce((r, v) => r + (v.dx + v.dy), 0), 0);
})();
