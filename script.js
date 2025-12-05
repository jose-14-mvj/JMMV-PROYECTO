/* API TMDB */
const API_KEY = "912dd0733c76e627da6361f7bc7a8797";

const contenedor = document.getElementById("contenedor-peliculas");
const filtro = document.getElementById("filtroGenero");
const buscar = document.getElementById("buscar");
const btnBuscar = document.getElementById("btnBuscar");
const paginador = document.getElementById("paginador");
const linkInicio = document.getElementById("linkInicio");

let paginaActual = 1;
let genero = "";
const TOTAL_PAGINAS = 3;
let paginas = [];

/* CARGA INICIAL */
async function cargarPopulares() {
    paginas = [];
    for (let i = 1; i <= TOTAL_PAGINAS; i++) {
        const r = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=${i}`
        );
        paginas[i] = (await r.json()).results;
    }
    mostrar(paginas[paginaActual]);
    crearPaginador();
}

/* POR GÉNERO */
async function cargarGenero() {
    const r = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genero}&page=${paginaActual}`
    );
    mostrar((await r.json()).results);
    crearPaginador();
}

/* MOSTRAR PELÍCULAS */
function mostrar(lista) {
    contenedor.innerHTML = "";

    if (!lista?.length) {
        contenedor.innerHTML = "<p>No se encontraron películas.</p>";
        return;
    }

    lista.forEach(p => {
        const poster = p.poster_path
            ? `https://image.tmdb.org/t/p/w500${p.poster_path}`
            : "https://via.placeholder.com/500x750?text=Sin Imagen";

        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
                p.title + " trailer"
            )}" target="_blank">
                <img src="${poster}" class="poster">
            </a>
            <button class="btn-desc">Ver descripción</button>
            <div class="descripcion">
                <p><strong>${p.title}</strong></p>
                <p>${p.overview || "Sin descripción disponible."}</p>
                <p><strong>Estreno:</strong> ${p.release_date}</p>
            </div>
        `;

        item.querySelector(".btn-desc").onclick = () => {
            const d = item.querySelector(".descripcion");
            d.style.display = d.style.display === "block" ? "none" : "block";
        };

        contenedor.appendChild(item);
    });
}

/* PAGINADOR */
function crearPaginador() {
    paginador.innerHTML = "";

    const crearBtn = (txt, dis, fn) => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.disabled = dis;
        b.onclick = fn;
        paginador.appendChild(b);
    };

    crearBtn("Anterior", paginaActual === 1, () => cambiar(paginaActual - 1));

    for (let i = 1; i <= TOTAL_PAGINAS; i++) {
        const b = document.createElement("button");
        b.textContent = i;
        b.classList.toggle("activo", i === paginaActual);
        b.onclick = () => cambiar(i);
        paginador.appendChild(b);
    }

    crearBtn("Siguiente", paginaActual === TOTAL_PAGINAS, () => cambiar(paginaActual + 1));
}

function cambiar(n) {
    paginaActual = n;
    genero ? cargarGenero() : mostrar(paginas[paginaActual]);
    crearPaginador();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* EVENTOS */
filtro.onchange = () => {
    genero = filtro.value;
    paginaActual = 1;
    genero ? cargarGenero() : cargarPopulares();
};

btnBuscar.onclick = () => {
    const t = buscar.value.trim().toLowerCase();
    if (!t) return genero ? cargarGenero() : mostrar(paginas[paginaActual]);

    const lista = genero ? [] : paginas[paginaActual];
    mostrar(lista.filter(p => p.title.toLowerCase().includes(t)));
};

buscar.onkeydown = e => e.key === "Enter" && btnBuscar.click();

linkInicio.onclick = () => {
    paginaActual = 1;
    genero = "";
    filtro.value = "";
    buscar.value = "";
    cargarPopulares();
};

/* INICIO */
cargarPopulares();
