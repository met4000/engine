(() => {
  const MIN_DURATION = 4, MAX_DURATION = 10;

  const grid = document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split("").map(v => parseInt(v)));
  const gridHeight = grid.length, gridWidth = grid[0].length;

  const get = a => grid[a.y][a.x];
  const eq = (a, b) => a.x === b.x && a.y === b.y && a.dx === b.dx && a.dy === b.dy;
  const add = (a, b) => ({
    x: (a.x ?? 0) + (a.dx ?? 0) + (b.x ?? 0) + (b.dx ?? 0),
    y: (a.y ?? 0) + (a.dy ?? 0) + (b.y ?? 0) + (b.dy ?? 0)
  });
  const isInBounds = a => a.x >= 0 && a.x < gridWidth && a.y >= 0 && a.y < gridHeight;
  
  const DOWN = 0, RIGHT = 1, UP = 2, LEFT = 3;
  const indexMetaFormat = [
    { name: "x", size: gridWidth },
    { name: "y", size: gridHeight },
    { name: "duration", size: MAX_DURATION }, // [0, 1, ...], rather than [1, 2, ...]
    { name: "direction", size: 4 }
  ];

  const metaFromCellIndex = i => {
    let obj = {}, div = 1, mod = 1;
    for (let { name, size } of indexMetaFormat) {
      mod *= size;
      obj[name] = Math.floor((i % mod) / div),
      div = mod;
    }
    return obj;
  };

  const indexFromCellMeta = obj => {
    let n = 0, multiplier = 1;
    for (let { name, size } of indexMetaFormat) {
      n += obj[name] * multiplier;
      multiplier *= size;
    }
    return n;
  };

  // dijkstra's, with 12 cells per grid cell (encoding direction and distance)
  const nVertices = indexMetaFormat.reduce((r, v) => r * v.size, 1);
  const distance = new Array(nVertices).fill(Infinity);
  const prev = new Array(nVertices).fill(undefined);
  const unvisited = new Set(distance.map((_, i) => i));

  const START_COORDS = { x: 0, y: 0 }, END_COORDS = { x: gridWidth - 1, y: gridHeight - 1 };

  for (let duration = 0; duration < MAX_DURATION; duration++) {
    for (let direction = 0; direction < 4; direction++) {
      let cellIndex = indexFromCellMeta({ ...START_COORDS, duration, direction });
      distance[cellIndex] = 0;
      unvisited.delete(cellIndex);
    }
  }

  let rightStartCellCoords = add(START_COORDS, { dx: 1 });
  let rightStartCell = indexFromCellMeta({ ...rightStartCellCoords, duration: 0, direction: RIGHT });
  distance[rightStartCell] = get(rightStartCellCoords);

  let downStartCellCoords = add(START_COORDS, { dy: 1 });
  let downStartCell = indexFromCellMeta({ ...downStartCellCoords, duration: 0, direction: DOWN });
  distance[downStartCell] = get(downStartCellCoords);

  let nextLog = unvisited.size, loopStart = Date.now();
  const LOG_EVERY = 1000;

  let endCellIndex = undefined;
  while (unvisited.size) {
    if (unvisited.size <= nextLog) {
      nextLog -= LOG_EVERY;
      let loopDurationMillis = Date.now() - loopStart;
      let loopWork = nVertices - unvisited.size;
      let loopRemainingDurationMillis = unvisited.size / loopWork * loopDurationMillis;
      let loopEnd = new Date(Date.now() + loopRemainingDurationMillis);
      console.log(unvisited.size, "est:", loopEnd);
    }

    let nextCellIndex = [...unvisited].reduce((r, v) => distance[v] < distance[r] ? v : r);
    unvisited.delete(nextCellIndex);
    
    let nextCellMeta = metaFromCellIndex(nextCellIndex);
    if (eq(nextCellMeta, END_COORDS) && nextCellMeta.duration >= MIN_DURATION - 1) {
      endCellIndex = nextCellIndex;
      break;
    }

    // remove higher duration versions
    if (nextCellMeta.duration >= MIN_DURATION - 1) {
      for (let duration = nextCellMeta.duration + 1; duration < MAX_DURATION; duration++) {
        unvisited.delete(indexFromCellMeta({ ...nextCellMeta, duration }));
      }
    }

    let adjacentCells = [];

    // can only turn after min duration
    if (nextCellMeta.duration >= MIN_DURATION - 1) {
      adjacentCells = adjacentCells.concat([
        {
          // turn left
          ...nextCellMeta,
          duration: 0,
          direction: (nextCellMeta.direction + 1) % 4
        }, {
          // turn right
          ...nextCellMeta,
          duration: 0,
          direction: (nextCellMeta.direction + 3) % 4
        },
      ]);
    }

    // can only go straight before max duration
    if (nextCellMeta.duration + 1 < MAX_DURATION) {
      adjacentCells = adjacentCells.concat([
        {
          // straight
          ...nextCellMeta,
          duration: nextCellMeta.duration + 1
        }
      ]);
    }

    // update the coords to move in the given direction
    adjacentCells = adjacentCells.map(cellMeta => {
      let cellCoords = add(cellMeta, {
        [UP]: { dy: -1 },
        [DOWN]: { dy: 1 },
        [LEFT]: { dx: -1 },
        [RIGHT]: { dx: 1 }
      }[cellMeta.direction]);
      return { ...cellMeta, ...cellCoords };
    });

    // cannot go out of bounds
    adjacentCells = adjacentCells.filter(cellMeta => isInBounds(cellMeta));

    // include index
    adjacentCells = adjacentCells.map(cellMeta => ({ cellIndex: indexFromCellMeta(cellMeta), cellMeta }));

    // ignore already visited cells
    adjacentCells = adjacentCells.filter(({ cellIndex }) => unvisited.has(cellIndex));
    
    // update nearby cells
    for (let { cellIndex, cellMeta } of adjacentCells) {
      let newPathDistance = distance[nextCellIndex] + get(cellMeta);
      if (newPathDistance < distance[cellIndex]) {
        distance[cellIndex] = newPathDistance;
        prev[cellIndex] = nextCellIndex;
      }
    }
  }

  if (endCellIndex === undefined) throw new Error("no path found");

  // * print the path on the grid
  // for (let cellIndex = endCellIndex; cellIndex !== undefined; cellIndex = prev[cellIndex]) {
  //   let cellMeta = metaFromCellIndex(cellIndex);
  //   grid[cellMeta.y][cellMeta.x] = {
  //     [LEFT]: "<",
  //     [RIGHT]: ">",
  //     [UP]: "^",
  //     [DOWN]: "V",
  //   }[cellMeta.direction];
  // }
  // console.log(grid.map(v => v.join("")).join("\n"));

  return distance[endCellIndex];
})();
