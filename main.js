let userMobs = [];
let ignoredGroups = [];
let userExpMaps = [];
let userAccessExpMaps = [];

let e2Name = "";
let e2WaitTime = [];

let stop = window.localStorage.getItem("isRunning") === "true" ? false : true;
let running =
  window.localStorage.getItem("isRunning") === "true" ? true : false;
let gData = JSON.parse(window.localStorage.getItem("g"));

let indexChanged = false;
let alreadyReversed = false;
let nextMapCordsAfterReverse = null;

initMenu();

const mapsInput = document.getElementById("maps");
const ignoredGroupsInput = document.getElementById("ignoredGroups");
const mobNamesInput = document.getElementById("mobNames");
const accessMapsInput = document.getElementById("accessMaps");

const e2NameInput = document.getElementById("e2Name");
const e2WaitTimeInput = document.getElementById("e2WaitTime");

window.addEventListener("keydown", (event) => {
  if (event.key === "x" && !stop) {
    stop = true;
  } else if (event.key === "x" && stop && running !== "false" && !running) {
    stop = false;

    runBot();
  }
});

g.loadQueue.push({
  fun: function () {
    setInterval(() => {
      updateGameData();
    }, 500);

    window.localStorage.setItem("isChangingMap", "false");
    window.localStorage.setItem("isMoving", "false");

    updateGameData();

    if (running)
      delay(500).then(() => {
        runBot();
      });
  },
});

const updateGameData = () => {
  const data = getGameData();
  window.localStorage.setItem("g", JSON.stringify(data));

  gData = JSON.parse(window.localStorage.getItem("g"));
};

const runBot = async () => {
  switchBotState(true);

  userMobs = [...mobNamesInput.value.split(";")];
  userExpMaps = [...mapsInput.value.split(";")];
  userAccessExpMaps = [...accessMapsInput.value.split(";")];
  ignoredGroups = [...ignoredGroupsInput.value.split(";")];
  ignoredGroups = ignoredGroups.map((grp) => grp.split("/"));

  e2Name = e2NameInput.value;
  e2WaitTime = [
    e2WaitTimeInput.value.split(";")[0],
    e2WaitTimeInput.value.split(";")[1],
  ];

  const gNeighbourMaps = [];

  const gMap = initMap(userMobs);

  for (let i in g.townname) {
    const name = g.townname[i].replace(/ +(?= )/g, "");

    let c = g.gwIds[i].split(`.`);
    entr = {
      x: c[0],
      y: c[1],
    };
    gNeighbourMaps.push({ ...entr, name: name });
  }

  if (gData.autoheal === "true") await healIfAbleTo();
  if (gData.autoFillArrows === "true") await equipArrowsIfNeedTo();

  switch (mode) {
    case "exp":
      if (!userAccessExpMaps[0]) exp(gNeighbourMaps);
      else {
        if (
          userExpMaps.includes(map.name) ||
          userExpMaps.includes(map.name + " ") ||
          userExpMaps.includes(" " + map.name)
        ) {
          exp(gNeighbourMaps);
        } else {
          // dojście na expowisko

          await new Promise((resolve) =>
            goToNextMap(gNeighbourMaps, userAccessExpMaps, gMap, resolve)
          );
        }
      }
      break;

    case "e2":
      e2();
      break;

    case "heros":
      break;
  }

  if (stop) switchBotState(false);
};

const e2 = async () => {
  const gMap = initMap(userMobs);

  if (stop) {
    switchBotState(false);
    return;
  }

  resetMap(gMap);

  const noE2 = await attackNextMob();

  await delay(1500).then(() => {
    e2();
  });
};

const exp = async (gNeighbourMaps) => {
  while (true) {
    const gMap = initMap(userMobs);

    if (stop) {
      switchBotState(false);
      break;
    }

    resetMap(gMap);
    const noMobsLeft = await attackNextMob();

    if (noMobsLeft)
      await new Promise((resolve) =>
        goToNextMap(gNeighbourMaps, userExpMaps, gMap, resolve)
      );
  }
};

