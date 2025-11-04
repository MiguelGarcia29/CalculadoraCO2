// ===================================
// 1. ESTADO INICIAL Y DATOS
// ===================================

let total = 0;
const maxTotal = 400; // Define el total máximo para la barra de progreso
let values = {
  botella: { botellaVidrio: 0, botellaPlastico: 0, Carton: 0 },
  coche: { cocheIndividual: 0, cocheBus: 0, moto: 0, camion: 0 },
  rayo: { rayo: 0 },
  contenedor: { contenedor: 0 }
};

// ===================================
// 2. COEFICIENTES DE CONVERSIÓN
// ===================================

const CONVERSION_FACTORS = {
  // CO2 (ej. kg de CO2 por cada unidad de item)
  botellaPlastico_to_CO2: 2.1,
  botellaVidrio_to_CO2: 0.7,
  Carton_to_CO2: 0.8,
  cocheIndividual_to_CO2: 0.2,
  cocheBus_to_CO2: 0.05,
  moto_to_CO2: 0.15,
  camion_to_CO2: 0.5,
  rayo_to_CO2: 0.4,
  contenedor_to_CO2: 0.5,

  // Otras conversiones basadas en CO2
  CO2_to_ARBOLES: 1 / 0.057, // Árboles-día por kg CO₂
  CO2_to_COCHES: 1 / 12.6,   // Coches-día por kg CO₂

  // Agua
  botellaPlastico_to_AGUA: 1.5,
  botellaVidrio_to_AGUA: 1,
  Carton_to_AGUA: 2,

  AGUA_to_DUCHAS: 1 / 80,
  AGUA_to_CAMISETAS: 1 / 2700
};

// ===================================
// 3. LÓGICA DE MENÚS Y NAVEGACIÓN
// ===================================

function clearActiveIcons() {
  document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('active'));
}

function showSubmenu(groupId, el) {
  const targetSubmenu = document.getElementById(groupId);
  const isVisible = targetSubmenu.style.display === "block";

  document.querySelectorAll('.submenu-container').forEach(s => s.style.display = "none");
  document.querySelectorAll('.slider-container').forEach(s => s.style.display = "none");
  clearActiveIcons();

  if (!isVisible) {
    targetSubmenu.style.display = "block";
    el.classList.add('active');
  }
}

function toggleSlider(id, el) {
  const targetSlider = document.getElementById(id);
  const isVisible = targetSlider.style.display === "block";

  document.querySelectorAll('.submenu-container').forEach(s => s.style.display = "none");
  document.querySelectorAll('.slider-container').forEach(s => s.style.display = "none");
  clearActiveIcons();

  if (!isVisible) {
    targetSlider.style.display = "block";
    el.classList.add('active');
  }
}

function openSliderBelowMenu(sliderId, el) {
  const targetSlider = document.getElementById(sliderId);
  const isVisible = targetSlider.style.display === "block";
  const parentGroup = el.dataset.group;
  const parentIcon = document.querySelector(`.icon[data-group="${parentGroup}"][onclick*="showSubmenu"]`);

  document.querySelectorAll('.slider-container').forEach(slider => {
    if (slider.id !== sliderId) slider.style.display = "none";
  });

  el.closest('.submenu-container').querySelectorAll('.icon').forEach(icon => {
    if (icon !== el) icon.classList.remove('active');
  });

  if (parentIcon) parentIcon.classList.add('active');

  if (isVisible) {
    targetSlider.style.display = "none";
    el.classList.remove('active');
  } else {
    targetSlider.style.display = "block";
    el.classList.add('active');
  }
}

// ===================================
// 4. FUNCIONES DE DATOS Y CÁLCULO
// ===================================

function updateValue(id, range) {
  document.getElementById(id + "Value").textContent = range.value;
}

