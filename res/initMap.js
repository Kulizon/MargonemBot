const initMap = (mobs) => {
  updateGameData();
  gMap = [];

  // init empty map with zeros
  for (i = 0; i < map.y; i++) {
    gMap.push([]);
    for (j = 0; j < map.x; j++) {
      gMap[i].push(0);
    }
  }

  x = 0;
  y = 0;

  // collisions
  for (i = 1; i <= map.x * map.y; i++) {
    if (x > map.x - 1) {
      x = 0;
      y++;
    }
    if (map.col.charAt(x + y * map.x) == "1") {
      gMap[y][x] = 1;
    } else {
      gMap[y][x] = 0;
    }
    x++;
  }

  // npc collisions
  gData.npcs.forEach((npc) => {
    if (npc.type !== 4) {
      gMap[npc.y][npc.x] = 1;
    }
  });

  // mobs / e2

  switch (mode) {
    case "exp":
      gData.mobs.forEach((mob) => {
        let isIgnored = false;

        if (localStorage.getItem("ignoreGroups") === "true") {
          ignoredGroups.forEach((grp) => {
            if (grp[0] === map.name && grp[1] === mob.grp.toString()) {
              isIgnored = true;
            }
          });
        }

        if (mobs.includes(mob.nick) && !isIgnored) {
          gMap[mob.y][mob.x] = 2;
        }
      });

      break;

    case "e2":
      gData.mobs.forEach((mob) => {
        // e2 instead of mobs
        if (e2Name == mob.nick) {
          gMap[mob.y][mob.x] = 2;
        }
      });

      break;

    case "heros":
      break;
  }

  return gMap;
};

const resetMap = (arr) => {
  arr.forEach((row, i) => {
    row.forEach((item, j) => {
      if (item == -1) {
        arr[i][j] = 0;
      }
    });
  });
};
