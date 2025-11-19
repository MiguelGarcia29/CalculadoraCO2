// ===================================
// 1. CONSTANTES Y ESTADO GLOBAL
// ===================================

// Estado del modo: false = Consumo (Gastar), true = Reciclar
let estadoBoton = false;

// COEFICIENTES (Ejemplo de valores para el cálculo)
// **NOTA: Necesitas definir estos valores o la función computeEmissionFor fallará.**
// Ejemplo de estructura (ajusta los valores reales según tus datos):
const COEFFICIENTS = {
  // Coeficientes de emisión (kg CO₂ por unidad/km)
  co2: {
    botellaVidrio: 0.25,
    botellaPlastico: 0.08,
    Carton: 0.12,
    cocheIndividual: 0.15, // kg CO2 / km
    cocheBus: 0.04,
    moto: 0.10,
    rayo: 0.0003, // kg CO2 / Wh (aprox) -> USADO: (luz+tv+ac) * horas * 0.0003
  },
  // Coeficientes de ahorro (kg CO₂ ahorrado por unidad reciclada)
  co2_reciclar: {
    botellaVidrioRec: -0.25, // Ahorro
    botellaPlasticoRec: -0.07,
    CartonRec: -0.11,
  },
  // Coeficientes de impacto en agua (litros de agua por unidad/acción)
  agua: {
    botellaVidrio: 0.005,
    botellaPlastico: 0.001,
    Carton: 0.0005,
    rayo: 0.00000001 // Litros / Wh
  }
};

// Objeto global para almacenar todos los valores aceptados.
let values = {
  'botella': {}, // Envases de vidrio, plástico, cartón (consumo)
  'coche': {},   // Transporte (coche, autobús, moto)
  'energia': {}, // Energía (luz, TV, AC) - Contiene un solo elemento 'rayo'
  'contenedor': {} // Reciclaje (botellaVidrioRec, botellaPlasticoRec, CartonRec)
};

// Mapeo de IDs a nombres legibles en español.
const nameMapping = {
  // Envases (Consumo)
  'botellaVidrio': 'Botellas de Vidrio (Unid.)',
  'botellaPlastico': 'Botellas de Plástico (Unid.)',
  'Carton': 'Envases de Cartón (Unid.)',
  // Transporte
  'cocheIndividual': 'Coche (KM)',
  'cocheBus': 'Autobús (KM)',
  'moto': 'Moto (KM)',
  // Energía
  'rayo': 'Consumo de Energía',
  // Reciclaje
  'botellaVidrioRec': 'Vidrio (Reciclado)',
  'botellaPlasticoRec': 'Plástico (Reciclado)',
  'CartonRec': 'Cartón (Reciclado)'
};


// ===================================
// 2. LÓGICA DE MODO (RECICLAR/CONSUMO)
// ===================================

const modeToggle = document.getElementById("modeToggle");

// Inicializamos según el checkbox
estadoBoton = !!modeToggle.checked;
applyModeState(estadoBoton);

// Evento al hacer clic en el toggle
modeToggle.onclick = (event) => {
  estadoBoton = !!event.target.checked;
  applyModeState(estadoBoton);
};

// Cambia el texto del modo y actualiza iconos
function applyModeState(recycle) {
  const modeLabel = document.getElementById('modeLabel');
  modeLabel.textContent = recycle ? '♻️ Modo Reciclar' : '🔥 Modo Consumo';

  updateVisibleIcons();
}

// Muestra/oculta los iconos según el modo
function updateVisibleIcons() {
  const iconsEnvases = document.querySelectorAll('img[data-group="Envases"]');
  const iconsTransporte = document.querySelectorAll('img[data-group="Transporte"]');
  const iconsLuz = document.querySelectorAll('img[data-group="rayo"]');
  const iconsBasura = document.querySelectorAll('img[data-group="contenedor"]');

  // Oculta sliders y submenús activos
  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

  if (!estadoBoton) {
    // Modo Consumo
    iconsEnvases.forEach(i => i.style.display = "inline-block");
    iconsTransporte.forEach(i => i.style.display = "inline-block");
    iconsLuz.forEach(i => i.style.display = "inline-block");
    iconsBasura.forEach(i => i.style.display = "none");
  } else {
    // Modo Reciclar
    iconsEnvases.forEach(i => i.style.display = "none");
    iconsTransporte.forEach(i => i.style.display = "none");
    iconsLuz.forEach(i => i.style.display = "none");
    iconsBasura.forEach(i => i.style.display = "inline-block");
  }
}


