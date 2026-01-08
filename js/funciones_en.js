// ===================================
// 1. CONSTANTES Y ESTADO GLOBAL
// ===================================

// Estado del modo: false = Consumo (Gastar), true = Reciclar
let estadoBoton = false;

// COEFICIENTES
const COEFFICIENTS = {
  // Coeficientes de emisión (kg CO₂ por unidad/km)
  co2: {
    botellaVidrio: 0.35,
    botellaPlastico: 0.09,
    Carton: 0.18,
    cocheIndividual: 0.19,
    cocheBus: 0.08,
    moto: 0.09,
    camion: 1.2,
    rayo: 0.35, // kg CO2 / Wh
    aireAcondicionado: 0.8,
    calefaccion: 0.8,
    movil: 0.002,
    ordenador: 0.05,
    pollo: 0.72,
    cerdo: 1.62,
    vaca: 0.72,
    fruta: 0.048,
    vegetal: 0.09,
  },
  // Coeficientes de ahorro (kg CO2 ahorrado por unidad reciclada)
  co2_reciclar: {
    botellaVidrioRec: -0.15,
    botellaPlasticoRec: -0.04,
    CartonRec: -0.04,
  },
  // Coeficientes de impacto en agua (litros de agua por unidad/acción)
  agua: {
    botellaVidrio: 0.005,
    botellaPlastico: 0.001,
    Carton: 0.0005,

  }
};

// Objeto global para almacenar todos los valores aceptados.
let values = {
  'botella': {},
  'coche': {},
  'energia': {},
  'contenedor': {},
  'dispositivos': {},
  'comida': {}
};

// Mapeo de IDs a nombres legibles en español.
const nameMapping = {
  // Envases (Consumo)
  'botellaVidrio': 'Glass Bottles (Units)',
  'botellaPlastico': 'Plastic Bottles (Units)',
  'Carton': 'Cardboard Packaging (Units)',
  // Transporte
  'cocheIndividual': 'Car (KM)',
  'cocheBus': 'Bus (KM)',
  'moto': 'Motorbike (KM)',
  // Energía
  'rayo': 'Electricity Consumption (H)',
  'aireAcondicionado': 'Air Conditioning (H)',
  'calefaccion': 'Heating (H)',
  // Reciclaje
  'botellaVidrioRec': 'Glass (Recycled)',
  'botellaPlasticoRec': 'Plastic (Recycled)',
  'CartonRec': 'Cardboard (Recycled)',
  //Dispositivo
  'movil': 'Mobile Phone (H)',
  'ordenador': 'Computer (H)',
  //Carnes y comida
  'pollo': 'Chicken Fillets (Units)',
  'cerdo': 'Pork Chops (Units)',
  'vaca': 'Beef Steak (Units)',
  'vegetal': 'Vegetable Servings (Units)',
  'fruta': 'Pieces of Fruit (Units)'
};



// ===================================
// 2. LÓGICA DE MODO (RECICLAR/CONSUMO)
// ===================================

const modeToggle = document.getElementById("modeToggle");

// Inicializamos según el checkbox (si existe, para evitar errores si el script carga antes)
if (modeToggle) {
  estadoBoton = !!modeToggle.checked;
  applyModeState(estadoBoton);

  modeToggle.onclick = (event) => {
    estadoBoton = !!event.target.checked;
    applyModeState(estadoBoton);
  };
}

function applyModeState(recycle) {
  const modeLabel = document.getElementById('modeLabel');
  if (modeLabel) modeLabel.textContent = recycle ? '♻️ Recycle Mode' : '🔥 Consumption Mode';
  updateVisibleIcons();
}

