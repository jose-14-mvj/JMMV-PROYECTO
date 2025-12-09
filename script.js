//API TMDB
const API_KEY = "912dd0733c76e627da6361f7bc7a8797";

const contenedor = document.getElementById("contenedor-peliculas");
const filtro = document.getElementById("filtroGenero");
const buscar = document.getElementById("buscar");
const paginador = document.getElementById("paginador");
const linkInicio = document.getElementById("linkInicio");

const btnMenu = document.getElementById("btnMenu");
const menu = document.getElementById("menu");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalDesc = document.getElementById("modalDesc");
const modalFecha = document.getElementById("modalFecha");
const cerrarModal = document.getElementById("cerrarModal");

let paginaActual = 1;
let genero = "";
let todasPeliculas = [];
const PELICULAS_POR_PAGINA = 15;
const MAX_PELICULAS = 200;

//MENÚ HAMBURGUESA
btnMenu.onclick = function() {
    menu.classList.toggle("abierto");
};

// CERRAR MODAL
cerrarModal.onclick = function() {
    modal.style.display = "none";
};

// Cerrar modal al hacer clic fuera del contenido
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// CARGA INICIAL
async function cargarPopulares() {
    todasPeliculas = [];
    let paginaTMDB = 1;

    while (todasPeliculas.length < MAX_PELICULAS) {
        const r = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=${paginaTMDB}`
        );
        const resultados = (await r.json()).results;
        if (!resultados || resultados.length === 0) break;
        todasPeliculas = todasPeliculas.concat(resultados);
        paginaTMDB++;
    }

    aplicarBusqueda();
}

// POR GÉNERO
async function cargarGenero() {
    todasPeliculas = [];
    let paginaTMDB = 1;

    while (todasPeliculas.length < MAX_PELICULAS) {
        const r = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genero}&page=${paginaTMDB}`
        );
        const resultados = (await r.json()).results;
        if (!resultados || resultados.length === 0) break;
        todasPeliculas = todasPeliculas.concat(resultados);
        paginaTMDB++;
    }

    aplicarBusqueda();
}

// APLICAR BÚSQUEDA
function aplicarBusqueda() {
    const termino = buscar.value.trim().toLowerCase();

    let lista = todasPeliculas;

    if (termino) {
        lista = todasPeliculas.filter(p => p.title.toLowerCase().includes(termino));
    }

    mostrarPagina(lista, paginaActual);
    crearPaginador(lista);
}

// MOSTRAR PELÍCULAS
function mostrarPagina(lista, pagina) {
    contenedor.innerHTML = "";

    if (!lista?.length) {
        contenedor.innerHTML = "<p>No se encontraron películas.</p>";
        return;
    }

    const inicio = (pagina - 1) * PELICULAS_POR_PAGINA;
    const fin = inicio + PELICULAS_POR_PAGINA;
    const subLista = lista.slice(inicio, fin);

    subLista.forEach(p => {
        const poster = p.poster_path
            ? `https://image.tmdb.org/t/p/w500${p.poster_path}`
            : "https://via.placeholder.com/500x750?text=Sin+Imagen";

        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
                p.title + " trailer"
            )}" target="_blank">
                <img src="${poster}" class="poster">
            </a>
            <button class="btn-desc">Ver descripción</button>
        `;

        // Evento para abrir el modal con la descripción
        item.querySelector(".btn-desc").onclick = () => {
            modalTitulo.textContent = p.title;
            modalDesc.textContent = p.overview || "Sin descripción disponible.";
            modalFecha.innerHTML = `<strong>Estreno:</strong> ${p.release_date || "Fecha no disponible"}`;
            modal.style.display = "flex";
        };

        contenedor.appendChild(item);
    });
}

// PAGINADOR
function crearPaginador(lista) {
    paginador.innerHTML = "";
    if (!lista) lista = todasPeliculas;

    const totalPaginas = Math.ceil(lista.length / PELICULAS_POR_PAGINA);
    if (totalPaginas <= 1) return;

    const maxVisibles = 5; // cantidad de botones directos visibles

    function addBtn(txt, pagina, activo = false, disabled = false) {
        const b = document.createElement("button");
        b.textContent = txt;
        if (activo) b.classList.add("activo");
        b.disabled = disabled;
        if (!disabled && pagina) b.onclick = () => cambiarPagina(pagina);
        paginador.appendChild(b);
    }

    addBtn("<", paginaActual - 1, false, paginaActual === 1);

    addBtn("1", 1, paginaActual === 1);

    if (paginaActual > 3)
        addBtn("...", null, false, true);

    const inicio = Math.max(2, paginaActual - 1);
    const fin = Math.min(totalPaginas - 1, paginaActual + 1);

    for (let i = inicio; i <= fin; i++) {
        addBtn(i, i, i === paginaActual);
    }

    // si estamos lejos del final: ...
    if (paginaActual < totalPaginas - 2)
        addBtn("...", null, false, true);

    // siempre última
    if (totalPaginas > 1)
        addBtn(totalPaginas, totalPaginas, paginaActual === totalPaginas);

    // siguiente
    addBtn(">", paginaActual + 1, false, paginaActual === totalPaginas);
}


// CAMBIAR PÁGINA
function cambiarPagina(n) {
    paginaActual = n;
    aplicarBusqueda();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// EVENTOS
filtro.onchange = () => {
    genero = filtro.value;
    paginaActual = 1;
    buscar.value = "";
    genero ? cargarGenero() : cargarPopulares();
};

let tiempoEspera;
buscar.oninput = () => {
    clearTimeout(tiempoEspera);
    tiempoEspera = setTimeout(() => {
        paginaActual = 1;
        aplicarBusqueda();
    }, 300);
};

buscar.onkeydown = e => {
    if (e.key === "Enter") {
        paginaActual = 1;
        aplicarBusqueda();
    }
};

linkInicio.onclick = () => {
    paginaActual = 1;
    genero = "";
    filtro.value = "";
    buscar.value = "";
    cargarPopulares();
};

// CARGA INICIAL
cargarPopulares();