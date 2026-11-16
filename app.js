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