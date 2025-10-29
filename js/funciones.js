let total = 0;
const maxTotal = 400;
let values = {
  botella: { botellaVidrio: 0, botellaPlastico: 0, Carton: 0 },
  coche: { cocheIndividual: 0, cocheBus: 0, moto: 0, camion:0 },
  rayo: { rayo: 0 },
  contenedor: { contenedor: 0 }
};

// --- MARCAR ICONO ACTIVO ---
function markActiveIcon(el) {
  document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('active'));
  if (el) el.classList.add('active');
}

function showSubmenu(groupId, el) {
  markActiveIcon(el);
  document.querySelectorAll('.submenu-container').forEach(s => {
    s.style.display = (s.id === groupId ? "block" : "none");
  });
  document.querySelectorAll('.slider-container').forEach(s => s.style.display = "none");
}

function openSlider(sliderId) {
  document.querySelectorAll('.slider-container').forEach(s => {
    s.style.display = (s.id === sliderId ? "block" : "none");
  });
}

function toggleSlider(id, el) {
  markActiveIcon(el);
  document.querySelectorAll('.slider-container').forEach(slider => {
    slider.style.display = (slider.id === id && slider.style.display !== "block") ? "block" : "none";
  });
  document.querySelectorAll('.submenu-container').forEach(s => s.style.display = "none");
}

// --- NUEVA FUNCIÓN: abrir slider debajo del menú sin ocultarlo ---
function openSliderBelowMenu(sliderId, el) {
  markActiveIcon(el);
  document.querySelectorAll('.slider-container').forEach(slider => {
    slider.style.display = (slider.id === sliderId ? "block" : "none");
  });
  // NO ocultar el submenú
}

function updateValue(id, range) {
  document.getElementById(id + "Value").textContent = range.value;
}

function acceptValue(id, group) {
  const value = parseInt(document.getElementById(id + "Value").textContent, 10);
  if (isNaN(value)) return;
  values[group][id] = value;
  updateList();
  updateTotal();
  // No ocultar sliders automáticamente
}

function updateList() {
  const ul = document.getElementById("valuesList");
  ul.innerHTML = "";
  for (let group in values) {
    const keysWithValue = Object.keys(values[group]).filter(k => values[group][k] > 0);
    if (keysWithValue.length === 0) continue;
    const groupLi = document.createElement("li");
    const groupTitle = document.createElement("div");
    groupTitle.textContent = group.charAt(0).toUpperCase() + group.slice(1);
    groupTitle.className = "group-name";
    groupLi.appendChild(groupTitle);
    keysWithValue.forEach(key => {
      const val = values[group][key];
      const itemDiv = document.createElement("div");
      itemDiv.style.display = "flex";
      itemDiv.style.justifyContent = "space-between";
      itemDiv.style.alignItems = "center";
      const span = document.createElement("span");
      span.textContent = `${key}: ${val}`;
      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.className = "delete-btn";
      btn.onclick = () => {
        values[group][key] = 0;
        updateList();
        updateTotal();
      };
      itemDiv.appendChild(span);
      itemDiv.appendChild(btn);
      groupLi.appendChild(itemDiv);
    });
    ul.appendChild(groupLi);
  }
}

function updateTotal() {
  let sum = 0;
  for (let group in values) {
    for (let key in values[group]) sum += values[group][key];
  }
  total = sum;
  document.getElementById("totalValue").textContent = total;
  const progress = Math.min((total / maxTotal) * 100, 100);
  document.getElementById("progressFill").style.width = progress + "%";

  const resetBtn = document.getElementById("resetBtn");
  resetBtn.style.display = total > 0 ? "block" : "none";
}

function resetAll() {
  for (let group in values) {
    for (let key in values[group]) {
      values[group][key] = 0;
    }
  }
  total = 0;
  updateList();
  updateTotal();
  document.querySelectorAll('.icon').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.slider-container, .submenu-container').forEach(s => s.style.display = "none");
}