function updateVisibleIcons() {
  const iconsEnvases = document.querySelectorAll('img[data-group="Envases"]');
  const iconsTransporte = document.querySelectorAll('img[data-group="Transporte"]');
  const iconsLuz = document.querySelectorAll('img[data-group="rayo"]');
  const iconsBasura = document.querySelectorAll('img[data-group="contenedor"]');
  const iconPlato = document.querySelectorAll('img[data-group="alimentacion"]');
  const iconDispositivo = document.querySelectorAll('img[data-group="dispositivos"]');

  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

  if (!estadoBoton) {
    // Modo Consumo
    iconsEnvases.forEach(i => i.style.display = "inline-block");
    iconsTransporte.forEach(i => i.style.display = "inline-block");
    iconsLuz.forEach(i => i.style.display = "inline-block");
    iconPlato.forEach(i => i.style.display = "inline-block");
    iconDispositivo.forEach(i => i.style.display = "inline-block");
    iconsBasura.forEach(i => i.style.display = "none");
  } else {
    // Modo Reciclar
    iconsEnvases.forEach(i => i.style.display = "none");
    iconsTransporte.forEach(i => i.style.display = "none");
    iconsLuz.forEach(i => i.style.display = "none");
    iconPlato.forEach(i => i.style.display = "none");
    iconDispositivo.forEach(i => i.style.display = "none");
    iconsBasura.forEach(i => i.style.display = "inline-block");
  }
}


// ===================================
// 3. LÓGICA DE MENÚS Y SLIDERS
// ===================================

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

function toggleSlider(id, el) {
  markActiveIcon(el);
  document.querySelectorAll('.slider-container').forEach(slider => {
    slider.style.display = (slider.id === id && slider.style.display !== "block") ? "block" : "none";
  });
  document.querySelectorAll('.submenu-container').forEach(s => s.style.display = "none");
}

function openSliderBelowMenu(sliderId, el) {
  markActiveIcon(el);
  document.querySelectorAll('.slider-container').forEach(slider => {
    slider.style.display = (slider.id === sliderId ? "block" : "none");
  });
}

function updateValue(id, range) {
  const span = document.getElementById(id + "Value");
  if (span) span.textContent = range.value;
}


// ===================================
// 4. LÓGICA DE VALORES ACEPTADOS
// ===================================


function acceptValue(id, group) {
  const span = document.getElementById(id + "Value");
  if (!span) {
    console.error("❌ ERROR: No se encuentra el elemento con ID: " + id + "Value");
    return;
  }

  const value = Number(span.textContent);
  console.log(`🔍 DEBUG: Aceptando valor. Grupo: ${group}, ID: ${id}, Valor: ${value}`);

  if (!Number.isFinite(value) || value <= 0) {
    console.warn("⚠️ Valor no válido o 0, no se añade.");
    return;
  }

  // Asegurar que el grupo existe en values
  if (!values[group]) values[group] = {};

  values[group][id] = value;

  updateList();
  updateTotal();

  // Ocultar slider
  const sliderContainer = document.getElementById(id);
  if (sliderContainer) sliderContainer.style.display = 'none';
  document.querySelectorAll('.icon').forEach(i => i.classList.remove("active"));
}

/**
 * 💡 Acepta los valores de Energía (MODIFICADO)
 * Separa Luz/TV del Aire/Calefacción para aplicar coeficientes distintos.
 */
function acceptEnergiaValues() {
  const horasLuz = Number(document.getElementById('horasLuzValue').textContent) || 0;
  const horasTV = Number(document.getElementById('horasTVValue').textContent) || 0;
  const horasAC = Number(document.getElementById('horasACValue').textContent) || 0;
  const horasCal = Number(document.getElementById('horasCalefaccionValue').textContent) || 0;

  console.log(`🔍 DEBUG Energía: Luz=${horasLuz}, TV=${horasTV}, AC=${horasAC}, Calef=${horasCal}`);

  const placas = document.getElementById('placasSolares').checked;
  // Factor solar: si hay placas, reducimos el consumo al 20% (multiplicamos por 0.2)
  const factorSolar = placas ? 0.2 : 1;

  // 1. GRUPO LUZ Y TV (Usan el coeficiente antiguo 'rayo')
  let horasRayo = (horasLuz + horasTV) * factorSolar;

  if (horasRayo > 0) {
    values['energia']['rayo'] = horasRayo;
  } else {
    delete values['energia']['rayo'];
  }

  // 2. AIRE ACONDICIONADO (Usa coeficiente 0.28)
  let horasAire = horasAC * factorSolar;
  if (horasAire > 0) {
    values['energia']['aireAcondicionado'] = horasAire;
  } else {
    delete values['energia']['aireAcondicionado'];
  }

  // 3. CALEFACCIÓN (Usa coeficiente 0.28)
  let horasCalef = horasCal * factorSolar;
  if (horasCalef > 0) {
    values['energia']['calefaccion'] = horasCalef;
  } else {
    delete values['energia']['calefaccion'];
  }

  updateList();
  updateTotal();

  // Ocultar slider
  document.getElementById('rayo').style.display = 'none';
  document.querySelectorAll('.icon').forEach(i => i.classList.remove("active"));
}


