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

  let startingDirection = lastDirection;

  // continue until we get back to the start
  let steps = 1, corners = {};
  traversingLoop:
  while (charAt(currentCoords) !== startSymbol) {
    for (let tileDirection of pipeDirections[charAt(currentCoords)]) {
      if (eq(lastDirection, inv(tileDirection))) continue; // previous direction
      
      // next direction to travel in
      
      if (!eq(lastDirection, tileDirection)) {
        corners[currentCoords.y] = (corners[currentCoords.y] ?? []).concat(currentCoords.x);
      }

      currentCoords = add(currentCoords, tileDirection);
      lastDirection = tileDirection;
      steps++;
      continue traversingLoop;
    }

    throw new Error(`no direction (currentCoords: ${currentCoords}, lastDirection: ${lastDirection})`);
  }

  // check if starting/ending tile is a corner
  if (!eq(lastDirection, startingDirection)) {
    corners[currentCoords.y] = (corners[currentCoords.y] ?? []).concat(currentCoords.x);
  }

  // sort by y and then x
  corners = Object.entries(corners).map(
    ([y, x_arr]) => ({ y: parseInt(y), x_arr: x_arr.sort((a, b) => a - b) })
  ).sort((a, b) =>  a.y - b.y);

  
  // calculate area of entire shape (including edges)
  let area = 0, currentRanges = [], last_y = corners[0].y;
  for (let i = 0; i < corners[0].x_arr.length; i += 2) {
    let start = corners[0].x_arr[i], end = corners[0].x_arr[i + 1];
    currentRanges.push({ start, end });
    area += end - start + 1;
  }
  corners.shift();

  while (corners.length) {
    let { y: current_y, x_arr } = corners.shift();

    // add area for everything between this row and the last row
    let yDiff = current_y - last_y - 1;
    last_y = current_y;
    if (yDiff > 0) {
      for (let range of currentRanges) {
        area += (range.end - range.start + 1) * yDiff;
      }
    }

    // calculate tiles in current range
    let tiles = new Set();
    for (let range of currentRanges) for (let i = range.start; i <= range.end; i++) tiles.add(i);

    // xor points in the current range with the new points
    let newPoints = new Set(x_arr);
    let currentPoints = currentRanges.flatMap(range => [range.start, range.end]);
    for (let point of currentPoints) {
      if (newPoints.has(point)) newPoints.delete(point);
      else newPoints.add(point);
    }
    newPoints = [...newPoints].sort((a, b) => a - b);

    // calculate ranges from points
    currentRanges = [];
    for (let i = 0; i < newPoints.length; i += 2) {
      let start = newPoints[i], end = newPoints[i + 1];
      currentRanges.push({ start, end });
    }

    // add tiles in new range, and add all tiles to the area
    for (let range of currentRanges) for (let i = range.start; i <= range.end; i++) tiles.add(i);
    area += tiles.size;
  }

  let internalArea = area - steps; // subtract the perimeter
  return internalArea;
})();
