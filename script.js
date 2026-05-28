window.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica de Nombres y Pases
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('n') || "Invitado Especial";
    const pases = params.get('p') || "1";

    document.getElementById('invitado-nombre').innerText = ` ${nombre}`;
    document.getElementById('invitado-pases').innerText = `Pase para ${pases} persona(s)`;

    // 2. Lógica de Animación al Scroll
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


    // ========================================================
    // 3. NUEVO: Lógica del Contador para el 30 de Agosto
    // ========================================================
    
    // Fecha meta: Año 2026, Mes 7 (Agosto), Día 30, 5:00 PM (17:00:00)
    const fechaBoda = new Date(2026, 7, 30, 18, 0, 0).getTime();

    const intervaloContador = setInterval(function() {
        const ahora = new Date().getTime();
        const distancia = fechaBoda - ahora;

        if (distancia > 0) {
            // Conversiones matemáticas de tiempo
            const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));

            // Forzamos el formato de dos dígitos (ej: "05" en vez de "5")
            const displayDias = dias < 10 ? "0" + dias : dias;
            const displayHoras = horas < 10 ? "0" + horas : horas;
            const displayMinutos = minutes = minutos < 10 ? "0" + minutos : minutos;

            // Inyectamos de forma segura en los IDs que creamos en el HTML
            document.getElementById("faltan-dias").innerText = displayDias;
            document.getElementById("faltan-horas").innerText = displayHoras;
            document.getElementById("faltan-minutos").innerText = displayMinutos;
        } else {
            // Freno de seguridad cuando la fecha llega a cero
            clearInterval(intervaloContador);
            document.getElementById("faltan-dias").innerText = "00";
            document.getElementById("faltan-horas").innerText = "00";
            document.getElementById("faltan-minutos").innerText = "00";
        }
    }, 1000); // Se repite este ciclo cada 1 segundo

}); // <-- Esta es la llave que cierra TODO el archivo de forma segura

// =========================================================================
// INTERACTIVIDAD DE LA SECCIÓN 7: MODALES DE REGALOS Y DATOS DE PAGO
// =========================================================================

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. CAPTURA DE ELEMENTOS DEL HTML
    // Botones principales del lienzo
    const btnAbrirRegalos = document.getElementById("btn-abrir-regalos");
    const btnAbrirPago = document.getElementById("btn-abrir-pago");
    
    // Ventanas flotantes (Modales)
    const modalRegalos = document.getElementById("modal-regalos");
    const modalPago = document.getElementById("modal-pago");
    
    // Botones Equis de cierre internos
    const btnCerrarRegalos = document.getElementById("btn-cerrar-regalos");
    const btnCerrarPago = document.getElementById("btn-cerrar-pago");


    // 2. FUNCIONES PARA ABRIR LAS VENTANAS
    // Al hacer clic en la ilustración de la lista (L3)
    if (btnAbrirRegalos && modalRegalos) {
        btnAbrirRegalos.addEventListener("click", function() {
            modalRegalos.classList.remove("rsvp-oculto");
            document.body.style.overflow = "hidden"; // Bloquea el scroll del fondo por elegancia
        });
    }

    // Al hacer clic en la ilustración del dinero (L4)
    if (btnAbrirPago && modalPago) {
        btnAbrirPago.addEventListener("click", function() {
            modalPago.classList.remove("rsvp-oculto");
            document.body.style.overflow = "hidden"; // Bloquea el scroll del fondo
        });
    }


    // 3. FUNCIONES PARA CERRAR LAS VENTANAS
    // Al pulsar la equis de la lista de regalos (L1.1)
    if (btnCerrarRegalos && modalRegalos) {
        btnCerrarRegalos.addEventListener("click", function() {
            modalRegalos.classList.add("rsvp-oculto");
            document.body.style.overflow = "auto"; // Devuelve el scroll normal a la invitación
        });
    }

    // Al pulsar la equis de los datos de pago (L2.1)
    if (btnCerrarPago && modalPago) {
        btnCerrarPago.addEventListener("click", function() {
            modalPago.classList.add("rsvp-oculto");
            document.body.style.overflow = "auto"; // Devuelve el scroll normal
        });
    }

    // OPCIONAL: Cerrar el modal si el invitado hace clic afuera de la tarjeta (en la zona oscura)
    window.addEventListener("click", function(evento) {
        if (evento.target === modalRegalos) {
            modalRegalos.classList.add("rsvp-oculto");
            document.body.style.overflow = "auto";
        }
        if (evento.target === modalPago) {
            modalPago.classList.add("rsvp-oculto");
            document.body.style.overflow = "auto";
        }
    });

});

