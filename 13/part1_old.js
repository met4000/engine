(() => {
  let patterns = document.body.innerText.replace(/\n$/, "").split("\n\n").map(v => v.split("\n").map(v => v.split("")));

  let summary = 0;
  mainPatternLoop:
  for (let pattern of patterns) {
    let nLines = -1, horizontal = true;

    for (let direction = 0; direction < 2; direction++) { // run twice, transposing in-between
      let height = pattern.length;

      // find horizontal mirrors
      for (let i = 0; i < height; i++) {
        if (height % 2 !== i % 2) continue; // mirror has to be in-between lines, not on a line

        let downMirrorSize = (height - i) / 2; // each half is this big
        let downHasMirror = (() => {
          for (let di = 0; di < downMirrorSize; di++) if (pattern[height - di - 1].join("") !== pattern[i + di].join("")) return false;
          return true;
        })();

        if (downHasMirror) {
          nLines = i + downMirrorSize;
          break;
        }

        let upMirrorSize = (i + 1) / 2; // each half is this big
        let upHasMirror = (() => {
          for (let di = 0; di < upMirrorSize; di++) if (pattern[di].join("") !== pattern[i - di].join("")) return false;
          return true;
        })();

        if (upHasMirror) {
          nLines = upMirrorSize;
          break;
        }
      }

      if (nLines > -1) {
        // console.log(nLines, horizontal ? "h" : "v");
        summary += (horizontal ? 100 : 1) * nLines;
        continue mainPatternLoop;
      }

      // transpose
      pattern = pattern[0].map((_, col_i) => pattern.map(row => row[col_i]));
      horizontal = !horizontal;
    }

    throw new Error(`no mirror for:\n\n${pattern.map(v => v.join("")).join("\n")}`);
  }

  return summary;
})();