function updateList() {
  const valuesList = document.getElementById('valuesList');
  valuesList.innerHTML = '';
  let hasValues = false;

  for (const group in values) {
    for (const key in values[group]) {
      const value = values[group][key];
      const name = (nameMapping[key] || key);

      if (value > 0) {
        hasValues = true;
        const listItem = document.createElement('li');

        let displayValue = value;
        if (group === 'energia') {
          const placas = document.getElementById('placasSolares').checked;
          displayValue = `${value.toFixed(1)} ${placas ? ' (with solar panels)' : ''}`;
        }

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<span class="group-name">${name}</span>: <strong>${displayValue}</strong>`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '❌';
        deleteBtn.onclick = () => deleteValue(group, key);

        listItem.appendChild(infoDiv);
        listItem.appendChild(deleteBtn);
        valuesList.appendChild(listItem);
      }
    }
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.style.display = hasValues ? 'block' : 'none';
}

function deleteValue(group, key) {
  console.log(`🗑️ Eliminando: ${group} -> ${key}`);
  if (values[group] && values[group][key] !== undefined) {
    delete values[group][key];

    if (group === 'energia' && Object.keys(values['energia']).length === 0) {
      document.getElementById('placasSolares').checked = false;
    }

    updateList();
    updateTotal();
  }
}

// ===================================
// 5. CÁLCULO DE TOTALES E IMPACTO
// ===================================

function computeEmissionFor(group, key, count) {
  let co2 = 0;

  if (group === 'contenedor') {
    co2 = COEFFICIENTS.co2_reciclar[key] || 0;
  } else {
    if (COEFFICIENTS.co2[key] === undefined) {
      console.warn(`⚠️ ALERTA: No existe coeficiente CO2 para: ${key}`);
      return 0;
    }
    co2 = COEFFICIENTS.co2[key];
  }

  // Energía
  if (key === 'rayo') {
    // Lógica antigua para Luz y TV: Consumo * 1000 Wh * factor (0.0003)
    return co2 * count;
  }

  // Para calefacción y aire, el coeficiente 0.28 se aplica directamente a las horas
  // (count aquí son las horas ya ajustadas por placas solares si las hubiera)
  return co2 * count;
}


function updateTotal() {
  console.log("🔄 Recalculando Totales...");
  let totalGastado = 0;
  let totalEvitado = 0;
  let totalLitrosAgua = 0;

  // 1. CÁLCULO
  for (let group in values) {
    for (let key in values[group]) {
      const count = Number(values[group][key]) || 0;

      // --- CO2 ---
      const emission = computeEmissionFor(group, key, count);

      console.log(`   -> Item: ${key} (${count}). Emisión calc: ${emission.toFixed(4)}`);

      if (emission > 0) {
        totalGastado += emission;
      } else if (emission < 0) {
        totalEvitado += Math.abs(emission);
      }

      // --- AGUA ---
      // Solo sumamos agua si es consumo (no reciclaje)
      if (group !== 'contenedor') {
        /*
        let litrosUnitarios = COEFFICIENTS.agua[key];

        // Si no hay coeficiente de agua definido, usamos un fallback o 0
        if (litrosUnitarios === undefined) {
          console.log(`   ⚠️ Sin dato de agua para ${key}, asumiendo 0.`);
          litrosUnitarios = 0;
        }

        if (key === 'rayo') {
          // Para energía: litros/Wh * horas * 1000Wh
          totalLitrosAgua += litrosUnitarios * count;
        } else {
          totalLitrosAgua += litrosUnitarios * count;
        }*/

        totalLitrosAgua = totalGastado * 270
      }
    }
  }

  console.log(`📊 TOTALES -> CO2 Gastado: ${totalGastado}, CO2 Evitado: ${totalEvitado}, Agua: ${totalLitrosAgua}`);

  // 2. ACTUALIZACIÓN UI
  const gastadoSpan = document.getElementById('gastadoValor');
  const evitadoSpan = document.getElementById('evitadoValor');

  if (gastadoSpan) gastadoSpan.textContent = totalGastado.toFixed(2);
  if (evitadoSpan) evitadoSpan.textContent = totalEvitado.toFixed(2);

  // 3. PANELES DE IMPACTO
  const impactoEvitado = totalEvitado;
  const elCo2Kg = document.getElementById('impact_co2Kg');
  if (elCo2Kg) elCo2Kg.textContent = impactoEvitado.toFixed(2);

  const ARBOL_POR_KG = 1 / 0.06;
  const COCHE_POR_KG = 1 / 12.8;

  const elArboles = document.getElementById('impact_arboles');
  const elCoches = document.getElementById('impact_coches');

  if (elArboles) elArboles.textContent = Math.round(impactoEvitado * ARBOL_POR_KG);
  if (elCoches) elCoches.textContent = (impactoEvitado * COCHE_POR_KG).toFixed(1);

  // --- AGUA ---
  const LITROS_POR_DUCHA = 100;
  const LITROS_POR_CAMISETA = 2700;

  const elAgua = document.getElementById('impact_agua');
  const elDuchas = document.getElementById('impact_duchas');
  const elCamisetas = document.getElementById('impact_camisetas');

  if (elAgua) elAgua.textContent = Math.round(totalLitrosAgua);
  if (elDuchas) elDuchas.textContent = (totalLitrosAgua / LITROS_POR_DUCHA).toFixed(1);
  if (elCamisetas) elCamisetas.textContent = (totalLitrosAgua / LITROS_POR_CAMISETA).toFixed(2);
}

/**
 * 🗑️ Reinicia todos los valores
 */
function resetAll() {
  console.log("🧹 Reiniciando sistema...");
  values = {
    'botella': {},
    'coche': {},
    'energia': {},
    'contenedor': {},
    'dispositivos': {},
    'comida': {}
  };

  document.querySelectorAll('input[type="range"]').forEach(input => {
    input.value = 0;
    const valueSpan = document.getElementById(input.id + 'Value');
    if (valueSpan) {
      valueSpan.textContent = 0;
    }
  });

  const placasCheckbox = document.getElementById('placasSolares');
  if (placasCheckbox) placasCheckbox.checked = false;

  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

  updateList();
  updateTotal();
  updateVisibleIcons();
}

/*************************************************
 * TEXTOS EXPLICATIVOS E INFO MODALS
 *************************************************/
const infoTexts = {
  "info-kilos": {
    title: "Kg of CO₂ avoided",
    text: "Carbon dioxide (CO₂) is one of the main drivers of climate change. Every kilogram of CO₂ you avoid helps reduce global warming."
  },
  "info-arboles": {
    title: "Equivalent trees",
    text: "Trees act as the lungs of the planet. This value represents how many trees would be needed to offset the emissions. A single tree absorbs 0.06 kg of CO2 per day"
  },
  "info-coches": {
    title: "Cars taken off the road",
    text: "This indicator shows how many cars would need to stop driving for one day to achieve the same positive impact. It is estimated that cars produce an average of 12.8 kg of CO2 per day."
  },
  "info-agua": {
    title: "Water consumption",
    text: "Fresh water is a limited resource. Each product requires large amounts of water for its production (water footprint). Producing one kg of CO2 results in the waste of up to 270 liters"
  },
  "info-duchas": {
    title: "Equivalent showers",
    text: "A 10-minute shower can consume between 80 and 100 liters of water. Visualize your impact in everyday terms."
  },
  "info-algodon": {
    title: "Cotton T-shirts",
    text: "Producing a single cotton T-shirt can require more than 2,700 liters of water."
  }
};

function toggleInfo(infoId) {
  const existing = document.getElementById(infoId);
  if (existing) {
    existing.remove();
    return;
  }

  const info = infoTexts[infoId];
  if (!info) return;

  const overlay = document.createElement("div");
  overlay.className = "info-overlay";
  overlay.id = infoId;

  const box = document.createElement("div");
  box.className = "info-box";

  box.innerHTML = `
    <h3>${info.title}</h3>
    <p>${info.text}</p>
    <button class="info-ok-btn">OK</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  box.querySelector(".info-ok-btn").addEventListener("click", () => {
    overlay.remove();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// INICIALIZA TODO
resetAll();

// FADE-IN AL CARGAR
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('fade-in');
  }, 50);
});