// =========================================================================
// CONEXIÓN VIVA CON LA API DE GOOGLE SHEETS (LISTA DE REGALOS)
// =========================================================================

const URL_API_REGALOS = "https://script.google.com/macros/s/AKfycbxBsmRgYmp8gsURi2Jry2eDxtnt2ynTPkHsIdREmo9LfEUGpuZ3zLF8_fD-LELqfy-KkQ/exec";

document.addEventListener("DOMContentLoaded", function() {
    // Captura de los elementos interactivos del formulario
    const btnAbrirRegalos = document.getElementById("btn-abrir-regalos");
    const selectSugeridos = document.getElementById("select-regalos-sugeridos");
    const listaReservados = document.getElementById("lista-regalos-reservados");
    const formRegalo = document.getElementById("form-registrar-regalo");
    const inputLibre = document.getElementById("input-regalo-libre");
    const textoBotonSubmit = document.querySelector(".texto-interno-btn");
    const btnSubmitRegalo = document.getElementById("btn-confirmar-regalo");

    // Lógica interna: Escuchar si el usuario cambia entre la lista o escribir un regalo diferente
    // Si escribe en el cuadro libre, deseleccionamos el menú desplegable por seguridad
    if (inputLibre) {
        inputLibre.addEventListener("input", function() {
            if (this.value.trim() !== "") {
                selectSugeridos.value = ""; 
            }
        });
    }
    // Si cambia el menú desplegable, limpiamos el cuadro de texto libre
    if (selectSugeridos) {
        selectSugeridos.addEventListener("change", function() {
            if (this.value !== "") {
                inputLibre.value = "";
            }
        });
    }

    // FUNCIÓN 1: Cargar y renderizar los datos desde Google Sheets
    function cargarRegalosDesdeSheets() {
        if (!listaReservados || !selectSugeridos) return;

        // Colocamos el estado de carga con tu fuente artística
        listaReservados.innerHTML = '<li class="cargando-regalos">Cargando lista de regalos...</li>';
        selectSugeridos.innerHTML = '<option value="">Cargando opciones disponibles...</option>';

        fetch(URL_API_REGALOS)
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.status === "success") {
                    // 1. Pintar los regalos ya Ocupados/Reservados en el cuadro central beige
                    listaReservados.innerHTML = ""; // Limpiamos el mensaje de carga
                    if (datos.reservados.length === 0) {
                        listaReservados.innerHTML = '<li>Aún no hay regalos apartados. ¡Sé el primero!</li>';
                    } else {
                        datos.reservados.forEach(item => {
                            const li = document.createElement("li");
                            li.textContent = `🎁 ${item.articulo} (Reservado)`;
                            listaReservados.appendChild(li);
                        });
                    }

                    // 2. Llenar el Menú Desplegable con los regalos que siguen Disponibles
                    selectSugeridos.innerHTML = '<option value="">-- Selecciona un regalo de la lista --</option>';
                    datos.disponibles.forEach(item => {
                        const opcion = document.createElement("option");
                        opcion.value = item.id; // Guardamos el ID interno de la fila
                        opcion.textContent = item.articulo;
                        selectSugeridos.appendChild(opcion);
                    });
                } else {
                    listaReservados.innerHTML = '<li>Error al cargar los regalos.</li>';
                }
            })
            .catch(error => {
                console.error("Error en petición GET:", error);
                listaReservados.innerHTML = '<li>No se pudo conectar con la base de datos.</li>';
            });
    }

    // Ejecutar la carga automáticamente cuando el invitado abra el menú de regalos (L3)
    if (btnAbrirRegalos) {
        btnAbrirRegalos.addEventListener("click", cargarRegalosDesdeSheets);
    }

    // FUNCIÓN 2: Procesar el envío del formulario al hacer clic en "Añadir Regalo"
    if (formRegalo) {
        formRegalo.addEventListener("submit", function(evento) {
            evento.preventDefault(); // Evitamos que la página se refresque o parpadee

            let datosAEnviar = {};
            const valorSugerido = selectSugeridos.value;
            const valorLibre = inputLibre.value.trim();

            // Validación básica local: ¿El usuario seleccionó o escribió algo?
            if (!valorSugerido && !valorLibre) {
                alert("Por favor, selecciona un regalo de la lista o escribe uno diferente en el cuadro de texto.");
                return;
            }

            // Estructuramos el paquete JSON según la lógica que programamos en tu Apps Script
            if (valorSugerido) {
                datosAEnviar = {
                    tipo: "sugerido",
                    id: valorSugerido
                };
            } else if (valorLibre) {
                datosAEnviar = {
                    tipo: "libre",
                    articulo: valorLibre
                };
            }

            // Bloqueamos el botón de madera cambiando el texto para evitar doble envío
            if (textoBotonSubmit) textoBotonSubmit.textContent = "Guardando...";
            if (btnSubmitRegalo) btnSubmitRegalo.disabled = true;

            // Enviamos el paquete POST a Google Apps Script
            fetch(URL_API_REGALOS, {
                method: "POST",
                mode: "no-cors", // Requerido por seguridad para comunicarse de forma anónima con Google Macros
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosAEnviar)
            })
            .then(() => {
                // Al usar "no-cors" el navegador no lee la respuesta de éxito directo, 
                // pero si no salta al catch es porque se guardó de forma correcta.
                if (textoBotonSubmit) textoBotonSubmit.textContent = "¡Listo!";
                alert("¡Muchas gracias! Tu detalle ha sido registrado y reservado con éxito.");
                
                // Limpiamos los campos del formulario
                formRegalo.reset();
                if (inputLibre) inputLibre.value = "";
                
                // Esperamos un segundo para devolver el botón a su estado normal y refrescar la lista viva
                setTimeout(() => {
                    if (textoBotonSubmit) textoBotonSubmit.textContent = "Añadir Regalo";
                    if (btnSubmitRegalo) btnSubmitRegalo.disabled = false;
                    cargarRegalosDesdeSheets(); // Refresca el cuadro de scroll en vivo
                }, 1200);
            })
            .catch(error => {
                console.error("Error en petición POST:", error);
                alert("Hubo un problema al intentar guardar la reserva. Inténtalo de nuevo.");
                if (textoBotonSubmit) textoBotonSubmit.textContent = "Añadir Regalo";
                if (btnSubmitRegalo) btnSubmitRegalo.disabled = false;
            });
        });
    }
});

