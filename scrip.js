// =================================================================
// DECLARACIONES GLOBALES
// =================================================================
const carrito = document.getElementById('carrito'); 
const lista = document.querySelector('#lista-carrito tbody'); 
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

// Inicializa el sistema al cargar la página
document.addEventListener('DOMContentLoaded', cargarCarritoDesdeStorage);
cargarEventListeners();

// =================================================================
// FUNCIÓN PRINCIPAL DE LISTENERS Y NAVEGACIÓN
// =================================================================
function cargarEventListeners() {
    // Buscamos todas las posibles listas de productos en CUALQUIER página
    const listasProductos = document.querySelectorAll('#lista-1, #lista-xv, #lista-bodas, #lista-ninos');
    
    // Añadir el listener 'comprarElemento' a todas las secciones de productos
    listasProductos.forEach(lista => {
        if (lista) {
            lista.addEventListener('click', comprarElemento);
        }
    });

    // Escuchador para ELIMINAR y VACIAR en el carrito desplegable
    if (carrito) {
        carrito.addEventListener('click', eliminarElemento);
    }
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    }
    
    /// 🚨 LÓGICA CLAVE: BOTÓN "IR A PAGAR" (#ir-a-checkout) 
    const botonCheckout = document.getElementById('ir-a-checkout');
    if (botonCheckout) {
        botonCheckout.addEventListener('click', function(e) {
            e.preventDefault(); 
            const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
            
            if (carritoActual.length === 0) {
                alert("🛒 Tu carrito está vacío. Agrega productos para pagar.");
            } else {
                // FORZAMOS LA REDIRECCIÓN si el carrito NO está vacío
                window.location.href = 'pedido.html';
            }
        });
    }

    // Lógica específica para la página de checkout (pedido.html)
    if (document.querySelector('.checkout-page')) {
        setupCheckoutPage();
    }
    
    // Lógica para el botón de subir y modales
    setupBotonSubir();
    setupFooterModals();
    setupHeaderModals();
}

// =================================================================
// LÓGICA DEL CARRITO (AÑADIR, LEER, ELIMINAR, GUARDAR)
// =================================================================

function comprarElemento(e) {
    e.preventDefault();
    if (e.target.classList.contains('agregar-carrito')) {
        const producto = e.target.closest('.product');
        const infoElemento = leerDatosElemento(producto);
        insertarCarrito(infoElemento);
    }
}

function leerDatosElemento(producto) {
    return {
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h3').textContent,
        precio: parseFloat(producto.querySelector('.precio').textContent.replace('$', '')), 
        id: producto.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    };
}