// ===================================
// 3. LÓGICA DE MENÚS Y SLIDERS
// ===================================

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
  // El submenú padre permanece abierto.
}

function updateValue(id, range) {
  document.getElementById(id + "Value").textContent = range.value;
}


// ===================================
// 4. LÓGICA DE VALORES ACEPTADOS
// ===================================

/**
 * 💾 Acepta el valor de un slider simple, lo almacena y actualiza la UI.
 */
function acceptValue(id, group) {
  const value = Number(document.getElementById(id + "Value").textContent);
  if (!Number.isFinite(value) || value <= 0) return;

  values[group][id] = value;

  updateList();
  updateTotal();

  // Opcional: Ocultar el slider después de aceptar
  document.getElementById(id).style.display = 'none';
  document.querySelectorAll('.icon').forEach(i => i.classList.remove("active"));
}

/**
 * 💡 Acepta los valores del slider de Energía, los combina y almacena.
 */
function acceptEnergiaValues() {
  const horasLuz = Number(document.getElementById('horasLuzValue').textContent);
  const horasTV = Number(document.getElementById('horasTVValue').textContent);
  const horasAC = Number(document.getElementById('horasACValue').textContent);
  const placas = document.getElementById('placasSolares').checked;

  // Suma simple de horas (se puede mejorar con ponderaciones de consumo)
  let totalHoras = horasLuz + horasTV + horasAC;

  // Si tiene placas solares, reducimos el impacto
  if (placas) {
    totalHoras *= 0.2; // Ejemplo: reduce el impacto al 20%
  }

  if (totalHoras > 0) {
    // Almacenamos el valor consolidado de energía
    values['energia']['rayo'] = totalHoras;
  } else if (values['energia']['rayo'] !== undefined) {
    delete values['energia']['rayo'];
  }

  updateList();
  updateTotal();

  // Ocultar el slider de energía después de aceptar
  document.getElementById('rayo').style.display = 'none';
  document.querySelectorAll('.icon').forEach(i => i.classList.remove("active"));
}


/**
 * 🔄 Actualiza la lista de valores aceptados en la barra lateral (Sidebar).
 */
