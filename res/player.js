const delay = (t, v) => {
  return new Promise((resolve) => setTimeout(resolve, t, v));
};

const move = (cords, gMap, isChangingMap) => {
  window.localStorage.setItem("moveCords", null);
  window.localStorage.setItem(
    "moveCords",
    JSON.stringify({ start: { x: hero.x, y: hero.y }, end: cords })
  );

  window.localStorage.setItem("gMap", JSON.stringify(gMap));
  window.localStorage.setItem("isMoving", "true");
  if (isChangingMap) window.localStorage.setItem("isChangingMap", "true");
};

class QItem {
  constructor(x, y, w) {
    this.y = x;
    this.x = y;
    this.dist = w;
  }
}

const findNextMob = (grid, startX, startY) => {
  const source = new QItem(0, 0, 0);

  const N = grid.length;
  const M = grid[0].length;

  // To keep track of visited QItems. Marking
  // blocked cells as visited.
  const visited = Array.from(Array(N), () => Array(M).fill(0));
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < M; j++) {
      if (grid[i][j] === 1) visited[i][j] = true;
      else visited[i][j] = false;
    }
  }

  // Finding source

  source.y = startY;
  source.x = startX;

  // applying BFS on matrix cells starting from source
  const q = [];
  q.push(source);
  visited[source.y][source.x] = true;
  while (q.length != 0) {
    const p = q[0];
    q.shift();

    // Destination found;
    if (grid[p.y][p.x] === 2) {
      grid[p.y][p.x] = -2;
      return p;
    }

    // moving up
    if (p.y - 1 >= 0 && visited[p.y - 1][p.x] == false) {
      q.push(new QItem(p.y - 1, p.x, p.dist + 1));
      visited[p.y - 1][p.x] = true;
    }

    // moving down
    if (p.y + 1 < N && visited[p.y + 1][p.x] == false) {
      q.push(new QItem(p.y + 1, p.x, p.dist + 1));
      visited[p.y + 1][p.x] = true;
    }

    // moving left
    if (p.x - 1 >= 0 && visited[p.y][p.x - 1] == false) {
      q.push(new QItem(p.y, p.x - 1, p.dist + 1));
      visited[p.y][p.x - 1] = true;
    }

    // moving right
    if (p.x + 1 < M && visited[p.y][p.x + 1] == false) {
      q.push(new QItem(p.y, p.x + 1, p.dist + 1));
      visited[p.y][p.x + 1] = true;
    }
  }

  return null;
};
