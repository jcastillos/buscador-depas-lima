document.getElementById('btnBuscar').addEventListener('click', () => {
    // 1. Recolectar distrito (la URL básica de los portales se basa en el distrito)
    const selectorDistrito = document.getElementById('distrito');
    const distritos = Array.from(selectorDistrito.selectedOptions).map(opt => opt.value);
    
    // Si no elige distrito, por defecto usamos 'lima'
    const distritoQuery = distritos.length > 0 ? distritos[0].replace(' ', '-') : 'lima'; 

    // 2. Armar las URLs base (Solo los 4 portales aprobados)
    let urlUrbania = `https://urbania.pe/buscar/venta-de-departamentos-en-${distritoQuery}`;
    let urlAdonde = `https://www.adondeyvivir.com/departamentos-en-venta-en-${distritoQuery}.html`;
    let urlProperati = `https://www.properati.com.pe/s/${distritoQuery}/departamento/venta`;
    let urlMitula = `https://departamentos.mitula.pe/searchRE/q-${distritoQuery}`;

    // 3. Crear los botones en pantalla
    const contenedor = document.getElementById('botones-portales');
    contenedor.innerHTML = ''; // Limpiar botones anteriores

    const portales = [
        { nombre: 'Urbania', url: urlUrbania },
        { nombre: 'Adonde Vivir', url: urlAdonde },
        { nombre: 'Properati', url: urlProperati },
        { nombre: 'Mitula', url: urlMitula }
    ];

    portales.forEach(portal => {
        const btn = document.createElement('a');
        btn.href = portal.url;
        btn.target = "_blank"; // Abre en pestaña nueva
        btn.className = "btn-portal";
        btn.innerText = `🔗 Abrir en ${portal.nombre}`;
        contenedor.appendChild(btn);
    });

    const btnTodos = document.createElement('button');
    btnTodos.className = "btn-portal btn-todos";
    btnTodos.innerText = "🚀 Abrir TODOS a la vez";
    btnTodos.onclick = () => {
        alert("⚠️ ATENCIÓN: Tu navegador puede bloquear las pestañas múltiples.\nSi ves un icono rojo en la barra de direcciones arriba a la derecha, haz clic en él y selecciona 'Permitir siempre'.");
        portales.forEach(p => window.open(p.url, '_blank'));
    };
    contenedor.appendChild(btnTodos);

    // 4. Mostrar advertencia sobre los filtros manuales vs automáticos
    const advertencia = document.getElementById('advertencia-filtros');
    advertencia.classList.remove('oculto');
    advertencia.innerHTML = `
        <strong>💡 Nota sobre los Enlaces:</strong><br>
        La Capa 1 solo aplica el Distrito en la URL. Los filtros de Precio, Dormitorios, Baños y Área tendrás que aplicarlos manualmente en la página del portal.<br>
        <em>¡No te preocupes! En la Capa 2 (que construiremos pronto), nuestro sistema se encargará de aplicar los 5 filtros automáticamente y mostrarte el mejor precio si un depa está duplicado.</em>
    `;
});

// --- INICIO DE LA CAPA 2 y 3 (Lectura y Deduplicación) ---

// Función para cargar los datos del robot al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    fetch('data/resultados.json')
        .then(response => {
            if (!response.ok) throw new Error("No hay datos aún");
            return response.json();
        })
        .then(datos => {
            procesarTarjetas(datos);
            actualizarPanelEstado(datos);
        })
        .catch(error => {
            console.log("Capa 2 inactiva o sin datos:", error);
            document.getElementById('caja-tarjetas').classList.add('oculto');
        });
});

function procesarTarjetas(datosBrutos) {
    const cajaTarjetas = document.getElementById('caja-tarjetas');
    cajaTarjetas.classList.remove('oculto');
    cajaTarjetas.innerHTML = `<h2>🏆 CAPA 2: Resultados Unificados</h2>`;
    
    // DEDUPLICACIÓN
    let depasUnicos = [];

    datosBrutos.forEach(depa => {
        let duplicadoEncontrado = depasUnicos.find(unico => {
            // CRITERIO DE SIMILITUD: Mismo distrito, cuartos, baños y área similar (margen 2m2)
            const mismoDistrito = unico.distrito === depa.distrito;
            const mismosCuartos = unico.dormitorios === depa.dormitorios;
            const mismosBanos = unico.banos === depa.banos;
            const areaSimilar = Math.abs(unico.area_m2 - depa.area_m2) <= 2;
            
            return mismoDistrito && mismosCuartos && mismosBanos && areaSimilar;
        });

        if (duplicadoEncontrado) {
            // ¡Es un duplicado! Añadimos el enlace y comparamos el precio
            duplicadoEncontrado.enlaces.push({
                portal: depa.portal,
                url: depa.enlace,
                precio: depa.precio_soles
            });

            // Actualiza el mejor precio si este es más barato
            if (depa.precio_soles < duplicadoEncontrado.mejor_precio) {
                duplicadoEncontrado.mejor_precio = depa.precio_soles;
            }
        } else {
            // Es un depa nuevo
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

    // DIBUJAR LAS TARJETAS
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
            <p style="font-size:0.85em; color:#555;">Encontrado en ${depa.enlaces.length} portal(es):</p>
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