function insertarCarrito(elemento) {
    const targetList = document.querySelector('#lista-carrito tbody');
    if (!targetList) return; 

    const rows = targetList.querySelectorAll('tr');
    let encontrado = false;
    for (let row of rows) {
        if (row.querySelector('.borrar')?.getAttribute('data-id') === elemento.id) {
            const cantidadCell = row.querySelector('.cantidad');
            const subtotalCell = row.querySelector('.subtotal');
            const nuevaCantidad = parseInt(cantidadCell.textContent) + 1;
            cantidadCell.textContent = nuevaCantidad;
            subtotalCell.textContent = `$${Math.round(nuevaCantidad * elemento.precio)}`;
            encontrado = true;
            break;
        }
    }

    if (!encontrado) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${elemento.imagen}" width="60"></td>
            <td>${elemento.titulo}</td>
            <td>$${Math.round(elemento.precio)}</td>
            <td class="cantidad">1</td>
            <td class="subtotal">$${Math.round(elemento.precio)}</td>
            <td><a href="#" class="borrar" data-id="${elemento.id}">X</a></td>
        `;
        targetList.appendChild(row);
    }
    guardarCarrito();
    actualizarTotal();
}

function eliminarElemento(e) {
    e.preventDefault();
    if (e.target.classList.contains('borrar')) {
        const row = e.target.closest('tr');
        if (row) {
            row.remove();
            guardarCarrito();
            actualizarTotal();
            if (document.querySelector('.checkout-page')) {
                actualizarTotalCheckout();
            }
        }
    }
}

function vaciarCarrito() {
    const targetList = document.querySelector('#lista-carrito tbody');
    if (targetList) {
        while (targetList.firstChild) {
            targetList.removeChild(targetList.firstChild);
        }
    }
    localStorage.removeItem('carrito');
    actualizarTotal();
    
    if (document.querySelector('.checkout-page')) {
        alert("Carrito vaciado. Regresando a la página principal.");
        window.location.href = 'index.html';
    }
}

function guardarCarrito() {
    const targetList = document.querySelector('#lista-carrito tbody');
    if (!targetList) return; 
    
    const productos = [];
    targetList.querySelectorAll('tr').forEach(row => {
        const idElement = row.querySelector('.borrar');
        if (idElement) {
            productos.push({
                imagen: row.querySelector('img')?.src || '',
                titulo: row.cells[1].textContent,
                precio: parseFloat(row.cells[2].textContent.replace('$', '')),
                cantidad: parseInt(row.querySelector('.cantidad').textContent),
                id: idElement.getAttribute('data-id')
            });
        }
    });
    localStorage.setItem('carrito', JSON.stringify(productos));
}

function cargarCarritoDesdeStorage() {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    const targetList = document.querySelector('#lista-carrito tbody'); 
    
    if (!targetList) return; 

    carritoGuardado.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.imagen}" width="60"></td>
            <td>${producto.titulo}</td>
            <td>$${Math.round(producto.precio)}</td>
            <td class="cantidad">${Math.round(Number(producto.cantidad))}</td>
            <td class="subtotal">$${Math.round(producto.precio * producto.cantidad)}</td>
            <td><a href="#" class="borrar" data-id="${producto.id}">X</a></td>
        `;
        targetList.appendChild(row);
    });
    actualizarTotal();
}

function actualizarTotal() {
    const totalCarritoDisplay = document.getElementById('total-carrito');
    const targetList = document.querySelector('#lista-carrito tbody');
    if (!totalCarritoDisplay || !targetList) return; 

    let total = 0;
    targetList.querySelectorAll('tr').forEach(row => {
        const subtotalText = row.querySelector('.subtotal')?.textContent;
        if (subtotalText) {
            const subtotal = parseFloat(subtotalText.replace('$', ''));
            total += Math.round(subtotal); 
        }
    });
    totalCarritoDisplay.textContent = `$${total}`;
}

// =================================================================
// LÓGICA EXCLUSIVA DE CHECKOUT (pedido.html) Y CONEXIÓN A BACKEND
// =================================================================

function actualizarTotalCheckout() {
    const totalCheckoutDisplay = document.getElementById('total-carrito-checkout');
    if (!totalCheckoutDisplay) return;

    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = 0;
    carritoGuardado.forEach(producto => {
        total += producto.precio * producto.cantidad;
    });

    totalCheckoutDisplay.textContent = `$${Math.round(total)}`;
}