const goToNextMap = async (gNeighbourMaps, userMapList, gMap, resolve) => {
  if (stop === true) {
    resolve();
    return;
  }

  if (window.localStorage.getItem("isMoving") === "true") {
    delay(500).then(() =>
      goToNextMap(gNeighbourMaps, userMapList, gMap, resolve)
    );
    return;
  }

  if (alreadyReversed) {
    move(nextMapCordsAfterReverse, gMap);
    delay(500).then(() =>
      goToNextMap(gNeighbourMaps, userMapList, gMap, resolve)
    );
    return;
  }

  let mapList =
    window.localStorage.getItem("reverse") === "true"
      ? userMapList.reverse()
      : userMapList;

  const nextMapCords = { x: null, y: null };
  if (
    !mapList.includes(map.name) &&
    !mapList.includes(map.name + " ") &&
    !mapList.includes(" " + map.name)
  ) {
    console.log("Nie jesteś na mapie z listy!");
    stop = true;
    switchBotState(false);
    return;
  }

  if (mapList.length == 1 && mapList[0] === map.name) {
    console.log("Koniec mobków");
    stop = true;
    switchBotState(false);
    return;
  }

  let currentMapIndex = parseInt(
    window.localStorage.getItem("currentMapIndex")
  );

  let isChangingMap = window.localStorage.getItem("isChangingMap");

  if (isChangingMap === "true") {
    const currentNextMapCords = JSON.parse(
      window.localStorage.getItem("moveCords")
    ).end;
    move(currentNextMapCords, gMap, true);
    delay(500).then(() =>
      goToNextMap(gNeighbourMaps, userMapList, gMap, resolve)
    );
    return;
  }

  if (
    currentMapIndex === undefined ||
    mapList[currentMapIndex] === undefined ||
    mapList[currentMapIndex].trim() !== map.name
  ) {
    mapList.forEach((userMap, i) => {
      if (userMap.trim() === map.name) {
        currentMapIndex = i;
        window.localStorage.setItem("currentMapIndex", i);
      }
    });
  }

  if (!mapList[currentMapIndex + 1] && !alreadyReversed) {
    mapList = mapList.reverse();
    window.localStorage.setItem(
      "reverse",
      window.localStorage.getItem("reverse") === "false" ? "true" : "false"
    );
    window.localStorage.setItem("currentMapIndex", 0);
    currentMapIndex = 0;
    alreadyReversed = true;
  }

  const nextMapName = mapList[currentMapIndex + 1].trim();

  if (!indexChanged) {
    window.localStorage.setItem("currentMapIndex", currentMapIndex + 1);
    indexChanged = true;
  }

  gNeighbourMaps.forEach((map) => {
    if (map.name === nextMapName) {
      nextMapCords.x = parseInt(map.x);
      nextMapCords.y = parseInt(map.y);
    }
  });

  if (alreadyReversed) nextMapCordsAfterReverse = nextMapCords;

  move(nextMapCords, gMap, true);

  if (nextMapCords.x === hero.x && nextMapCords.y === hero.y) {
    resolve();
  } else {
    delay(500).then(() =>
      goToNextMap(gNeighbourMaps, userMapList, gMap, resolve)
    );
  }
};

const switchBotState = (botState) => {
  running = botState;
  stop = !botState;
  window.localStorage.setItem("isRunning", running);

  const runningIndicator = document.getElementById("bIndicator");
  const botMenu = document.getElementById("bMenu");

  runningIndicator.innerHTML = `Bot jest ${running ? "aktywny" : "wstrzymany"}`;
  if (running) botMenu.className = `bMenu disabled`;
  else botMenu.className = `bMenu`;
};

