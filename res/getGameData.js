const getGameData = () => {
  const data = {
    npcs: [],
    mobs: [],
    userMobs: "",
    ignoredGroups: "",
    userExpMaps: "",
    userAccessExpMaps: "",
    autoheal: "",
    autoFillArrows: "",
  };

  g.npc.forEach((val, key) => {
    if (g.npc[key] != null) {
      data.npcs.push(g.npc[key]);
    }
  });

  data.npcs.forEach((npc) => {
    if (npc.type == 2 || npc.type == 3) {
      data.mobs.push(npc);
    }
  });

  data.autoheal = localStorage.getItem("isAutoheal");
  data.autoFillArrows = localStorage.getItem("isAutoFillArrows");
  data.bMode = localStorage.getItem("bMode");

  data.userMobs = mobNamesInput.value;
  data.ignoredGroups = ignoredGroupsInput.value
  data.userExpMaps = mapsInput.value;
  data.userAccessExpMaps = accessMapsInput.value;

  return data;
};
