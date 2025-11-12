
let total = 0; // Total mostrado
const maxTotal = 400; // Sirve para calcular el porcentaje de la barra de progreso

let values = { // Estado de los contadores Kg (a lo mejor se cambia a unidad en un futuro)
  botella: { botellaVidrio: 0, botellaPlastico: 0, Carton: 0 },
  coche: { cocheIndividual: 0, cocheBus: 0, moto: 0, camion:0 },
  rayo: { rayo: 0 },
  contenedor: { contenedor: 0 }
};

// Coeficientes cargados desde js/database.json
let coefficients = {};
fetch('js/database.json')
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cargar database.json');
    return res.json();
  })
  .then(data => {
    coefficients = data;
    updateTotal(); // recalcula total si ya hay valores cargados
  })
  .catch(err => {
    console.error('Error cargando coeficientes:', err);
    // manejar fallback: coefficients = {} (usar 1 como coeficiente por defecto)
  });

// Mapeo entre los grupos/ids que usa la UI (values) y las claves del JSON
// Esto permite mantener la estructura de `values` y traducir a los nombres
// que hay en `js/database.json` (Envases / Transporte)
const keyMap = {
  botella: {
    botellaPlastico: { group: 'Envases', key: 'Plastico' },
    botellaVidrio: { group: 'Envases', key: 'Vidrio' },
    Carton: { group: 'Envases', key: 'Carton' }
  },
  coche: {
    cocheIndividual: { group: 'Transporte', key: 'Coche' },
    cocheBus: { group: 'Transporte', key: 'Bus' },
    moto: { group: 'Transporte', key: 'Moto' },
    camion: { group: 'Transporte', key: 'Camion' }
  },
  rayo: {
    rayo: {group: 'Energia', key: 'Luz'} // sin coeficiente en JSON por ahora
  },
  contenedor: {
    contenedor: null // sin coeficiente en JSON por ahora
  }
};

function getCoefficient(group, id) { // Devuelve el coeficiente
  // intenta localizar la clave JSON usando el mapeo
  const mapGroup = keyMap[group];
  if (!mapGroup) return undefined;
  const mapping = mapGroup[id];
  if (!mapping) return undefined;
  const jsonGroup = mapping.group;
  const jsonKey = mapping.key;
  if (!coefficients || !coefficients[jsonGroup]) return undefined;
  const v = coefficients[jsonGroup][jsonKey];
  return (v === undefined) ? undefined : Number(v);
}

function computeEmissionFor(group, id, count) { // Calcula la emisión ya con el coeficiente.
  const coef = getCoefficient(group, id);
  if (coef === undefined) {
    // Fallback: si no existe coeficiente, usar 0 (ignorar) y avisar en consola
    // Esto evita que datos sin coeficienetes sumen por accidente.
    console.warn(`Coeficiente no encontrado para ${group}.${id} — usando 0 como fallback`);
    return 0;
  }
  
  // Para el grupo 'botella' el contador representa número de unidades
  // y necesitamos convertir a kg usando la tabla `Pesos` antes de aplicar
  // el coeficiente (que en database.json para Envases está en kg).
  if (group === 'botella') {
    const weightKg = computeWeightFor(group, id, count);
    return Number(weightKg) * Number(coef);
  }

  return Number(count) * Number(coef);
} 

// --- CONVERSIÓN: unidades de botella -> kg ---
function computeWeightFor(group, id, count) {
  const weight = getWeight(group, id);

  if (weight === undefined) {
    console.warn(`Peso no encontrado para ${group}.${id} — usando 0 como fallback`);
    return 0; // Fallback en 0
  }

  // `count` puede ser número de botellas; devolver kg
  return Number(count) * Number(weight);
}

function getWeight(group, id) {
  // Sólo aplicable para envases (grupo UI 'botella')
  const mapGroup = keyMap[group];
  if (!mapGroup || group !== 'botella') return undefined; // Solo queremos calcular peso de envases.
  const mapping = mapGroup[id];
  if (!mapping) return undefined;
  const jsonKey = mapping.key; // p.ej. 'Plastico', 'Vidrio', 'Carton'

  // En database.json los pesos están en la sección 'Pesos' y usan claves como 'PesoPlastico'
  const pesoKey = 'Peso' + jsonKey; // ej. 'PesoPlastico'
  if (!coefficients || !coefficients['Pesos'] || coefficients['Pesos'][pesoKey] === undefined) return undefined;

  const w = coefficients['Pesos'][pesoKey];
  return (w === undefined) ? undefined : Number(w);
}


// --- MARCAR ICONO ACTIVO ---
function markActiveIcon(el) { 
  document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('active'));
  if (el) el.classList.add('active');
}

