
//PORTADA 

document.addEventListener("DOMContentLoaded", () => {
  // --- PORTADA ---
  const banderaES = document.getElementById("banderaES");
  const banderaEN = document.getElementById("banderaEN");

  if (banderaES && banderaEN) {
    banderaES.addEventListener("click", () => {
      window.location.href = "index.html?lang=es";
    });

    banderaEN.addEventListener("click", () => {
      window.location.href = "index.html?lang=en";
    });
  }});