const equipArrowsIfNeedTo = () => {
  return new Promise(function (resolve) {
    const playerItems = g.hItems;
    const arrows = [];

    let currentArrows;
    let currentAmmo = 1;
    let currentCapacity = 1;

    for (const [key, item] of Object.entries(g.eqItems)) {
      if (item.cl === 21) {
        const itemStats = item.stat.split(";");

        itemStats.forEach((stat) => {
          [statName, statVal] = stat.split("=");
          if (statName === "ammo") {
            currentAmmo = parseInt(statVal);
          }
          if (statName === "capacity") {
            currentCapacity = parseInt(statVal);
          }
        });
        currentArrows = item;
      }
    }

    for (const [key, item] of Object.entries(playerItems)) {
      if (item.cl === 21) {
        const itemStats = item.stat.split(";");
        let ammo = 1;
        let canEquip = true;

        itemStats.forEach((stat) => {
          [statName, statVal] = stat.split("=");
          if (statName === "ammo") {
            ammo = parseInt(statVal);
          }

          // lvl
          if (statName === "lvl") {
            if (parseInt(statVal) > hero.lvl) {
              canEquip = false;
            }
          }

          // profesja
          if (statName === "reqp") {
            if (hero.prof === "t" && statVal !== "ht") {
              canEquip = false;
            } else if (hero.prof === "h" && statVal !== "h") {
              canEquip = false;
            }
          }
        });

        if (canEquip && currentArrows?.id != item.id) {
          arrows.push({ ...item, ammo: ammo });
        }
      }
    }

    if (currentAmmo < currentCapacity) {
      arrows.forEach((arr) => {
        if (arr.tpl === currentArrows.tpl) {
          _g("moveitem&st=1&id=" + arr.id);
          resolve();
          return;
        }
      });
    }

    if (
      currentAmmo < 50 &&
      arrows.length === 0 &&
      localStorage.getItem("warnNoPotionsOrArrows") === "true"
    ) {
      console.log("Brak strzałek");
      stop = true;
      resolve();
      return;
    }

    if (currentAmmo < 50 && arrows.length !== 0) {
      arrows.forEach((arr) => {
        if (arr.ammo > 50) {
          _g("moveitem&st=1&id=" + arr.id);
          resolve();
          currentAmmo = arr.ammo;
          return;
        }
      });
    }

    if (
      currentAmmo < 50 &&
      localStorage.getItem("warnNoPotionsOrArrows") === "true"
    ) {
      console.log("Brak strzałek");
      stop = true;
      resolve();
      return;
    }

    resolve();
  });
};

const healIfAbleTo = () => {
  return new Promise(async (resolve) => {
    const currentHp = hero.warrior_stats.hp;
    const maxHp = hero.warrior_stats.maxhp;

    const playerItems = g.hItems;
    const healingItems = [];
    const fullHealItems = [];

    for (const [key, item] of Object.entries(playerItems)) {
      const itemStats = item.stat.split(";");
      amount = 1;

      itemStats.forEach((stat) => {
        [statName, statVal] = stat.split("=");
        if (statName === "amount") {
          amount = statVal;
        }

        if (statName === "leczy") {
          for (let i = 0; i < amount; i++) {
            healingItems.push({ ...item, healValue: statVal });
          }
        }

        if (statName === "fullheal") {
          for (let i = 0; i < amount; i++) {
            fullHealItems.push({ ...item, healValue: statVal });
          }
        }
      });
    }

    healingItems.sort((a, b) => a.healValue - b.healValue);

    let toHeal = maxHp - currentHp;
    let i = healingItems.length - 1;

    if (
      healingItems.length === 0 &&
      fullHealItems.length === 0 &&
      localStorage.getItem("warnNoPotionsOrArrows") === "true"
    ) {
      stop = true;
      console.log("Brak potek");
      resolve();
      return;
    }

    while (i != -1) {
      if (toHeal >= healingItems[i].healValue) {
        toHeal -= healingItems[i].healValue;
        // użyj potiona
        _g("moveitem&st=1&id=" + healingItems[i].id);
        await delay(100);
      }

      i--;
    }

    i = 0;
    while (toHeal > 0 && fullHealItems.length > 0 && i < fullHealItems.length) {
      _g("moveitem&st=1&id=" + fullHealItems[i].id);
      i++;
      await delay(100);
    }

    resolve();
  });
};

