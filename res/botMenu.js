let mode = localStorage.getItem("bMode");

const style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
.bMenu { 
    background: #18122B; 
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1000;
    width: 300px;
    padding: 1.25rem 0.75rem;
    top: 75px;
    left: 25px;
    opacity: 1;
    containment: "window";
    font-family: Calibri;
} 

.bMenu button .bMenu input .bMenu label {
  font-family: inherit
}

#bIndicator {
  margin: 0.5rem 0 0.5rem;
  font-weight: 500;
  font-size: 1.75rem;
}

#dragHeader {
  containment: "window";
  height: 30px;
  background: #393053;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bOptions {
  margin: 1rem 0 0;
}

.bFormGroup {
    margin: 0.35rem 0;
    display: flex;
    flex-direction: column;
}

.bFormGroup label {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
}

.bMenu.disabled .bOptions, .bMenu.disabled .bModeSettings{
    opacity: 0.5;
    pointer-events: none;
}

.bOptions.exp #e2, .bOptions.exp #heros, .bOptions.e2 #heros, .bOptions.e2 #exp, .bOptions.heros #e2, .bOptions.heros #exp {
  display: none;
}

.bOptions.exp #exp, .bOptions.e2 #e2, .bOptions.heros #heros  {
  display: flex!important;
  flex-direction: column!important;
  height: 100%;
}

.bModeSettings {
    display: flex;
    justify-content: stretch;
    width: 100%;
    margin-bottom: 1rem;
}

.bModeSettings button {
    width: 100%;
    border: none;
    font-weight: bold;
    font-size: 0.8rem;
    padding: 0.3rem;
    font-color: #18122B;
}

.bModeSettings button.selected {
    background: #635985;
}


