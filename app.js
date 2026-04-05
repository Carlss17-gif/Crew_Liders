
const CACHE = {}; 
let MENU_DATA = []; 
function iniciarSesion() {
  const nombre = document.getElementById('nombreInput').value.trim();
  const errorEl = document.getElementById('loginError');

  if (!nombre) {
    errorEl.classList.add('show');
    return;
  }

  errorEl.classList.remove('show');

  localStorage.setItem('empleado', JSON.stringify({ nombre }));

  document.getElementById('welcomeName').textContent = nombre;

  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('mainScreen').classList.add('active');

  cargarTodosLosModulos();
}

function cerrarSesion() {
  localStorage.removeItem('empleado');
  localStorage.removeItem('recordar');
  window.location.href = 'index.html';
}

async function cargarTodosLosModulos() {
  try {
    const respIndex = await fetch('data/index.json');
    const index = await respIndex.json();
    const promesas = index.modulos.map(async (archivo) => {
      const resp = await fetch(`data/${archivo}`);
      const datos = await resp.json();
      CACHE[datos.id] = datos;
      return datos;
    });
    MENU_DATA = await Promise.all(promesas);
    construirMenu(MENU_DATA);

  } catch (error) {
    console.error('Error cargando módulos:', error);
  }
}

/* 
 * @param {Array} modulos - Array de objetos JSON de cada módulo
 */
function construirMenu(modulos) {
  const contenedor = document.getElementById('menuView');
  contenedor.innerHTML = ''; 

  const categorias = [
    { id: 'cocina',    etiqueta: '🍔 Cocina y Preparación'  },
    { id: 'seguridad', etiqueta: '🛡 Seguridad Alimentaria'  },
    { id: 'servicio',  etiqueta: '⭐ Servicio al Cliente'    }
  ];

  categorias.forEach(cat => {
    const modulosDeCat = modulos.filter(m => m.categoria === cat.id);
    if (modulosDeCat.length === 0) return; 
    const label = document.createElement('div');
    label.className = 'section-label';
    label.dataset.cat = cat.id;          
    label.textContent = cat.etiqueta;
    contenedor.appendChild(label);
    const grid = document.createElement('div');
    grid.className = 'modules-grid';
    contenedor.appendChild(grid);
    modulosDeCat.forEach(modulo => {
      const card = crearTarjeta(modulo);
      grid.appendChild(card);
    });
  });

  contenedor.appendChild(crearSeccionExamenes());
}

/**
 * @param {Object} modulo 
 * @returns {HTMLElement} 
 */
function crearTarjeta(modulo) {
  const card = document.createElement('div');

  card.className = `mod-card accent-${modulo.acento}`;
  card.dataset.cat = modulo.categoria;
  card.onclick = () => abrirModulo(modulo.id);
  card.innerHTML = `
    <span class="mod-icon">${modulo.icono}</span>
    <span class="mod-name">${modulo.titulo}</span>
    <span class="mod-sub">${modulo.subtitulo}</span>
  `;

  return card;
}


function crearSeccionExamenes() {
  const frag = document.createDocumentFragment();

  const label = document.createElement('div');
  label.className   = 'section-label';
  label.dataset.cat = 'examenes';
  label.textContent = '📝 Exámenes de Evaluación';
  frag.appendChild(label);

  const sec = document.createElement('div');
  sec.id = 'seccionExamenes';

  sec.innerHTML = `
    <div class="nivel-header nivel-basico">
      <span>📗</span><span>Nivel Básico</span>
    </div>
    <div class="chips-wrap">
      <button class="chip chip-basico" onclick="irExamen('AutoServicio')">Auto Servicio</button>
      <button class="chip chip-basico" onclick="irExamen('SeguridadAlimentaria')">Seguridad Alimentaria</button>
      <button class="chip chip-basico" onclick="irExamen('Feeder')">Feeder</button>
      <button class="chip chip-basico" onclick="irExamen('Freír')">Freír</button>
      <button class="chip chip-basico" onclick="irExamen('Cocinero')">Cocinero</button>
      <button class="chip chip-basico" onclick="irExamen('Tenders')">Tenders</button>
      <button class="chip chip-basico" onclick="irExamen('Comedor')">Comedor</button>
      <button class="chip chip-basico" onclick="irExamen('Cajero')">Cajero</button>
    </div>

    <div class="nivel-header nivel-medio">
      <span>📙</span><span>Nivel Medio</span>
    </div>
    <div class="chips-wrap">
      <button class="chip chip-medio" onclick="irExamen('vegetales')">Vegetales</button>
      <button class="chip chip-medio" onclick="irExamen('quimicos')">Químicos</button>
      <button class="chip chip-medio" onclick="irExamen('malteadas')">Malteadas</button>
      <button class="chip chip-medio" onclick="irExamen('uber')">Uber Eats</button>
    </div>
  `;

  frag.appendChild(sec);
  return frag;
}