function acceptValue(id, group) {
  const value = parseInt(document.getElementById(id + "Value").textContent, 10);
  if (isNaN(value)) return;
  values[group][id] = value;

  updateList();
  updateTotal();
  updateVisualResults();
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
        updateVisualResults();
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

// ===================================
// 5. RESET Y RESULTADOS VISUALES
// ===================================

function resetAll() {
  // Reiniciar valores internos
  for (let group in values) {
    for (let key in values[group]) {
      values[group][key] = 0;
    }
  }
  total = 0;

  // Actualizar lista, totales y resultados
  updateList();
  updateTotal();
  updateVisualResults();

  // Reiniciar todos los sliders y los textos de valor
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.value = 0;
  });
  document.querySelectorAll('[id$="Value"]').forEach(span => {
    span.textContent = "0";
  });

  // Reiniciar los valores del panel izquierdo
  document.getElementById("impact_co2Kg").textContent = "0";
  document.getElementById("impact_arboles").textContent = "0";
  document.getElementById("impact_coches").textContent = "0";
  document.getElementById("impact_agua").textContent = "0";
  document.getElementById("impact_duchas").textContent = "0";
  document.getElementById("impact_camisetas").textContent = "0";

  // Cerrar menús y quitar estados activos
  document.querySelectorAll('.icon').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.slider-container, .submenu-container').forEach(s => s.style.display = "none");

  // Ocultar el botón de reset
  const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  if (total > 0) {
    resetBtn.style.display = "block";
    resetBtn.style.marginTop = "10px";
  } else {
    resetBtn.style.display = "none";
  }
}

}


function updateVisualResults() {
  let totalKgCo2Evitado = 0;
  let totalLitrosAguaAhorrada = 0;

  // CO₂
  totalKgCo2Evitado += values.botella.botellaPlastico * CONVERSION_FACTORS.botellaPlastico_to_CO2;
  totalKgCo2Evitado += values.botella.botellaVidrio * CONVERSION_FACTORS.botellaVidrio_to_CO2;
  totalKgCo2Evitado += values.botella.Carton * CONVERSION_FACTORS.Carton_to_CO2;
  totalKgCo2Evitado += values.coche.cocheIndividual * CONVERSION_FACTORS.cocheIndividual_to_CO2;
  totalKgCo2Evitado += values.coche.cocheBus * CONVERSION_FACTORS.cocheBus_to_CO2;
  totalKgCo2Evitado += values.coche.moto * CONVERSION_FACTORS.moto_to_CO2;
  totalKgCo2Evitado += values.coche.camion * CONVERSION_FACTORS.camion_to_CO2;
  totalKgCo2Evitado += values.rayo.rayo * CONVERSION_FACTORS.rayo_to_CO2;
  totalKgCo2Evitado += values.contenedor.contenedor * CONVERSION_FACTORS.contenedor_to_CO2;

  // Agua
  totalLitrosAguaAhorrada += values.botella.botellaPlastico * CONVERSION_FACTORS.botellaPlastico_to_AGUA;
  totalLitrosAguaAhorrada += values.botella.botellaVidrio * CONVERSION_FACTORS.botellaVidrio_to_AGUA;
  totalLitrosAguaAhorrada += values.botella.Carton * CONVERSION_FACTORS.Carton_to_AGUA;

  // Evitar negativos
  totalKgCo2Evitado = Math.max(0, totalKgCo2Evitado);
  totalLitrosAguaAhorrada = Math.max(0, totalLitrosAguaAhorrada);

  // Conversión a equivalencias
  const numArboles = totalKgCo2Evitado * CONVERSION_FACTORS.CO2_to_ARBOLES;
  const numCoches = totalKgCo2Evitado * CONVERSION_FACTORS.CO2_to_COCHES;
  const numDuchas = totalLitrosAguaAhorrada * CONVERSION_FACTORS.AGUA_to_DUCHAS;
  const numCamisetas = totalLitrosAguaAhorrada * CONVERSION_FACTORS.AGUA_to_CAMISETAS;

  // Actualizar HTML (panel izquierdo)
  document.getElementById('impact_co2Kg').textContent = totalKgCo2Evitado.toFixed(1);
  document.getElementById('impact_arboles').textContent = numArboles.toFixed(1);
  document.getElementById('impact_coches').textContent = numCoches.toFixed(2);
  document.getElementById('impact_agua').textContent = totalLitrosAguaAhorrada.toFixed(1);
  document.getElementById('impact_duchas').textContent = numDuchas.toFixed(1);
  document.getElementById('impact_camisetas').textContent = numCamisetas.toFixed(1);
}
