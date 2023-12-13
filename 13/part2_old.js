(() => {
  const N_ERRORS = 1;
  let patterns = document.body.innerText.replace(/\n$/, "").split("\n\n").map(v => v.split("\n").map(v => v.split("")));

  // including smudge check
  function isMirrored(lines) {
    let errors = 0;

    for (let row = 0; row < lines.length / 2; row++) {
      for (let col = 0; col < lines[0].length; col++) {
        if (lines[row][col] === lines[lines.length - 1 - row][col]) continue; // not an error

        errors++;
        if (errors > N_ERRORS) return false; // too many errors
      }
    }

    // MUST have an error
    return errors === N_ERRORS;
  }

  // returns size
  function hasMirrorAnchoredTop(lines) {
    for (let i = 1; i < lines.length; i += 2) {
      if (!isMirrored(lines.slice(0, i + 1))) continue;

      return (i + 1) / 2;
    }

    return -1;
  }

  let summary = 0;
  for (let pattern of patterns) {
    let { nPreceding, horizontal } = (() => {
      let horizontal = true;

      for (let i = 0; i < 2; i++) { // once for horizontal, once for vertical
        let nTop = hasMirrorAnchoredTop(pattern);
        if (nTop > 0) return { nPreceding: nTop, horizontal };
  
        let nBottom = hasMirrorAnchoredTop([...pattern].reverse()); // * vscode doesn't recognise toReversed?
        if (nBottom > 0) return { nPreceding: pattern.length - nBottom, horizontal };
  
        // transpose
        pattern = pattern[0].map((_, col_i) => pattern.map(row => row[col_i]));
        horizontal = !horizontal;
      }

      throw new Error(`no mirror for:\n\n${pattern.map(v => v.join("")).join("\n")}`);
    })();
    
    // console.log({ nPreceding, horizontal });
    summary += (horizontal ? 100 : 1) * nPreceding;
  }

  return summary;
})();
