(() => {
  const MIRROR_NEG = "/", MIRROR_POS = "\\", SPLITTER_HORIZONTAL = "-", SPLITTER_VERTICAL = "|", EMPTY = ".";
  const MIRROR = [MIRROR_NEG, MIRROR_POS], SPLITTER = [SPLITTER_HORIZONTAL, SPLITTER_VERTICAL];
  const HORIZONTAL = "horizontal", VERTICAL = "vertical";

  let grid = document.body.innerText.replace(/\n$/, "").split("\n").map(v => v.split(""));
  let hasBeam = grid.map(v => v.map(() => ({ [HORIZONTAL]: false, [VERTICAL]: false })));
  
  const eq = (a, b) => a.x === b.x && a.y === b.y && a.dx === b.dx && a.dy === b.dy;
  const add = (a, b) => ({
    x: (a.x ?? 0) + (a.dx ?? 0) + (b.x ?? 0) + (b.dx ?? 0),
    y: (a.y ?? 0) + (a.dy ?? 0) + (b.y ?? 0) + (b.dy ?? 0)
  });
  const inv = a => ({ dx: -a.dx, dy: -a.dy });
  const flip = a => ({ dx: a.dy, dy: a.dx });
  const isInBounds = a => a.x >= 0 && a.x < grid[0].length && a.y >= 0 && a.y < grid.length;

  // assumes unit and up/down/left/right direction
  const beamDirection = dir => dir.dx === 0 ? VERTICAL : HORIZONTAL;

  /**
   * @param {{ x: number, y: number }} currentCoords 
   * @param {{ dx: number, dy: number }} currentDirection 
   */
  function traverse(currentCoords, currentDirection) {
    let newTileCoords = add(currentCoords, currentDirection);
    if (!isInBounds(newTileCoords)) return;

    let newTile = grid[newTileCoords.y][newTileCoords.x];
    if (SPLITTER.includes(newTile)) {
      let beamDir = beamDirection(currentDirection);
      if ((newTile === SPLITTER_HORIZONTAL) !== (beamDir === HORIZONTAL)) {
        let hasBeamObj = hasBeam[newTileCoords.y][newTileCoords.x];
        if (hasBeamObj[HORIZONTAL] || hasBeamObj[VERTICAL]) return;
        hasBeamObj[HORIZONTAL] = true;
        hasBeamObj[VERTICAL] = true;

        let newDirection = flip(currentDirection);
        traverse(newTileCoords, newDirection);
        traverse(newTileCoords, inv(newDirection));
        return;
      }
    }

    // for mirrors, horizontal => dx > 0 or respective vertical direction, vertical => dx < 0 or respective
    let beamDir, newDirection;
    if (MIRROR.includes(newTile)) {
      let pos = newTile === MIRROR_POS;
      newDirection = flip(currentDirection);
      if (!pos) newDirection = inv(newDirection);

      beamDir = currentDirection.dx - newDirection.dx > 0 ? HORIZONTAL : VERTICAL;
    } else {
      newDirection = currentDirection;
      beamDir = beamDirection(currentDirection);
    }

    if (hasBeam[newTileCoords.y][newTileCoords.x][beamDir]) return;
    hasBeam[newTileCoords.y][newTileCoords.x][beamDir] = true;

    traverse(newTileCoords, newDirection);
  }

  let highest = 0, startingCoords = { x: -1, y: 0 }, startingDirection = { dx: 1, dy: 0 };
  do {
    hasBeam = grid.map(v => v.map(() => ({ [HORIZONTAL]: false, [VERTICAL]: false })));
    traverse(startingCoords, startingDirection);
    let nEnergised = hasBeam.reduce((r, v) => r + v.reduce((r, v) => r + (v[HORIZONTAL] || v[VERTICAL]), 0), 0);
    if (nEnergised > highest) highest = nEnergised;

    startingCoords = add(startingCoords, { dx: -startingDirection.dy, dy: startingDirection.dx });
    let nextTile = add(startingCoords, startingDirection);
    if (!isInBounds(nextTile)) {
      startingCoords = nextTile;
      startingDirection = { dx: startingDirection.dy, dy: -startingDirection.dx };
    }
  } while (!eq(startingCoords, { x: -1, y: 0 }));
  return highest;
})();