function irExamen(id){
  window.location.href = `examen.html?id=${id}&nom=${empleado.nombre}`;
}

function abrirModulo(id) {
  const modulo = CACHE[id];

  if (!modulo) {
    alert(`El módulo "${id}" no está disponible.`);
    return;
  }
  const html = renderModulo(modulo);
  document.getElementById('detalleContent').innerHTML = html;
  document.getElementById('menuView').classList.add('hidden');
  document.getElementById('detalleView').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cerrarDetalle() {
  document.getElementById('detalleView').classList.add('hidden');
  document.getElementById('menuView').classList.remove('hidden');
}


/* 
 * @param {Object} modulo - El objeto JSON completo del módulo
 * @returns {string} - HTML listo para insertar con innerHTML
 */
function renderModulo(modulo) {
  let html = `
    <div class="detail-card" style="margin-bottom:12px">
      <div class="detail-card-header">
        <div class="detail-card-icon">${modulo.icono}</div>
        <h2 class="detail-card-title">${modulo.titulo}</h2>
      </div>
    </div>
  `;
  modulo.secciones.forEach(seccion => {
    html += renderSeccion(seccion);
  });

  return html;
}

/**
 * renderSeccion(seccion)
 * @param {Object} seccion 
 * @returns {string} 
 */
function renderSeccion(seccion) {
  switch (seccion.tipo) {
    case 'tabla': {
      const ths = seccion.columnas
        .map(col => `<th>${col}</th>`)
        .join('');
      const trs = seccion.filas
        .map(fila => {
          const tds = fila.map(celda => `<td>${celda}</td>`).join('');
          return `<tr>${tds}</tr>`;
        })
        .join('');

      return `
        <div class="detail-card">
          <div class="detail-section-title">${seccion.titulo}</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs}</tbody>
            </table>
          </div>
        </div>
      `;
    }
    case 'pasos': {
      const items = seccion.pasos
        .map((paso, i) => `
          <div class="step-item">
            <div class="step-num">${i + 1}</div>
            <span class="step-text">${paso}</span>
          </div>
        `)
        .join('');

      return `
        <div class="detail-card">
          <div class="detail-section-title">${seccion.titulo}</div>
          <div class="steps-list">${items}</div>
        </div>
      `;
    }
    case 'lista': {
      const items = seccion.items
        .map(item => `<li class="list-item">${item}</li>`)
        .join('');
      return `
        <div class="detail-card">
          <div class="detail-section-title">${seccion.titulo}</div>
          <ul class="bullet-list">${items}</ul>
        </div>
      `;
    }
    case 'alerta': {
      return `<div class="alert-box">${seccion.texto}</div>`;
    }
    case 'info': {
      return `<div class="info-box">${seccion.texto}</div>`;
    }
    case 'temperaturas': {
      const items = seccion.items
        .map(item => `
          <div class="temp-item">
            <div class="temp-num">${item.temp}</div>
            <div class="temp-desc">${item.desc}</div>
          </div>
        `)
        .join('');

      return `
        <div class="detail-card">
          <div class="detail-section-title">${seccion.titulo}</div>
          <div class="temp-grid">${items}</div>
        </div>
      `;
    }
    default:
      return `<div class="info-box">Tipo de sección desconocido: <strong>${seccion.tipo}</strong></div>`;
  }
}



/*
 * @param {string} cat - La categoría a mostrar: "todos", "cocina", etc.
 * @param {HTMLElement} el - El botón que fue tocado
 */
function filtrarTab(cat, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  el.classList.add('active');

  const cards  = document.querySelectorAll('.mod-card');
  const labels = document.querySelectorAll('.section-label');
  const exams  = document.getElementById('seccionExamenes');

  if (cat === 'todos') {
    // Mostrar todo
    cards.forEach(c  => c.style.display  = '');
    labels.forEach(l => l.style.display  = '');
    if (exams) exams.style.display = '';

  } else if (cat === 'examenes') {
    cards.forEach(c  => c.style.display  = 'none');
    labels.forEach(l => l.style.display  = 'none');
    if (exams) exams.style.display = '';

  } else {
    cards.forEach(c => {
      c.style.display = c.dataset.cat === cat ? '' : 'none';
    });
    labels.forEach(l => {
      l.style.display = l.dataset.cat === cat ? '' : 'none';
    });
    if (exams) exams.style.display = 'none';
  }
}

/*
 * @param {string} val - El texto actual del campo de búsqueda
 */
function buscarModulo(val) {
  const query = val.toLowerCase().trim();

  document.querySelectorAll('.mod-card').forEach(card => {
    const textoCard = card.innerText.toLowerCase();
    card.style.display = textoCard.includes(query) ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const empleado = JSON.parse(localStorage.getItem('empleado') || 'null');
  if (!empleado) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('welcomeName').textContent = empleado.nombre;
  cargarTodosLosModulos();
});
