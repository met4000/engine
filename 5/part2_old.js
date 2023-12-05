(() => {
  let input = document.body.innerText;
  let maps = input.split("\n\n").map(v => v
    .replace(/^\n|\n$/g, "")
    .replace(/^.+:\s*/, "")
    .split("\n")
  );
  
  let values = [...maps.shift()[0].matchAll(/\d+ \d+/g)].map(
    v => {
      let [start, range] = v[0].split(" ").map(v => parseInt(v));
      return { start, range };
    }
  );
  
  for (let map of maps) {
    let newValues = [];
    
    for (let line of map) {
      let unmappedValues = [];

      let [destinationMin, sourceMin, mapRange] = line.split(" ").map(v => parseInt(v));
      for (let group of values) {
        // find overlap
        let maxStart = Math.max(group.start, sourceMin);
        let minEnd = Math.min(group.start + group.range, sourceMin + mapRange);
        
        if (maxStart >= minEnd) {
          unmappedValues.push(group);
          continue;
        }

        let start = maxStart, range = minEnd - maxStart;
        let mappedStart = start + destinationMin - sourceMin;
        
        // add mapped values
        newValues.push({ start: mappedStart, range });

        // add unmapped values
        if (maxStart - group.start > 0) unmappedValues.push({
          start: group.start,
          range: maxStart - group.start
        });
        if (group.start + group.range - minEnd > 0) unmappedValues.push({
          start: minEnd,
          range: group.start + group.range - minEnd
        });
      }

      values = unmappedValues;
    }
  
    // use identity map for any unmapped values
    newValues = newValues.concat(values);
    newValues.sort((a, b) => a.start - b.start);
    
    values = newValues;
  }

  return values[0].start;
})();