function setupCheckoutPage() {
    const listaCheckout = document.querySelector('#lista-carrito-checkout tbody');
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido-btn');
    
    // Redirigir si el carrito está vacío
    if (carritoGuardado.length === 0) {
        alert("Tu carrito está vacío. Regresando a la página de productos.");
        window.location.href = 'index.html';
        return;
    }
    
    // Llenar la tabla de checkout
    listaCheckout.innerHTML = ''; 
    carritoGuardado.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.imagen}" width="60"></td>
            <td>${producto.titulo}</td>
            <td>$${Math.round(producto.precio)}</td>
            <td class="cantidad">${Math.round(Number(producto.cantidad))}</td>
            <td class="subtotal">$${Math.round(producto.precio * producto.cantidad)}</td>
            <td><a href="#" class="borrar" data-id="${producto.id}">X</a></td>
        `;
        listaCheckout.appendChild(row);
    });
    actualizarTotalCheckout(); 
    
    // Añadimos el listener de eliminar también a la tabla de checkout
    document.querySelector('#lista-carrito-checkout').addEventListener('click', eliminarElemento);

    // Conectar el botón al Backend
    confirmarPedidoBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        if (confirmarPedidoBtn.disabled) return; 

        confirmarPedidoBtn.disabled = true;
        confirmarPedidoBtn.textContent = "⚙️ Procesando...";

        // 🚨 Captura de datos con valores por defecto para evitar NULL/vacío en MySQL
        const clienteNombre = document.getElementById('cliente-nombre')?.value.trim() || "N/A";
        const whatsappCliente = document.getElementById('whatsapp-cliente')?.value.trim() || "0"; 
        const personalizacion = document.getElementById('personalizacion')?.value.trim() || "Ninguna"; 
        const lugarEntrega = document.getElementById('lugar-entrega')?.value.trim() || "N/A";
        const horarioEntrega = document.getElementById('horario-entrega')?.value.trim() || "N/A";
        const formaPago = document.getElementById('forma-pago')?.value || "Efectivo"; 

        
        const carritoFinal = JSON.parse(localStorage.getItem('carrito')) || [];

        // Validación estricta de campos obligatorios
        if (carritoFinal.length === 0 || clienteNombre === "N/A" || whatsappCliente === "0" || lugarEntrega === "N/A" || horarioEntrega === "N/A" || formaPago === "N/A") {
            alert("❌ ¡Faltan datos! Por favor, completa tu Nombre, WhatsApp, Lugar y Horario de entrega.");
            confirmarPedidoBtn.disabled = false;
            confirmarPedidoBtn.textContent = "✅ Confirmar y Enviar Pedido";
            return;
        }

        // Cálculo del total (Asegura formato decimal fijo para la DB)
        let totalPedido = carritoFinal.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
        totalPedido = parseFloat(totalPedido.toFixed(2)); // Formato FLOAT/DECIMAL para MySQL

        const datosPedido = {
            cliente_nombre: clienteNombre,
            whatsapp: whatsappCliente,
            total_pedido: totalPedido, 
            personalizacion: personalizacion,
            lugar_entrega: lugarEntrega,
            horario_entrega: horarioEntrega,
            forma_pago: formaPago,
            productos: carritoFinal 
        };
        
        const whatsappLink = document.querySelector(".whatsapp-float");
        const numeroTienda = whatsappLink ? whatsappLink.href.split('/').pop() : '7681083725';

        try {
            // Llama al Backend (Servidor Node.js)
            const respuesta = await fetch('http://localhost:3000/api/pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosPedido)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                
                // 🚀 SOLUCIÓN FINAL: Usamos %0A para saltos de línea y encodeURIComponent() para codificar toda la cadena.
                const mensajeBase = `*PEDIDO CONFIRMADO EN DB*%0A%0A¡Hola Monicakes! Pedido No. ${resultado.pedido_id} a nombre de ${clienteNombre} enviado.%0A%0ARevisar la base de datos para los detalles. Cliente espera confirmación en WhatsApp: ${whatsappCliente}.`;
                
                // Aplicamos encodeURIComponent a la cadena que ya contiene los saltos de línea codificados (%0A)
                const urlWhatsAppConfirmacion = `https://wa.me/${numeroTienda}?text=${encodeURIComponent(mensajeBase)}`;
                
                // 1. Abrir la ventana de WhatsApp
                window.open(urlWhatsAppConfirmacion, '_blank'); 
                
                // 2. Limpiar el carrito
                localStorage.removeItem('carrito');
                
                // 3. Notificación y Redirección
                setTimeout(() => {
                    alert(`✅ ¡Pedido #${resultado.pedido_id} guardado con éxito! Serás redirigido al inicio. ¡Gracias!`); 
                    window.location.href = 'index.html';
                }, 1000); 

            } else {
                alert(`❌ Error al guardar el pedido: ${resultado.error}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            alert("⚠️ Error de conexión. Asegúrate de que el servidor Node.js esté corriendo en http://localhost:3000");
        } finally {
            confirmarPedidoBtn.disabled = false;
            confirmarPedidoBtn.textContent = "✅ Confirmar y Enviar Pedido";
        }
    });
}

// =================================================================
// LÓGICA DE UTILIDAD (MODALES, BOTÓN DE SUBIR)
// =================================================================

function setupBotonSubir() {
    const btnArriba = document.getElementById("btn-arriba");
    if (btnArriba) {
        window.addEventListener("scroll", function() {
            if (window.scrollY > 500) { 
                btnArriba.style.opacity = "1";
            } else {
                btnArriba.style.opacity = "0";
            }
        });
        btnArriba.addEventListener("click", function() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// Lógica para los modales de Información (header)
function setupHeaderModals() {
    const botonesInfo = document.querySelectorAll('#btn-informacion');
    const textosInfo = {
        "index": `<h2>Información</h2><p>Bienvenido a Monicakes❤️, descubre nuestros mejores productos.</p>`,
        // Agregar más textos para xv, bodas, etc.
    };
    
    let modalInfo = document.querySelector('.modal-info-header');
    if (!modalInfo) {
        modalInfo = document.createElement('div');
        modalInfo.classList.add('modal', 'modal-info-header');
        modalInfo.innerHTML = `<div id="modal-content-info"></div><button class="cerrar">Cerrar</button>`;
        document.body.appendChild(modalInfo);
    }

    const modalContentInfo = document.getElementById('modal-content-info');
    const botonCerrarInfo = modalInfo.querySelector('.cerrar');

    botonesInfo.forEach(boton => {
        boton.addEventListener('click', function (e) {
            e.preventDefault();
            const seccion = boton.getAttribute("data-seccion") || "index";
            modalContentInfo.innerHTML = textosInfo[seccion] || textosInfo["index"];
            modalInfo.classList.add('active');
        });
    });

    botonCerrarInfo.addEventListener('click', function () {
        modalInfo.classList.remove('active');
    });
}

// Lógica para los modales del Footer
function setupFooterModals() {
    const enlacesFooter = document.querySelectorAll('.footer a[data-id]');
    const textos = {
        "historia": `<h2>Historia</h2><p>Moni Cakes nació de la pasión por la repostería...</p>`,
        "mision": `<h2>Misión</h2><p>Brindar productos de repostería personalizados...</p>`,
        "vision": `<h2>Visión</h2><p>Ser la pastelería líder en pedidos personalizados...</p>`,
        "pasteles": `<h2>Pasteles personalizados</h2><p>Nuestros pasteles están diseñados para cada ocasión especial...</p>`,
        "eventos": `<h2>Eventos</h2><p>Ofrecemos servicio para bodas, quinceañeras, cumpleaños...</p>`,
        "entregas": `<h2>Entregas</h2><p>Garantizamos entregas seguras y rápidas...</p>`,
        "preguntas": `<h2>Preguntas Frecuentes</h2><p>Respuestas a dudas comunes...</p>`,
        "terminos": `<h2>Términos</h2><p>Conoce nuestras políticas y condiciones de compra...</p>`,
        "privacidad": `<h2>Privacidad</h2><p>Nos tomamos en serio la seguridad y protección de tus datos...</p>`,
        "ayuda": `<h2>Ayuda</h2><p>Soporte para clientes en cada etapa del pedido...</p>`
    };
    
    let modal = document.getElementById('modal-info');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-info';
        modal.classList.add('modal');
        modal.innerHTML = `<div id="modal-content"></div><button class="cerrar">Cerrar</button>`;
        document.body.appendChild(modal);
    }

    const modalContent = document.getElementById('modal-content');
    const botonCerrar = modal.querySelector('.cerrar');

    enlacesFooter.forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            e.preventDefault();
            const id = enlace.getAttribute('data-id');
            modalContent.innerHTML = textos[id] || "<h2>Error</h2><p>No se encontró la información.</p>";
            modal.classList.add('active');
        });
    });

    botonCerrar.addEventListener('click', function () {
        modal.classList.remove('active');
    });
}