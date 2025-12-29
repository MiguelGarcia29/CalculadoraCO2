/* =========================
   TRANSICIÓN DE SALIDA
========================= */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.banderas a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const destino = this.href;
      const portada = document.querySelector('.portada');

      portada.classList.add('exit');

      setTimeout(() => {
        window.location.href = destino;
      }, 1000);
    });
  });
});