function showSubmenu(groupId, el) { // Al marcar el icono se muestra el submenú.
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

function totalValue(){
let sum = 0;
  for (let group in values) {
    for (let key in values[group]) {
      const count = Number(values[group][key]) || 0;
      // sumar la emisión calculada (usa mapping y coeficientes cargados)
      sum += computeEmissionFor(group, key, count);
    }
  }
  total = Math.round(sum * 100) / 100; // Esto sirve para un redondeo a 2 decimales.

  return total;
}

function updateValue(id, range) {
  document.getElementById(id + "Value").textContent = range.value;
}

function acceptValue(id, group) { // El usuario confirma el valor
  const value = Number(document.getElementById(id + "Value").textContent); // Se transforma a Number
  if (!Number.isFinite(value)) return;
  values[group][id] = value;
  updateList();
  updateTotal(); // Solo calcula si está en OFF.
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
  total = totalValue();
  if(estadoBoton){ // Modo reciclaje, modelado temporal.
    let co2_kg = total; // Se copia el total en co2kg evitado
    document.getElementById("impact_co2Kg").textContent = co2_kg;
    recycleFunctions(total);
    total = 0; // Se pone en cero ya que se est
  } else{
    consumeFunctions(total);
  }
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
  consumeFunctions(total); // Reiniciar impactos de consumo a 0
  recycleFunctions(total); // Reiniciar impactos de reciclaje a 0
  document.querySelectorAll('.icon').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.slider-container, .submenu-container').forEach(s => s.style.display = "none");
}

//  <!-- BOTÓN -->
let estadoBoton = false; // si es true -> modo reciclar | si es false -> modo consumir
const modeToggle = document.getElementById("modeToggle");
modeToggle.onclick = () => {
  estadoBoton = !estadoBoton;
  applyModeState(estadoBoton);
};
function applyModeState(recycle){
  const modeLabel = document.getElementById('modeLabel');
  total = totalValue();
  if (recycle){
    if (modeLabel) modeLabel.textContent = '♻️ Modo Reciclar';
    recycleFunctions(total);
  } else {
    if (modeLabel) modeLabel.textContent = '🔥 Modo Consumo';
    consumeFunctions(total);
  }
}

function toggleBoton(event){
  // Si recibimos un evento change del checkbox, usar su checked; si no, leer el checkbox o invertir el estado
  if (event && event.target && typeof event.target.checked === 'boolean') {
    estadoBoton = !!event.target.checked;
  } else if (modeToggle) {
    estadoBoton = !!modeToggle.checked;
  } else {
    estadoBoton = !estadoBoton;
  }
  // Si este cambio viene de una interacción del usuario (evento 'change'), recargar la página
  // Esto evita recargas durante la inicialización donde no hay event.
  if (event && event.type === 'change') {
    resetAll();
  }
  applyModeState(estadoBoton);
}

if (modeToggle) {
  // Inicializar desde el checkbox y escuchar cambios
  estadoBoton = !!modeToggle.checked;
  // NOTA: el HTML ya tiene onchange="toggleBoton()" en el checkbox, evitamos añadir otro listener
  applyModeState(estadoBoton);
} else {
  // No hay checkbox en el HTML: dejar por defecto en Consumo
  console.warn('No se encontró #modeToggle — usando modo Consumo por defecto');
  estadoBoton = false;
  applyModeState(estadoBoton);
}

// Función que se ejecuta cuando el botón se enciende (Funciones de reciclaje)
function recycleFunctions(total) {
  console.log("✅ Modo ON activado");
  trees(total);
  cars(total);
}
// Función que se ejecuta cuando el botón se apaga (Funciones de consumo)
function consumeFunctions(total) { 
  liters(total);
  showers(total);
  cotton_shirts(total);
}

//  <!-- ConsumeFunctions -->
function liters(total){
  if(total > 0){
  litros = total / 10;
  aprox_litros = Math.round(litros * 100) / 100; // Esto sirve para un redondeo a 2 decimales.

    document.getElementById("impact_agua").textContent = aprox_litros;
  }else{
    document.getElementById("impact_agua").textContent = 0;
  }
}
function showers(total){
  if(total > 0){
      litros = total / 10;
      duchas = litros / 100;
      aprox_duchas = Math.round(duchas * 100) / 100; // Esto sirve para un redondeo.

      document.getElementById("impact_duchas").textContent = aprox_duchas;
  }else{
      document.getElementById("impact_duchas").textContent = 0;
  }
}
function cotton_shirts(total){
  if(total > 0){
  camisetas = total / 3.87;
  aprox_camisetas = Math.round(camisetas * 100) / 100; // Esto sirve para un redondeo.

  document.getElementById("impact_camisetas").textContent = aprox_camisetas;
  }else{
      document.getElementById("impact_camisetas").textContent = 0;
  }
}


//  <!-- RecycleFunctions -->

function trees(total){
  if(total > 0){
  arboles = total / 0.0685;
  aprox_arboles = Math.round(arboles); // Esto sirve para un redondeo.
  document.getElementById("impact_arboles").textContent = aprox_arboles;
  }else{
    document.getElementById("impact_arboles").textContent = 0;
  }
}
function cars(total){
  if(total > 0){
  coches = total / 13;
  aprox_coches = Math.round(coches); // Esto sirve para un redondeo.
  document.getElementById("impact_coches").textContent = aprox_coches;
  }else{
    document.getElementById("impact_coches").textContent = 0;
  }   
}