`;
document.getElementsByTagName("head")[0].appendChild(style);

const crateFormGroup = (labelText, defaultValue, inputId) => {
  const group = document.createElement("div");
  group.className = "bFormGroup";

  const input = document.createElement("input");
  input.type = "text";
  input.defaultValue = defaultValue;
  input.id = inputId;

  const label = document.createElement("label");
  label.innerText = labelText;

  group.appendChild(label);
  group.appendChild(input);

  return group;
};

const createFormSwitch = (labelText, defaultValue, id, clickHandler) => {
  const switchGroup = document.createElement("div");
  switchGroup.className = "bSwitchGroup";

  const input = document.createElement("input");
  input.type = "checkbox";

  input.checked = defaultValue === "true" ? true : false;
  input.id = id;

  input.addEventListener("click", () => {
    localStorage.setItem(id, input.checked);
    if (clickHandler) clickHandler();
  });

  const label = document.createElement("label");
  label.innerText = labelText;

  switchGroup.appendChild(label);
  switchGroup.appendChild(input);

  return switchGroup;
};

const createModeSettingsTab = () => {
  const tab = document.createElement("div");
  tab.className = "bModeSettings";

  const expButton = document.createElement("button");
  const e2Button = document.createElement("button");
  // const herosButton = document.createElement("button");

  if (mode === "exp") {
    expButton.className = "selected";
  } else if (mode === "e2") {
    e2Button.className = "selected";
  }
  // else if (mode === "heros") {
  //   herosButton.className = "selected";
  // }
  expButton.addEventListener("click", () => changeMode(`exp`));
  e2Button.addEventListener("click", () => changeMode(`e2`));
  // herosButton.addEventListener("click", () => changeMode(`heros`));

  expButton.id = "exp";
  e2Button.id = "e2";
  // herosButton.id = "heros";

  expButton.innerText = "Tryb Exp";
  e2Button.innerText = "Tryb E2";
  // herosButton.innerText = "heros";

  tab.appendChild(expButton);
  tab.appendChild(e2Button);
  // tab.appendChild(herosButton);
  return tab;
};

const changeMode = (bMode) => {
  const oldButton = document.getElementById(mode);
  if (oldButton) oldButton.className = "";

  mode = bMode;
  localStorage.setItem("bMode", bMode);

  const botOptions = document.getElementById("bOptions");
  botOptions.className = `bOptions ${bMode}`;

  const button = document.getElementById(bMode);
  button.className = "selected";
};

const keepInBounds = (element) => {
  const BORDER = 150;

  if (element.style.left.slice(0, -2) < -BORDER * 1.5) {
    element.style.left = -BORDER * 1.5 + 1 + "px";
  }
  if (element.style.top.slice(0, -2) < -BORDER + 80) {
    element.style.top = -BORDER + 80 + 1 + "px";
  }

  if (
    element.style.left.slice(0, -2) >
    window.innerWidth - element.offsetWidth + BORDER * 1.5
  ) {
    element.style.left =
      window.innerWidth - element.offsetWidth + BORDER * 1.5 - 1 + "px";
  }

  if (
    element.style.top.slice(0, -2) >
    BORDER * 2 + window.innerHeight - element.offsetHeight
  ) {
    element.style.top =
      BORDER * 2 + window.innerHeight - element.offsetHeight - 1 + "px";
  }
};

const initMenu = () => {
  const botMenu = document.createElement("div");
  botMenu.className = "bMenu";
  botMenu.id = "bMenu";

  const dragHeader = document.createElement("div");
  const dragText = document.createElement("h5");
  dragText.innerHTML = "Przesuń mnie";
  dragHeader.id = "dragHeader";
  dragHeader.appendChild(dragText);
  botMenu.appendChild(dragHeader);

  const runningText = document.createElement("div");
  runningText.innerHTML = `Bot jest ${running ? "aktywny" : "wstrzymany"}`;
  runningText.id = "bIndicator";

  botMenu.appendChild(runningText);

  const botModeSettingsTab = createModeSettingsTab();

  const universalOptions = createUniversalSettings();

  const expOptions = createExpOptions();
  const e2Options = createE2Options();

  botMenu.appendChild(botModeSettingsTab);
  botMenu.appendChild(universalOptions);
  // switch here

  const modeSwitch = document.createElement("div");
  modeSwitch.className = `bOptions ${mode}`;
  modeSwitch.id = `bOptions`;
  modeSwitch.appendChild(expOptions);
  modeSwitch.appendChild(e2Options);

  botMenu.appendChild(modeSwitch);

  // add the newly created element and its content into the DOM
  const currentDiv = document.querySelector("div1");
  document.body.insertBefore(botMenu, currentDiv);

  const top = window.localStorage.getItem("bMenuPosTop");
  const left = window.localStorage.getItem("bMenuPosLeft");

  botMenu.style.top = top || "0";
  botMenu.style.left = left || "0";

  dragElement(botMenu);
};

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;

const dragMouseDown = (e) => {
  e = e || window.event;
  e.preventDefault();
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag.bind();
};

const elementDrag = (e) => {
  const element = document.getElementById("bMenu");

  e = e || window.event;
  e.preventDefault();
  // calculate the new cursor position:
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;
  // set the element's new position:

  element.style.top = element.offsetTop - pos2 + "px";
  element.style.left = element.offsetLeft - pos1 + "px";

  keepInBounds(element);

  localStorage.setItem("bMenuPosTop", element.style.top);
  localStorage.setItem("bMenuPosLeft", element.style.left);
};

const closeDragElement = () => {
  // stop moving when mouse button is released:
  document.onmouseup = null;
  document.onmousemove = null;
};

const dragElement = (element) => {
  if (document.getElementById("dragHeader")) {
    // if present, the header is where you move the DIV from:
    document.getElementById("dragHeader").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    element.onmousedown = dragMouseDown.bind();
    element.draggable({ containment: "window" });
  }
};

const createUniversalSettings = () => {
  const healSwitch = createFormSwitch(
    "Auto leczenie",
    localStorage.getItem("isAutoheal"),
    "isAutoheal"
  );

  const fillArrowsSwitch = createFormSwitch(
    "Uzupełnianie strzałek",
    localStorage.getItem("isAutoFillArrows"),
    "isAutoFillArrows"
  );

  const warnNoPotionsOrArrowsSwitch = createFormSwitch(
    "Zatrzymaj, gdy zabkranie potek lub strzał",
    localStorage.getItem("warnNoPotionsOrArrows"),
    "warnNoPotionsOrArrows"
  );

  const wrapper = document.createElement("div");
  wrapper.id = "universalOptions";

  wrapper.appendChild(healSwitch);
  wrapper.appendChild(fillArrowsSwitch);
  wrapper.appendChild(warnNoPotionsOrArrowsSwitch);

  return wrapper;
};

const createExpOptions = () => {
  const gData = JSON.parse(window.localStorage.getItem("g"));

  const mobNamesInputGroup = crateFormGroup(
    "Moby do bicia (nazwa moba;...)",
    gData ? gData.userMobs : "",
    "mobNames"
  );
  const ignoredGroupsInputGroup = crateFormGroup(
    "Ignorowane grupy (mapa/id;...)",
    gData ? gData.ignoredGroups : "",
    "ignoredGroups"
  );
  const mapsInputGroup = crateFormGroup(
    "Mapy do expienia (mapa;...)",
    gData ? gData.userExpMaps : "",
    "maps"
  );
  const accessMapsInputGroup = crateFormGroup(
    "Mapy dojścia na exp (aktualna mapa;mapa;...)",
    gData ? gData.userAccessExpMaps : "",
    "accessMaps"
  );

  const ignoreGroupsSwitch = createFormSwitch(
    "Ignoruj niektóre grupy",
    localStorage.getItem("ignoreGroups"),
    "ignoreGroups",
    () => {
      if (localStorage.getItem("ignoreGroups") === "false") {
        ignoredGroupsInputGroup.style.display = "none";
      } else {
        ignoredGroupsInputGroup.style.display = "flex";
      }
    }
  );

  if (localStorage.getItem("ignoreGroups") === "false") {
    ignoredGroupsInputGroup.style.display = "none";
  } else {
    ignoredGroupsInputGroup.style.display = "flex";
  }

  const bOptions = document.createElement("div");
  bOptions.className = "exp";
  bOptions.id = "exp";

  bOptions.appendChild(ignoreGroupsSwitch);
  bOptions.appendChild(ignoredGroupsInputGroup);
  bOptions.appendChild(mobNamesInputGroup);
  bOptions.appendChild(mapsInputGroup);
  bOptions.appendChild(accessMapsInputGroup);

  return bOptions;
};

const createE2Options = () => {
  const bOptions = document.createElement("div");
  bOptions.className = "e2";
  bOptions.id = "e2";

  const e2NameInputGroup = crateFormGroup(
    "E2 do bicia (nazwa moba;)",
    gData ? gData.e2Name : "",
    "e2Name"
  );

  const waitTimeInputGroup = crateFormGroup(
    "Czas po wykryciu do bicia (min;max)",
    gData ? gData.e2WaitTime : "",
    "e2WaitTime"
  );

  bOptions.appendChild(e2NameInputGroup);
  bOptions.appendChild(waitTimeInputGroup);

  return bOptions;
};
