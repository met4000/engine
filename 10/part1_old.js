(() => {
  // positive dx: right, positive dy: down
  const pipeDirections = {
    "|": [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }],
    "-": [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }],
    "L": [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }],
    "J": [{ dx: 0, dy: -1 }, { dx: -1, dy: 0 }],
    "7": [{ dx: 0, dy: 1 }, { dx: -1, dy: 0 }],
    "F": [{ dx: 0, dy: 1 }, { dx: 1, dy: 0 }],
  };
  let startSymbol = "S";

  // assume no out-of-bounds calculations
  const eq = (a, b) => a.x === b.x && a.y === b.y && a.dx === b.dx && a.dy === b.dy;
  const add = (a, b) => ({
    x: (a.x ?? 0) + (a.dx ?? 0) + (b.x ?? 0) + (b.dx ?? 0),
    y: (a.y ?? 0) + (a.dy ?? 0) + (b.y ?? 0) + (b.dy ?? 0)
  });
  const inv = a => ({ dx: -a.dx, dy: -a.dy });

  let grid = document.body.innerText.split("\n").filter(v => v).map(v => v.split(""));
  const charAt = a => grid[a.y][a.x];

  let startCoords = { x: 0, y: 0 };
  startCoordFind:
  for (let y in grid) {
    for (let x in grid[y]) {
      let char = grid[y][x];
      if (char === startSymbol) {
        startCoords = { x: parseInt(x), y: parseInt(y) };
        break startCoordFind;
      }
    }
  }

  let currentCoords = { ...startCoords }, lastDirection = { dx: 0, dy: 0 };
  // guaranteed to only have 2 paths; follow the first one we find
  startDirectionFind:
  for (let direction of [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 }
  ]) {
    let coords = add(currentCoords, direction);

    if (coords.x < 0 || coords.x >= grid[0].length) continue;
    if (coords.y < 0 || coords.y >= grid.length) continue;

    for (let tileDirection of pipeDirections[charAt(coords)]) {
      if (eq(direction, inv(tileDirection))) {
        // connected to the starting tile
        currentCoords = coords;
        lastDirection = direction;
        break startDirectionFind;
      }
    }
  }

  // continue until we get back to the start
  let steps = 1;
  traversingLoop:
  while (charAt(currentCoords) !== startSymbol) {
    for (let tileDirection of pipeDirections[charAt(currentCoords)]) {
      if (eq(lastDirection, inv(tileDirection))) continue; // previous direction
      
      // next direction to travel in
      
      currentCoords = add(currentCoords, tileDirection);
      lastDirection = tileDirection;
      steps++;
      continue traversingLoop;
    }

    throw new Error(`no direction (currentCoords: ${currentCoords}, lastDirection: ${lastDirection})`);
  }

  return Math.floor(steps / 2);
})();