function updateList() {
  const valuesList = document.getElementById('valuesList');
  valuesList.innerHTML = ''; // Limpia la lista actual
  let hasValues = false;

  for (const group in values) {
    for (const key in values[group]) {
      const value = values[group][key];
      // Mapeo especial para 'rayo'
      const name = (key === 'rayo') ? 'Consumo Eléctrico (H)' : (nameMapping[key] || key);

      if (value > 0) {
        hasValues = true;
        const listItem = document.createElement('li');

        // Muestra el nombre y el valor
        // Para energía, se añade la nota de placas si aplica
        let displayValue = value;
        if (key === 'rayo') {
          const placas = document.getElementById('placasSolares').checked;
          displayValue = `${value.toFixed(1)} ${placas ? ' (con placas)' : ''}`;
        } else {
          displayValue = value;
        }

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<span class="group-name">${name}</span>: <strong>${displayValue}</strong>`;

        // Botón de eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '❌ Eliminar';
        // Llama a la función deleteValue con el grupo y la clave
        deleteBtn.onclick = () => deleteValue(group, key);

        listItem.appendChild(infoDiv);
        listItem.appendChild(deleteBtn);
        valuesList.appendChild(listItem);
      }
    }
  }

  // Muestra u oculta el botón de reiniciar si hay valores
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.style.display = hasValues ? 'block' : 'none';
}

/**
 * 🗑️ Elimina un valor específico, actualiza la lista y el total.
 */
function deleteValue(group, key) {
  if (values[group] && values[group][key] !== undefined) {
    delete values[group][key];

    // Si se elimina 'rayo', desmarca las placas solares
    if (key === 'rayo') {
      document.getElementById('placasSolares').checked = false;
    }

    updateList();
    updateTotal();
  }
}

// ===================================
// 5. CÁLCULO DE TOTALES E IMPACTO
// ===================================

/**
 * Calcula la emisión (positiva o negativa) para un ítem.
 * @param {string} group - Grupo del ítem ('botella', 'coche', etc.)
 * @param {string} key - ID del ítem ('botellaVidrio', 'cocheIndividual', etc.)
 * @param {number} count - Valor introducido por el usuario.
 * @returns {number} Emisión total de CO2 (kg).
 */
function computeEmissionFor(group, key, count) {
  let co2 = 0;

  if (group === 'contenedor') {
    // Si es reciclaje, usa los coeficientes de ahorro (CO2_RECICLAR)
    co2 = COEFFICIENTS.co2_reciclar[key] || 0;
  } else {
    // Si es consumo, usa los coeficientes normales (CO2)
    co2 = COEFFICIENTS.co2[key] || 0;
  }

  // Manejo especial para la energía: usamos total de horas * coeficiente
  if (key === 'rayo') {
    // Valor de consumo * 1000 Wh por hora (asumimos un consumo promedio de 1kW por hora)
    return co2 * count * 1000;
  }

  return co2 * count;
}


/**
 * 🧮 Calcula la suma total de emisiones de CO₂.
 * @returns {number} La suma total redondeada.
 */
function totalValue() {
  let sum = 0;
  for (let group in values) {
    for (let key in values[group]) {
      const count = Number(values[group][key]) || 0;
      // sumar la emisión calculada
      sum += computeEmissionFor(group, key, count);
    }
  }
  // Redondeo a 2 decimales para la lista principal
  return Math.round(sum * 100) / 100;
}

/**
 * 🚀 Actualiza el total en la sidebar y los paneles de impacto.
 * Calcula el gasto y el ahorro por separado.
 */
function updateTotal() {
  let totalGastado = 0;
  let totalEvitado = 0; // Se acumulará como valor ABSOLUTO (lo ahorrado)
  let totalLitrosAgua = 0; // Para el panel de Gastado

  // 1. CÁLCULO DE GASTO, AHORRO Y AGUA
  for (let group in values) {
    for (let key in values[group]) {
      const count = Number(values[group][key]) || 0;

      // Cálculo de CO₂
      const emission = computeEmissionFor(group, key, count);
      if (emission > 0) {
        // Emisión positiva = Gasto/Consumo
        totalGastado += emission;
      } else if (emission < 0) {
        // Emisión negativa = Ahorro/Evitado
        totalEvitado += Math.abs(emission);
      }

      // Cálculo de Agua (Solo para consumo, no reciclaje)
      if (group !== 'contenedor') {
        const litrosPorUnidad = COEFFICIENTS.agua[key] || 1;
        console.log("KEY:" + key + "\nLitros por ud: " + litrosPorUnidad + "\nCount:" + count);

        if (key === 'rayo') {
          // Asumiendo 1kW por hora de uso (ajusta el factor si es necesario)
          totalLitrosAgua += litrosPorUnidad * count * 1000;
        } else {
          totalLitrosAgua += litrosPorUnidad * count;
        }
        console.log("Total litros: " + totalLitrosAgua);

      }
    }
  }

  // 2. ACTUALIZACIÓN DEL TOTAL NETO EN EL SIDEBAR (Balance y Color)
  const totalKgCO2 = totalGastado - totalEvitado;
  const totalBox = document.querySelector('.total-box');
  const totalSpan = document.getElementById('totalValue');

  // Asumimos que el HTML es: <div class="total-box">Total: <span id="totalValue">0</span> kg CO₂</div>
  // Intentamos acceder al nodo de texto antes del span del valor.
  let labelNode = totalBox.childNodes[0];

  // Si el balance es negativo, es un ahorro neto
  if (totalKgCO2 < 0) {
    // 1. Cambiar la etiqueta "Total:"
    if (labelNode && labelNode.nodeType === 3) {
      labelNode.nodeValue = "💚 Ahorrado: ";
    }
    // 2. Mostrar el valor absoluto (sin signo negativo)
    totalSpan.textContent = `${Math.abs(totalKgCO2).toFixed(2)} kg CO₂`;
    // 3. Cambiar el color a verde
    totalSpan.style.color = '#00c078';

  } else {
    // Si el balance es positivo o cero, es un gasto neto o neutro
    const balanceText = (totalKgCO2 === 0) ? "Balance:" : "🔥 Gastado:";

    // 1. Cambiar la etiqueta
    if (labelNode && labelNode.nodeType === 3) {
      labelNode.nodeValue = `${balanceText} `;
    }
    // 2. Mostrar el valor positivo
    totalSpan.textContent = `${totalKgCO2.toFixed(2)} kg CO₂`;
    // 3. Cambiar el color a rojo o negro
    totalSpan.style.color = (totalKgCO2 > 0) ? '#d9534f' : '#333';
  }

  // 3. ACTUALIZACIÓN DE PANELES DE IMPACTO

  // --- A. CO2 EVITADO (panel 'Has evitado') ---
  const impactoEvitado = totalEvitado;
  document.getElementById('impact_co2Kg').textContent = impactoEvitado.toFixed(2);

  // Valores de conversión aproximados (árboles, coches)
  const ARBOL_POR_KG = 1 / 0.06;
  const COCHE_POR_KG = 1 / 12.8;

  document.getElementById('impact_arboles').textContent = Math.round(impactoEvitado * ARBOL_POR_KG);
  document.getElementById('impact_coches').textContent = (impactoEvitado * COCHE_POR_KG).toFixed(1);


  // --- B. CO2 GASTADO (panel 'Has gastado') ---
  // ESTA ES LA CLAVE: NECESITAS impact_co2Gastado EN TU HTML
  const co2GastadoElement = document.getElementById('impact_co2Gastado');
  if (co2GastadoElement) {
    co2GastadoElement.textContent = totalGastado.toFixed(2);
  }

  // --- C. AGUA GASTADA (Los IDs que sí tienes) ---
  const LITROS_POR_DUCHA = 100;
  const LITROS_POR_CAMISETA = 2700;

  // La lógica para actualizar el agua ya está aquí:
  document.getElementById('impact_agua').textContent = totalLitrosAgua.toFixed(2);
  document.getElementById('impact_duchas').textContent = (totalLitrosAgua / LITROS_POR_DUCHA).toFixed(1);
  document.getElementById('impact_camisetas').textContent = (totalLitrosAgua / LITROS_POR_CAMISETA).toFixed(2);
}

/**
 * 🗑️ Reinicia todos los valores y la UI.
 */
function resetAll() {
  // 1. Reiniciar el objeto values (la fuente de datos)
  values = {
    'botella': {},
    'coche': {},
    'energia': {},
    'contenedor': {}
  };

  // 2. Reiniciar los sliders y checkboxes
  document.querySelectorAll('input[type="range"]').forEach(input => {
    input.value = 0;
    // Actualiza el texto del valor
    const valueSpan = document.getElementById(input.id + 'Value');
    if (valueSpan) {
      valueSpan.textContent = 0;
    }
  });

  // Reiniciar el checkbox de placas solares
  const placasCheckbox = document.getElementById('placasSolares');
  if (placasCheckbox) {
    placasCheckbox.checked = false;
  }

  // 3. Ocultar todos los menús, submenús y sliders (reset visual)
  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

  // 4. Actualizar la UI (lista y totales)
  updateList();
  updateTotal();

  // 5. Asegurar que los iconos de Consumo/Reciclaje se actualicen correctamente
  // (Esto es útil si el usuario estaba en un submenú o slider al reiniciar)
  updateVisibleIcons();
}

//INICIALIZA TODO
resetAll();