const usePotion = () => {};

const compareHealValues = (a, b) => {
  if (a.healValue < b.healValue) {
    return -1;
  }
  if (a.healValue > b.healValue) {
    return 1;
  }
  return 0;
};

const attackNextMob = () => {
  const promise = new Promise((resolve) => {
    const initialCords = { x: hero.x, y: hero.y };
    let cords;
    const goPromise = new Promise((resolveGo) => {
      cords = findNextMob(gMap, hero.x, hero.y);
      resetMap(gMap);

      setTimeout(() => resolveGo(), 50);
    });

    goPromise.then(async () => {
      if (cords) {
        if (mode === "e2") {
          min = parseInt(e2WaitTime[0]);
          max = parseInt(e2WaitTime[1]);
          console.log("radom wait");
          await delay(Math.random() * (max - min) + min);
        }

        move(cords, gMap);
        const attackPromise = new Promise(function (resolveAttack) {
          attackMobWhenReady(cords, resolveAttack);
        });

        attackPromise.then(async (interval) => {
          clearInterval(interval);
          if (gData.autoheal === "true") await healIfAbleTo();
          if (gData.autoFillArrows === "true") await equipArrowsIfNeedTo();

          if (mode === "e2") {
            console.log(initialCords);
            move(initialCords, gMap, true);
            await new Promise(() =>
              resolveWhenInPlace(initialCords, resolve, gMap)
            );
            // resolve
          }

          resolve();
        });
      } else {
        resolve(true);
      }
    });
  });

  return promise;
};

const resolveWhenInPlace = (initialCords, resolve, gMap) => {
  const isMoving = window.localStorage.getItem("isMoving");

  if (stop) {
    resolve();
    return;
  }

  if (
    isMoving === "false" &&
    (hero.x !== initialCords.x || hero.y !== initialCords.y)
  ) {
    move(initialCords, gMap, true);
    setTimeout(() => resolveWhenInPlace(initialCords, resolve, gMap), 500); // try again in 300 milliseconds
    return;
  }

  if (
    isMoving === "false" &&
    hero.x === initialCords.x &&
    hero.y === initialCords.y
  ) {
    resolve();
    return;
  } else {
    setTimeout(() => resolveWhenInPlace(initialCords, resolve, gMap), 500); // try again in 300 milliseconds
  }
};

const attackMobWhenReady = (cords, resolve, attackMobAlreadySet) => {
  const isMoving = window.localStorage.getItem("isMoving");

  if (stop) resolve();

  if (isMoving === "false" && !isNear(cords, hero)) {
    resolve();
    return;
  }

  if (isNear(cords, hero) && isMoving === "false") {
    if (!attackMobAlreadySet) window.localStorage.setItem("attackMob", "true");

    if (!running || stop) {
      resolve();
      return;
    }

    if (window.localStorage.getItem("attackMob") === "false") resolve();
    else setTimeout(() => attackMobWhenReady(cords, resolve, true), 50);
  } else {
    setTimeout(() => attackMobWhenReady(cords, resolve), 50); // try again in 300 milliseconds
  }
};

const getRandomWaitValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const isNear = (cordsA, cordsB) => {
  if (stop) return true;

  if (
    cordsA.x - 1 == cordsB.x ||
    cordsA.x + 1 == cordsB.x ||
    cordsA.x == cordsB.x
  ) {
    if (
      cordsA.y - 1 == cordsB.y ||
      cordsA.y + 1 == cordsB.y ||
      cordsA.y == cordsB.y
    ) {
      return true;
    }
  }
  return false;
};