// =========================================================================
// INTERACTIVIDAD Y ENLACE CON LA API RSVP (BODA HEN & KER)
// =========================================================================

const URL_API_RSVP = "https://script.google.com/macros/s/AKfycbz9t79ISLAHOtnNvqcW6clkvOQVo5gKxu3wzcu0pb3CfvpP-5WoOUeGzx8zczU9wTcvdA/exec";

document.addEventListener("DOMContentLoaded", function() {
    // --- BOTONES DEL LIENZO PRINCIPAL S8 ---
    const btnPrincipalYes = document.getElementById("btn-principal-yes");
    const btnPrincipalNo = document.getElementById("btn-principal-no");

    // --- MODALES Y CAPAS (OVERLAYS) ---
    const modalFormulario = document.getElementById("modal-rsvp-form");
    const modalRechazo = document.getElementById("modal-rsvp-rechazo");
    const modalBienvenida = document.getElementById("modal-rsvp-nvelb");

    // --- ELEMENTOS DEL FORMULARIO INTERNO ---
    const formRsvp = document.getElementById("form-boda-rsvp");
    const inputNombre = document.getElementById("rsvp-input-nombre");
    const selectPases = document.getElementById("rsvp-select-pases");
    const btnSubmitRsvp = document.getElementById("btn-submit-rsvp");
    const textoSubmitRsvp = btnSubmitRsvp ? btnSubmitRsvp.querySelector(".texto-btn-confirmar") : null;

    // --- BOTÓN EXCLUSIVO DE ZOOM (DENTRO DEL CARTEL NO) ---
    const btnEnlaceZoom = document.getElementById("btn-enlace-zoom");

    // --- EQUIS DE CIERRES ---
    const btnCerrarForm = document.getElementById("btn-cerrar-rsvp-form");
    const btnCerrarRechazo = document.getElementById("btn-cerrar-rechazo");
    const btnCerrarBienvenida = document.getElementById("btn-cerrar-nvelb");

    // Variables globales internas para almacenar los datos extraídos de la URL
    let nombreInvitado = "";
    let pasesMaximos = 1;
    let rsvpExpirado = false;
    let yaRegistradoPreviamente = false;

    // -------------------------------------------------------------------------
    // PASO 1: LECTURA DE PARÁMETROS DINÁMICOS DESDE LA URL DE LA INVITACIÓN
    // -------------------------------------------------------------------------
    function obtenerParametrosInvitacion() {
        const parametros = new URLSearchParams(window.location.search);
        
        // Extraemos '?name=' y '?pases='
        nombreInvitado = parametros.get("n") ? parametros.get("n").trim() : "";
        pasesMaximos = parseInt(parametros.get("p")) || 1;

        if (nombreInvitado !== "" && inputNombre) {
            // Asignamos el nombre al campo bloqueado del pergamino
            inputNombre.value = nombreInvitado;
            // Ejecutamos la validación anti-duplicados y fecha límite con el servidor
            verificarEstadoInvitacion();
        } else if (inputNombre) {
            inputNombre.value = "Invitación Personal Individual";
        }
    }

    // -------------------------------------------------------------------------
    // PASO 2: CHEQUEO PREVIO CON LA API (FECHA LÍMITE Y DUPLICADOS)
    // -------------------------------------------------------------------------
    function verificarEstadoInvitacion() {
        // Consultamos al GET de tu Apps Script mandando el nombre de la invitación
        fetch(`${URL_API_RSVP}?name=${encodeURIComponent(nombreInvitado)}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "expired") {
                    rsvpExpirado = true;
                    alert("El tiempo límite para confirmar asistencia a la boda expiró el 30 de Junio.");
                } else if (data.status === "registered") {
                    yaRegistradoPreviamente = true;
                }
            })
            .catch(err => console.error("Error al validar estado en el GET de la API:", err));
    }

    // -------------------------------------------------------------------------
    // PASO 3: CONTROL DE FLUJO INTERACTIVO AL HACER CLIC
    // -------------------------------------------------------------------------

    // ACCIÓN AL PRESIONAR SÍ (YES - S8_L7)
    if (btnPrincipalYes) {
        btnPrincipalYes.addEventListener("click", function() {
            // Validaciones preventivas de seguridad
            if (rsvpExpirado) {
                alert("Disculpa, el tiempo de confirmación ya expiró (Límite: 30 de Junio).");
                return;
            }
            if (yaRegistradoPreviamente) {
                alert("Esta invitación ya se encuentra confirmada en el sistema.");
                return;
            }

            // Generar dinámicamente las opciones del select según sus pases máximos permitidos
            if (selectPases) {
                selectPases.innerHTML = '<option value="">Selecciona pases...</option>';
                for (let i = 1; i <= pasesMaximos; i++) {
                    const opt = document.createElement("option");
                    opt.value = i;
                    opt.textContent = `${i} ${i === 1 ? 'Persona' : 'Personas'}`;
                    selectPases.appendChild(opt);
                }
            }

            // Mostramos el pergamino del formulario removiendo la clase oculta
            if (modalFormulario) modalFormulario.classList.remove("rsvp-oculto");
        });
    }

    // ACCIÓN AL PRESIONAR NO (NO - S8_L8)
    if (btnPrincipalNo) {
        btnPrincipalNo.addEventListener("click", function() {
            if (rsvpExpirado) {
                alert("Disculpa, el tiempo de confirmación ya expiró.");
                return;
            }
            // Abrimos directamente el cartel de "Te extrañaremos..." con el botón de Zoom
            if (modalRechazo) modalRechazo.classList.remove("rsvp-oculto");
        });
    }

    // CONTROL DEL BOTÓN DE TRANSMISIÓN DE ZOOM (S8_L1)
    if (btnEnlaceZoom) {
        btnEnlaceZoom.addEventListener("click", function() {
            // Aquí colocas el link definitivo a tu transmisión en vivo
            window.open("https://zoom.us/j/AQUI_TU_ID_DE_REUNION", "_blank");
        });
    }

    // ASIGNACIÓN DE FUNCIONES DE LAS EQUIS DE CIERRE
    if (btnCerrarForm) {
        btnCerrarForm.addEventListener("click", () => modalFormulario.classList.add("rsvp-oculto"));
    }
    if (btnCerrarRechazo) {
        btnCerrarRechazo.addEventListener("click", () => modalRechazo.classList.add("rsvp-oculto"));
    }
    if (btnCerrarBienvenida) {
        btnCerrarBienvenida.addEventListener("click", () => modalBienvenida.classList.add("rsvp-oculto"));
    }

    // -------------------------------------------------------------------------
    // PASO 4: PROCESAR EL ENVÍO DEL FORMULARIO (POST HACIA GOOGLE SHEETS)
    // -------------------------------------------------------------------------
    if (formRsvp) {
        formRsvp.addEventListener("submit", function(e) {
            e.preventDefault(); // Evitamos que la página parpadee o recargue

            // Paquete JSON con las respuestas de tus 5 preguntas estructuradas
            const payload = {
                nombre: inputNombre.value,
                pases: document.getElementById("rsvp-select-pases").value,
                vehiculo: document.getElementById("rsvp-select-vehiculo").value,
                hospedaje: document.getElementById("rsvp-select-hospedaje").value,
                alergias: document.getElementById("rsvp-input-alergias").value
            };

            // Bloqueamos el botón de madera cambiando el texto caligráfico para evitar reenvíos
            if (textoSubmitRsvp) textoSubmitRsvp.textContent = "Guardando...";
            if (btnSubmitRsvp) {
                btnSubmitRsvp.disabled = true;
                btnSubmitRsvp.style.opacity = "0.7";
            }

            // Enviamos los datos vía POST a tu Apps Script
            fetch(URL_API_RSVP, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8" // Evita problemas de CORS al comunicarse con Google Macros
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    // Si guardó con éxito: cerramos el papel y abrimos el cartel de bienvenida "¡Qué alegría!" (S8_L3)
                    if (modalFormulario) modalFormulario.classList.add("rsvp-oculto");
                    if (modalBienvenida) modalBienvenida.classList.remove("rsvp-oculto");
                    
                    formRsvp.reset();
                    yaRegistradoPreviamente = true; // Bloqueamos la sesión localmente
                } else if (data.status === "denied") {
                    alert("¡Atención! Este nombre ya se encuentra registrado en la lista de asistencia.");
                    if (modalFormulario) modalFormulario.classList.add("rsvp-oculto");
                } else {
                    alert("Hubo un error al procesar tu confirmación. Inténtalo de nuevo.");
                }
            })
            .catch(error => {
                console.error("Error al enviar el RSVP:", error);
                alert("No se pudo conectar con el servidor de confirmaciones.");
            })
            .finally(() => {
                // Devolvemos el botón de madera a su estado normal
                if (textoSubmitRsvp) textoSubmitRsvp.textContent = "Confirmar Asistencia";
                if (btnSubmitRsvp) {
                    btnSubmitRsvp.disabled = false;
                    btnSubmitRsvp.style.opacity = "1";
                }
            });
        });
    }

    // Inicializamos la lectura de la URL al cargar la página
    obtenerParametrosInvitacion();
});