
//
//
// PARA EL CAMBIO DE CONSUMO Y RECICLAR
//
//

// Estado del modo: false = Consumo, true = Reciclar
let estadoBoton = false;

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

  if (!estadoBoton) {
    // Modo Consumo → botella, coche, luz
    iconsEnvases.forEach(i => i.style.display = "inline-block");
    iconsTransporte.forEach(i => i.style.display = "inline-block");
    iconsLuz.forEach(i => i.style.display = "inline-block");
    iconsBasura.forEach(i => i.style.display = "none");
  } else {
    // Modo Reciclar → solo papelera
    iconsEnvases.forEach(i => i.style.display = "none");
    iconsTransporte.forEach(i => i.style.display = "none");
    iconsLuz.forEach(i => i.style.display = "none");
    iconsBasura.forEach(i => i.style.display = "inline-block");
  }

  // Oculta sliders y submenús activos
  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");

  // Desactiva iconos activos
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));
}

//
//
// PARA DESPLEGAR LOS MENUS Y SUBMENUS
//
//

// FUNCION PARA ABRIR SLIDER O SUBMENU
function openSliderBelowMenu(sliderId, iconElement) {
  // Primero cerramos todos los sliders/submenús
  document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
  document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

  // Activamos el icono clicado
  iconElement.classList.add("active");

  // Mostramos el slider correspondiente
  const slider = document.getElementById(sliderId);
  if (slider) slider.style.display = "block";
}

// FUNCION PARA TOGGLE DE SUBMENU (solo si es el icono de Reciclaje o Energía)
function toggleSlider(sliderId, iconElement) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  // Si ya está visible, ocultamos
  if (slider.style.display === "block") {
    slider.style.display = "none";
    iconElement.classList.remove("active");
  } else {
    // Ocultamos todos los sliders y desactivamos iconos
    document.querySelectorAll(".submenu-container, .slider-container").forEach(el => el.style.display = "none");
    document.querySelectorAll(".icon").forEach(i => i.classList.remove("active"));

    // Mostramos el slider y activamos icono
    slider.style.display = "block";
    iconElement.classList.add("active");
  }
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
 


