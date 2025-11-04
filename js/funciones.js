function resetAll() {
  // Reinicia todos los valores del objeto principal
  for (let group in values) {
    for (let key in values[group]) {
      values[group][key] = 0;
    }
  }

  // Reinicia todos los sliders y sus etiquetas visibles
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.value = 0;
    const span = slider.previousElementSibling.querySelector('span');
    if (span) span.textContent = '0';
  });

  // Reinicia el total y actualiza la lista
  total = 0;
  updateList();
  updateTotal();

  // Oculta submenús y sliders abiertos
  document.querySelectorAll('.slider-container, .submenu-container').forEach(s => s.style.display = "none");

  // Quita la marca de iconos activos
  document.querySelectorAll('.icon').forEach(i => i.classList.remove('active'));

  // Oculta el botón de reinicio
  document.getElementById('resetBtn').style.display = 'none';
}
