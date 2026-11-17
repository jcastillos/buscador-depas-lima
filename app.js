// --- CAPA 1: ENLACES INTELIGENTES ---
document.getElementById('btn-generar').addEventListener('click', (e) => {
    e.preventDefault();
    
    const distrito = document.getElementById('distrito').value;
    const precioMin = document.getElementById('precio-min').value || '';
    const precioMax = document.getElementById('precio-max').value || '';
    
    // Generar enlaces armados
    const urlUrbania = `https://urbania.pe/buscar/venta-de-departamentos-en-${distrito}?precio-desde=${precioMin}&precio-hasta=${precioMax}`;
    const urlProperati = `https://www.properati.com.pe/s/${distrito}/departamento/venta/?precio_min=${precioMin}&precio_max=${precioMax}`;
    
    const contenedor = document.getElementById('enlaces-portales');
    contenedor.innerHTML = `
        <a href="${urlUrbania}" target="_blank" class="btn-portal urbania">🔗 Abrir en Urbania</a>
        <a href="${urlProperati}" target="_blank" class="btn-portal properati">🔗 Abrir en Properati</a>
    `;

    // Disparar la Capa 3 (Filtrar tarjetas del robot)
    aplicarFiltrosYRenderizar();
});

// --- CAPA 2 y 3: ROBOT Y DEDUPLICACIÓN ---
let datosGlobales = []; // Guarda todos los depas en memoria

window.addEventListener('DOMContentLoaded', () => {
    fetch('data/resultados.json')
        .then(response => {
            if (!response.ok) throw new Error("No hay datos aún");
            return response.json();
        })
        .then(datos => {
            datosGlobales = datos;
            procesarTarjetas(datosGlobales); // Muestra todo al inicio
            actualizarPanelEstado(datosGlobales);
        })
        .catch(error => {
            console.log("Capa 2 inactiva o sin datos:", error);
            document.getElementById('caja-tarjetas').classList.add('oculto');
            document.getElementById('panel-estado').classList.add('oculto');
        });
});

// Lee los filtros del panel y recorta la lista
function aplicarFiltrosYRenderizar() {
    if (datosGlobales.length === 0) return;

    const minPrecio = parseFloat(document.getElementById('precio-min').value) || 0;
    const maxPrecio = parseFloat(document.getElementById('precio-max').value) || Infinity;
    const cuartos = parseInt(document.getElementById('dormitorios').value) || 0;
    const banos = parseInt(document.getElementById('banos').value) || 0;
    const minArea = parseFloat(document.getElementById('area-min').value) || 0;
    const maxArea = parseFloat(document.getElementById('area-max').value) || Infinity;

    const datosFiltrados = datosGlobales.filter(depa => {
        // En la Capa 3 trabajamos con el precio original de la lista
        const precioAComparar = depa.precio_soles; 
        const cumplePrecio = precioAComparar >= minPrecio && (maxPrecio === Infinity || precioAComparar <= maxPrecio);
        const cumpleDorms = cuartos === 0 || depa.dormitorios >= cuartos;
        const cumpleBanos = banos === 0 || depa.banos >= banos;
        const cumpleArea = depa.area_m2 >= minArea && (maxArea === Infinity || depa.area_m2 <= maxArea);
        
        return cumplePrecio && cumpleDorms && cumpleBanos && cumpleArea;
    });

    procesarTarjetas(datosFiltrados);
}

// Deduplica y dibuja las tarjetas
function procesarTarjetas(datosBrutos) {
    const cajaTarjetas = document.getElementById('caja-tarjetas');
    cajaTarjetas.classList.remove('oculto');
    cajaTarjetas.innerHTML = `<h2>🏆 CAPA 2 y 3: Resultados Unificados</h2>`;
    
    let depasUnicos = [];

    datosBrutos.forEach(depa => {
        let duplicadoEncontrado = depasUnicos.find(unico => {
            const mismoDistrito = unico.distrito === depa.distrito;
            const mismosCuartos = unico.dormitorios === depa.dormitorios;
            const mismosBanos = unico.banos === depa.banos;
            const areaSimilar = Math.abs(unico.area_m2 - depa.area_m2) <= 2;
            return mismoDistrito && mismosCuartos && mismosBanos && areaSimilar;
        });

        if (duplicadoEncontrado) {
            duplicadoEncontrado.enlaces.push({
                portal: depa.portal,
                url: depa.enlace,
                precio: depa.precio_soles
            });
            if (depa.precio_soles < duplicadoEncontrado.mejor_precio) {
                duplicadoEncontrado.mejor_precio = depa.precio_soles;
            }
        } else {
            depasUnicos.push({
                distrito: depa.distrito,
                dormitorios: depa.dormitorios,
                banos: depa.banos,
                area_m2: depa.area_m2,
                mejor_precio: depa.precio_soles,
                enlaces: [ { portal: depa.portal, url: depa.enlace, precio: depa.precio_soles } ],
                fecha: depa.fecha
            });
        }
    });

    if(depasUnicos.length === 0){
        cajaTarjetas.innerHTML += `<p>No hay depas que coincidan con estos filtros.</p>`;
        return;
    }

    // Dibujar tarjetas
    depasUnicos.forEach(depa => {
        const tarjeta = document.createElement('div');
        tarjeta.style.border = "1px solid #ccc";
        tarjeta.style.padding = "15px";
        tarjeta.style.marginTop = "15px";
        tarjeta.style.borderRadius = "8px";
        tarjeta.style.background = "#fff";

        const precioFormateado = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(depa.mejor_precio);
        
        let botonesHTML = '';
        depa.enlaces.forEach(enlace => {
            const precioPortal = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(enlace.precio);
            botonesHTML += `<a href="${enlace.url}" target="_blank" style="display:inline-block; padding:5px 10px; margin:5px 5px 0 0; background:#0056b3; color:white; text-decoration:none; border-radius:4px; font-size:0.9em;">
                ${enlace.portal} (${precioPortal})
            </a>`;
        });

        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; color:#28a745;">${precioFormateado} <span style="font-size:0.6em; color:#666;">(Mejor Precio)</span></h3>
                <span style="background:#eee; padding:3px 8px; border-radius:10px; font-size:0.8em; text-transform:uppercase;">${depa.distrito}</span>
            </div>
            <p style="margin:10px 0;">
                🛏️ ${depa.dormitorios} Dorms. | 🚽 ${depa.banos} Baños | 📐 ${depa.area_m2} m² 
            </p>
            <div>${botonesHTML}</div>
        `;
        cajaTarjetas.appendChild(tarjeta);
    });
}

function actualizarPanelEstado(datos) {
    const panel = document.getElementById('panel-estado');
    const lista = document.getElementById('lista-estado');
    panel.classList.remove('oculto');
    
    const conteo = {};
    datos.forEach(d => { conteo[d.portal] = (conteo[d.portal] || 0) + 1; });

    lista.innerHTML = '';
    for (const [portal, cantidad] of Object.entries(conteo)) {
        lista.innerHTML += `<li>✅ ${portal}: ${cantidad} avisos</li>`;
    }
}