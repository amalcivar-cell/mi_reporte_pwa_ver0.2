const btnShare = document.getElementById('btn-share');
const gpsStatus = document.getElementById('gps-status');
const clockStatus = document.getElementById('clock-status');
const fileStatus = document.getElementById('file-status');
const selectCategoria = document.getElementById('select-categoria');
const selectCiudad = document.getElementById('select-ciudad');
const inputTitular = document.getElementById('input-titular');
const inputRedaccion = document.getElementById('input-redaccion');
const counterTitular = document.getElementById('counter-titular');
const counterRedaccion = document.getElementById('counter-redaccion');

const captureImage = document.getElementById('capture-image');
const captureVideo = document.getElementById('capture-video');
const captureFile = document.getElementById('capture-file');

const coordenadas = { lat: null, lon: null };
let fileToSend = null;

inputTitular.addEventListener('input', () => {
  inputTitular.value = inputTitular.value.toUpperCase();
  counterTitular.textContent = `${inputTitular.value.length} / 60 caracteres`;
});

inputRedaccion.addEventListener('input', () => {
  counterRedaccion.textContent = `${inputRedaccion.value.length} / 500 caracteres`;
});

function obtenerFechaFormateada(incluirSegundos = true) {
  const opciones = {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  };
  if (incluirSegundos) opciones.second = '2-digit';
  return new Date().toLocaleString('es-ES', opciones);
}

function actualizarRelojPantalla() {
  clockStatus.textContent = `📅 ${obtenerFechaFormateada(true)}`;
}

function initGeolocation() {
  if (!navigator.geolocation) {
    gpsStatus.textContent = "GPS no soportado en este móvil.";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordenadas.lat = position.coords.latitude.toFixed(6);
      coordenadas.lon = position.coords.longitude.toFixed(6);
      gpsStatus.textContent = `📍 GPS Activo: Lat ${coordenadas.lat}, Lon ${coordenadas.lon}`;
    },
    (err) => {
      gpsStatus.textContent = "📍 GPS Desactivado: Activa la ubicación del móvil.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function limpiarInputsMultimedia(inputExcluido) {
  if (inputExcluido !== captureImage) captureImage.value = "";
  if (inputExcluido !== captureVideo) captureVideo.value = "";
  if (inputExcluido !== captureFile) captureFile.value = "";
  fileStatus.classList.add("file-loaded");
}

captureImage.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    fileToSend = e.target.files[0];
    fileStatus.textContent = "📸 Foto guardada en el dispositivo";
    limpiarInputsMultimedia(captureImage);
  }
});

captureVideo.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    fileToSend = e.target.files[0];
    fileStatus.textContent = "🎥 Video guardado en el dispositivo";
    limpiarInputsMultimedia(captureVideo);
  }
});

captureFile.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    fileToSend = e.target.files[0];
    limpiarInputsMultimedia(captureFile);

    if (fileToSend.type.startsWith('image/')) {
      fileStatus.textContent = "📁 Archivo: Foto cargada localmente";
    } else if (fileToSend.type.startsWith('video/')) {
      fileStatus.textContent = "📁 Archivo: Video cargado localmente";
    } else {
      fileStatus.textContent = "📁 Archivo multimedia guardado";
    }
  }
});

btnShare.addEventListener('click', async () => {
  const categoria = selectCategoria.value;
  const ciudad = selectCiudad.value;
  const titular = inputTitular.value.trim();
  const redaccion = inputRedaccion.value.trim();
  const errores = [];

  if (!categoria) errores.push("Falta seleccionar la Categoría");
  if (!ciudad) errores.push("Falta seleccionar la Ciudad");
  if (!titular) errores.push("Falta ingresar el Titular");
  if (!redaccion) errores.push("Falta ingresar la Redacción");
  if (!fileToSend) errores.push("Falta capturar una Foto o un Video");

  if (errores.length > 0) {
    alert("⚠️ Error al enviar reporte:\n\n" + errores.map(e => "• " + e).join("\n"));
    return;
  }

  const ahora = obtenerFechaFormateada(false);
  const mapaUrl = coordenadas.lat && coordenadas.lon 
    ? `https://google.com/maps?q=${coordenadas.lat},${coordenadas.lon}` 
    : "No disponible";
  
  const ciudadFormateada = ciudad.toUpperCase();
  const textoMensaje = `📰 *EL INFORMADOR*\n` + 
                       `⚠️ *CATEGORÍA:* ${categoria.toUpperCase()}\n` + 
                       `🏙️ *CIUDAD:* ${ciudadFormateada}\n` + 
                       `📅 *Fecha/Hora:* ${ahora}\n` + 
                       `📍 *Ubicación:* ${mapaUrl}\n` + 
                       `------------------------------------------\n` + 
                       `📌 *TITULAR:* ${titular}\n` + 
                       `📝 *REDACCIÓN:* *${ciudadFormateada}.-* ${redaccion}`;

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [fileToSend] })) {
    try {
      await navigator.share({
        files: [fileToSend],
        title: 'El Informador',
        text: textoMensaje
      });
    } catch (err) {
      console.warn("Compartición nativa cancelada o fallida:", err);
    }
  } else {
    const whatsappUrl = `https://whatsapp.com/send?text=${encodeURIComponent(textoMensaje)}`;
    window.open(whatsappUrl, '_blank');
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.error('Error al registrar Service Worker:', err));
  });
}

initGeolocation();
actualizarRelojPantalla();
setInterval(actualizarRelojPantalla, 1000);
