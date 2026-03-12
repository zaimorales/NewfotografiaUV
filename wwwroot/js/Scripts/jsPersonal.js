document.addEventListener("DOMContentLoaded", function () {
    $('#ddlPersonal').val('5');

    var tblPersonal = new DataTable('#tblPersonal', {
        pageLength: 5,
        responsive: true,
        ordering: true,
        paging: true,
        searching: true,
        destroy: true,
        dom: 'rtip',
        lengthMenu: [
            [5, 10, 25],
            [5, 10, 25]
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
            info: 'Mostrando _START_ de _TOTAL_ empleados',
            lengthMenu: 'Ver _MENU_',
            infoEmpty: "No se encontraron empleados"
        }
    });

    $('#ddlPersonal').on('change', function () {
        tblPersonal.page.len(parseInt($(this).val())).draw();
    });

    $('#txtBuscarPersonal').on('keyup', function () {
        tblPersonal.search(this.value).draw();
    });
});

function fnMostrarAgregarEmpleado() {
    const modal = new bootstrap.Modal(document.getElementById("mdlAgregarEmpleado"));
    modal.show();
}

function empleado_EsJpgValido(file) {
    const maxSizeMB = 2;

    if (!file) return false;

    if (file.type !== "image/jpeg") return false;
    if (!file.name.toLowerCase().endsWith(".jpg")) return false;

    if (file.size > maxSizeMB * 1024 * 1024) {
        //alert(`La imagen no debe superar ${maxSizeMB} MB`);
        mostrarToast("La imagen no debe superar 2 MB", "warning");
        return false;
    }

    return true;
}

document.getElementById("frmAgregarEmpleado").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validar que haya una foto seleccionada
    const fotoInput = document.getElementById("fotoEmpleadoSeleccionada");
    if (!fotoInput.files || fotoInput.files.length === 0) {
        mostrarToast("Por favor, seleccione una imagen del empleado.","warning");
        return;
    }

    // Convertir usuario a minúsculas antes de enviar
    const inputUsuario = document.querySelector('[name="SUsuario"]');
    inputUsuario.value = inputUsuario.value.toLowerCase();

    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch("/Personal/AgregarEmpleado", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("mdlAgregarEmpleado"));
            // Esperar a que el modal cierre ANTES de mostrar el toast
            document.getElementById("mdlAgregarEmpleado").addEventListener("hidden.bs.modal", function handler() {
                mostrarToast("Empleado agregado correctamente", "success");
                setTimeout(() => location.reload(), 3000);
                this.removeEventListener("hidden.bs.modal", handler); // limpieza del listener
            });

            modal.hide();
            
        } else {
            mostrarToast("Error al agregar el empleado", "error");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

function empleado_ResetFotosUI() {

    // Reset array
    empleado_fotos_temp = [];

    // Inputs
    document.getElementById("txtFotosEmpleado").value = "";
    document.getElementById("fotoEmpleadoSeleccionada").value = "";

    // Miniaturas
    const lista = document.getElementById("divMiniaturasEmpleado");
    lista.querySelectorAll(".foto-thumb").forEach(x => x.parentElement.remove());

    // Vista inicial
    document.getElementById("divContenedorFotosEmpleado").classList.add("d-none");
    document.getElementById("divInfoEmpleado").classList.remove("d-none");

    // Imagen principal
    document.getElementById("imgEmpleadoPrincipal").src = "";
    document.getElementById("spEmpleadoFotoNombre").innerText = "Foto";
}

function fnVerEmpleado(id, usuario) {
    const modal = new bootstrap.Modal(document.getElementById("mdlVerfotoPersonal"));
    const img = document.getElementById("imgVerFoto");
    const span = document.getElementById("spMatriculaVerFoto");

    // Mostrar nombre/matrícula
    span.textContent = usuario;

    // Mostrar foto desde el controlador
    img.src = `/Personal/MostrarFoto?id=${id}`;

    // Mostrar modal
    modal.show();
}

// EDICION DE FOTO DE EMPLEADO

// Guarda los bytes de la foto actual para comparar al seleccionar archivo nuevo
let fotoActualBytes = null;

function fnEditarEmpleado(id, usuario) {

    // Crear instancia del modal
    const modal = new bootstrap.Modal(document.getElementById("mdlEditarFotoEmpleado"));

    // Mostrar usuario/matrícula
    document.getElementById("spMatriculaEditarFotoEmpleado").innerText = usuario;

    // Guardar el ID en el input file
    document.getElementById("txtNuevaFotoEmpleado").setAttribute("data-id", id);

    // Descargar foto actual → guardar bytes para comparar y mostrar imagen
    fotoActualBytes = null;
    fetch(`/Personal/MostrarFoto?id=${id}`)
        .then(r => r.arrayBuffer())
        .then(buffer => {
            fotoActualBytes = new Uint8Array(buffer);
            // Reusar los bytes descargados para mostrar la imagen (evita segunda petición)
            const blob = new Blob([fotoActualBytes], { type: "image/jpeg" });
            document.getElementById("imgEditarFotoEmpleado").src = URL.createObjectURL(blob);
        });

    // Mostrar modal
    modal.show();
}

document.getElementById("txtNuevaFotoEmpleado")
    .addEventListener("change", function () {

        const file = this.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".jpg")) {
            mostrarToast("Solo se permite formato JPG", "warning");
            this.value = "";
            return;
        }

        // Leer bytes del archivo nuevo y comparar con la foto actual ANTES de mostrar preview
        const inputRef = this;
        const reader = new FileReader();
        reader.onload = e => {
            const nuevosBytes = new Uint8Array(e.target.result);

            // Comparar solo si ya se descargaron los bytes actuales
            if (fotoActualBytes && fotoActualBytes.length === nuevosBytes.length) {
                const esMismaFoto = fotoActualBytes.every((byte, i) => byte === nuevosBytes[i]);
                if (esMismaFoto) {
                    mostrarToast("La imagen seleccionada es idéntica a la actual, elige otra foto", "warning");
                    inputRef.value = "";
                    return;
                }
            }

            // Pasó la validación → ocultar input y mostrar preview
            inputRef.disabled = true;
            inputRef.style.display = "none";

            const imgPreview = document.getElementById("imgPreviewNuevaFoto");
            imgPreview.src = URL.createObjectURL(file);
            imgPreview.classList.remove("d-none");
        };

        reader.readAsArrayBuffer(file); // ArrayBuffer para poder comparar bytes
    });

document.getElementById("mdlEditarFotoEmpleado")
    .addEventListener("hidden.bs.modal", () => {

        fotoActualBytes = null;

        const input = document.getElementById("txtNuevaFotoEmpleado");
        // RESET TOTAL DEL INPUT FILE
        input.value = "";
        input.disabled = false;
        input.style.display = "block";
        input.removeAttribute("data-id");

        // Reset preview
        const preview = document.getElementById("imgPreviewNuevaFoto");
        preview.src = "";
        preview.classList.add("d-none");
    });


async function fnGuardarNuevaFoto() {

    const input = document.getElementById("txtNuevaFotoEmpleado");
    const id = input.getAttribute("data-id");
    const file = input.files[0];

    if (!file) {
        mostrarToast("Seleccione una imagen","warning");
        return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("foto", file);

    const response = await fetch("/Personal/ActualizarFoto", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        document.getElementById("mdlEditarFotoEmpleado").addEventListener("hidden.bs.modal", function handler() {
            mostrarToast("Foto actualizada correctamente", "success");
            setTimeout(() => location.reload(), 3000);
            this.removeEventListener("hidden.bs.modal", handler);
        });

        bootstrap.Modal.getInstance(document.getElementById("mdlEditarFotoEmpleado")).hide();

    } else {
        // Leer el mensaje que manda el servidor
        const mensaje = await response.text();
        mostrarToast(mensaje || "Error al actualizar la foto", "error");
       
    }
}

async function editarEmpleado_GuardarFoto() {

    const input = document.getElementById("txtNuevaFotoEmpleado");
    const id = input.getAttribute("data-id");
    const file = input.files[0];

    if (!file) {
        mostrarToast("Seleccione una imagen", "warning");
        return;
    }

    
    const formData = new FormData();
    formData.append("id", id);
    formData.append("foto", file);

    const response = await fetch("/Personal/ActualizarFoto", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        document.getElementById("mdlEditarFotoEmpleado").addEventListener("hidden.bs.modal", function handler() {
            mostrarToast("Foto actualizada correctamente", "success");
            setTimeout(() => location.reload(), 3000);
            this.removeEventListener("hidden.bs.modal", handler);
        });

        bootstrap.Modal.getInstance(document.getElementById("mdlEditarFotoEmpleado")).hide();

    } else {
        mostrarToast("Error al actualizar la foto", "error");
    }
}



// --- PREVIEW MULTIPLE + SELECCIÓN DE UNA SOLA FOTO ---

let empleado_fotos_temp = [];
let empleado_fotoDuplicada = null;


function empleado_openFileInput() {
    document.getElementById("txtFotosEmpleado").click();
}

function empleado_OnFilesSelected(input) {
    const nuevosArchivos = Array.from(input.files);

    if (nuevosArchivos.length === 0) return;

    // ✅ VALIDAR PRIMERO
    const archivosInvalidos = nuevosArchivos.filter(f => !empleado_EsJpgValido(f));

    if (archivosInvalidos.length > 0) {
        mostrarToast("Solo se permiten imágenes JPG click","warning");

        // RESET limpio
        input.value = "";
        return;
    }

    // AHORA SÍ: mostrar contenedores
    document.getElementById("divInfoEmpleado").classList.add("d-none");
    document.getElementById("divContenedorFotosEmpleado").classList.remove("d-none");

    nuevosArchivos.forEach((file) => {

        const url = URL.createObjectURL(file);

        // === DETECCIÓN DE DUPLICADOS (funciona en input y drag&drop) ===
        if (empleado_VerificarDuplicado(file, url)) {
            return; // no agrega esta foto
        }

        // === AGREGAR A LISTA TEMPORAL ===
        empleado_fotos_temp.push({ file, url });

        empleado_SeleccionarFoto(empleado_fotos_temp.length - 1);

        // === Crear miniatura ===
        const lista = document.getElementById("divMiniaturasEmpleado");

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.width = "60px";
        wrapper.style.height = "60px";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn p-0 foto-thumb border";
        btn.style.width = "100%";
        btn.style.height = "100%";
        btn.style.overflow = "hidden";

        const index = empleado_fotos_temp.length - 1;
        btn.onclick = () => empleado_SeleccionarFoto(index);

        const img = document.createElement("img");
        img.src = url;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        btn.appendChild(img);

        // === Botón eliminar ===
        const del = document.createElement("div");
        del.className = "thumb-delete";
        del.innerHTML = "&times;";
        del.onclick = (ev) => {
            ev.stopPropagation();
            empleado_EliminarFoto(index);
        };

        wrapper.appendChild(btn);
        wrapper.appendChild(del);

        lista.insertBefore(wrapper, document.getElementById("divAddFoto"));
    });
    input.value = "";

}

function empleado_SeleccionarFoto(index) {
    const foto = empleado_fotos_temp[index];
    if (!foto) return;

    // Cambiar preview principal
    document.getElementById("imgEmpleadoPrincipal").src = foto.url;
    document.getElementById("spEmpleadoFotoNombre").innerText = foto.file.name;

    // Marcar miniatura seleccionada
    const thumbs = document.querySelectorAll("#divMiniaturasEmpleado .foto-thumb");

    thumbs.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });

    // Enviar solo la seleccionada al backend
    const dt = new DataTransfer();
    dt.items.add(foto.file);
    document.getElementById("fotoEmpleadoSeleccionada").files = dt.files;
}

//   DRAG & DROP PARA AGREGAR FOTOS

const dropAreaEmpleado = document.getElementById("divDropEmpleado");
const modalEmpleado = document.getElementById("mdlAgregarEmpleado");

// Evitar comportamiento por defecto
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    modalEmpleado.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

// Cuando el archivo entra al modal → mostrar overlay
modalEmpleado.addEventListener("dragenter", () => {
    dropAreaEmpleado.style.display = "flex";
});

// Mientras se mueve dentro → mantener overlay
modalEmpleado.addEventListener("dragover", () => {
    dropAreaEmpleado.style.display = "flex";
});

// Si sale del modal → ocultar overlay
modalEmpleado.addEventListener("dragleave", (e) => {
    // aseguramos que realmente salió del modal
    if (!modalEmpleado.contains(e.relatedTarget)) {
        dropAreaEmpleado.style.display = "none";
    }
});

// Cuando suelta los archivos
modalEmpleado.addEventListener("drop", (e) => {
    dropAreaEmpleado.style.display = "none";

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    // Filtrar JPG
    const jpgFiles = files.filter(empleado_EsJpgValido);

    if (jpgFiles.length === 0) {
        mostrarToast("Solo se permiten imágenes JPG. drag&drop","warning");
        return;
    }

    // Crear un FileList dinámico para reusar tu función existente
    const dt = new DataTransfer();
    jpgFiles.forEach(file => dt.items.add(file));

    const input = document.getElementById("txtFotosEmpleado");
    input.files = dt.files;

    // Llamar a tu función que ya agrega miniaturas
    empleado_OnFilesSelected(input);
});

function empleado_EliminarFoto(index) {
    // Eliminar del arreglo
    empleado_fotos_temp.splice(index, 1);

    // Volver a dibujar TODAS las miniaturas
    const lista = document.getElementById("divMiniaturasEmpleado");
    lista.querySelectorAll(".foto-thumb").forEach(x => x.parentElement.remove());

    // Si ya no hay fotos → volver al estado inicial
    if (empleado_fotos_temp.length === 0) {
        document.getElementById("divContenedorFotosEmpleado").classList.add("d-none");
        document.getElementById("divInfoEmpleado").classList.remove("d-none");
        document.getElementById("fotoEmpleadoSeleccionada").value = "";
        return;
    }

    // Recrear miniaturas con índices actualizados
    empleado_fotos_temp.forEach((foto, i) => {
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.width = "60px";
        wrapper.style.height = "60px";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn p-0 foto-thumb border";
        btn.style.width = "100%";
        btn.style.height = "100%";
        btn.style.overflow = "hidden";
        btn.onclick = () => empleado_SeleccionarFoto(i);

        const img = document.createElement("img");
        img.src = foto.url;
        img.className = "img-fluid";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";

        btn.appendChild(img);

        // Botón borrar
        const del = document.createElement("div");
        del.className = "thumb-delete";
        del.innerHTML = "&times;";
        del.onclick = (ev) => {
            ev.stopPropagation();
            empleado_EliminarFoto(i);
        };

        wrapper.appendChild(btn);
        wrapper.appendChild(del);

        lista.insertBefore(wrapper, document.getElementById("divAddFoto"));
    });

    // Si eliminaste la foto seleccionada → seleccionar otra
    empleado_SeleccionarFoto(0);
}

// ===========================
//  RESETEAR TODO AL CERRAR MODAL
// ===========================

document.getElementById("mdlAgregarEmpleado").addEventListener("hidden.bs.modal", () => {

    // Vaciar arreglo de fotos temporales
    empleado_fotos_temp = [];

    // Limpiar input final (Foto seleccionada)
    document.getElementById("fotoEmpleadoSeleccionada").value = "";

    // Limpiar input de subida múltiple
    document.getElementById("txtFotosEmpleado").value = "";

    // Limpiar miniaturas
    const lista = document.getElementById("divMiniaturasEmpleado");
    lista.querySelectorAll(".foto-thumb").forEach(x => x.parentElement.remove());

    // Regresar a pantalla inicial del módulo de fotos
    document.getElementById("divContenedorFotosEmpleado").classList.add("d-none");
    document.getElementById("divInfoEmpleado").classList.remove("d-none");

    // Limpiar foto principal
    document.getElementById("imgEmpleadoPrincipal").src = "";
    document.getElementById("spEmpleadoFotoNombre").innerText = "Foto";

    // Resetear formulario completo
    const form = document.getElementById("frmAgregarEmpleado");
    form.reset();
    empleado_ResetFotosUI();

    // Quitar clase de validación de Bootstrap
    form.classList.remove('was-validated');

    // Reiniciar contadores de caracteres
    contadores.forEach(([idInput, idSpan, max]) => {
        const input = document.getElementById(idInput);
        const span = document.getElementById(idSpan);
        if (input && span) {
            span.textContent = "0";
            span.style.color = "";
        }
    });
});

function empleado_VerificarDuplicado(file, url) {
    const nombre = file.name.toLowerCase();

    const index = empleado_fotos_temp.findIndex(f => f.file.name.toLowerCase() === nombre);

    if (index === -1)
        return false; // no es duplicado

    // Guardar info de duplicado
    empleado_fotoDuplicada = {
        indexExistente: index,
        nuevaFoto: { file, url }
    };

    // Mostrar modal
    document.getElementById("spNombreImagenDuplicada").innerText = nombre;

    // Actual
    document.getElementById("imgDuplicadaActual").src = empleado_fotos_temp[index].url;

    // Nueva
    document.getElementById("imgDuplicadaNueva").src = url;

    const modal = new bootstrap.Modal(document.getElementById("mdlImagenDuplicada"));
    modal.show();

    return true;
}

// --------------------
//  OPCIÓN: REEMPLAZAR
// --------------------
document.getElementById("btnReemplazar").onclick = () => {
    const { indexExistente, nuevaFoto } = empleado_fotoDuplicada;

    // Reemplazar en array
    empleado_fotos_temp[indexExistente] = nuevaFoto;

    // Volver a dibujar miniaturas
    empleado_EliminarFoto(indexExistente); // limpia y reordena
    empleado_fotos_temp.splice(indexExistente, 0, nuevaFoto); // reinsertar donde estaba
    empleado_SeleccionarFoto(indexExistente);

    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById("mdlImagenDuplicada")).hide();
};

// --------------------
//  OPCIÓN: OMITIR
// --------------------
document.getElementById("btnOmitir").onclick = () => {
    empleado_fotoDuplicada = null;
    bootstrap.Modal.getInstance(document.getElementById("mdlImagenDuplicada")).hide();
};

// --------------------
//  OPCIÓN: CANCELAR SOLO ESTA CARGA
// --------------------
document.getElementById("btnCancelarCarga").onclick = () => {

    // Simplemente olvidamos la foto duplicada
    empleado_fotoDuplicada = null;

    // Cerramos modal sin eliminar nada del usuario
    bootstrap.Modal.getInstance(document.getElementById("mdlImagenDuplicada")).hide();

    // No hacemos NINGÚN cambio a las fotos ya cargadas
};

let empleadoEliminarId = null;
let empleadoEliminarUsuario = null;

// ===========================
// ELIMINAR EMPLEADO
// ===========================
async function fnEliminarEmpleado(id, usuario) {
    empleadoEliminarId = id;
    empleadoEliminarUsuario = usuario;

    // Actualiza el nombre en el modal
    document.getElementById("spEmpleadoEliminar").textContent = usuario;

    // Muestra el modal de confirmación
    const modal = new bootstrap.Modal(document.getElementById("mdlConfirmarEliminarEmpleado"));
    modal.show();
    
}


document.getElementById("btnConfirmarEliminarEmpleado")
    .addEventListener("click", async function () {

        if (!empleadoEliminarId) return;

        const alertBox = document.getElementById("alertEliminarEmpleado");
        alertBox.classList.add("d-none");
        alertBox.textContent = "";

        const response = await fetch("/Personal/EliminarEmpleado", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ NId: empleadoEliminarId })
        });

        const result = await response.json();

        if (!result.success) {
            //  AQUÍ está la magia
            alertBox.textContent = result.message;
            alertBox.classList.remove("d-none");
            return;
        }

        // Éxito
        bootstrap.Modal
            .getInstance(document.getElementById("mdlConfirmarEliminarEmpleado"))
            .hide();

        mostrarToast("Empleado eliminado correctamente", "success");

        setTimeout(() => location.reload(), 3000);
        //location.reload();
    });

document.getElementById("mdlConfirmarEliminarEmpleado")
    .addEventListener("hidden.bs.modal", function () {

        empleadoEliminarId = null;
        empleadoEliminarUsuario = null;

        document.getElementById("spEmpleadoEliminar").textContent = "";

        const alertBox = document.getElementById("alertEliminarEmpleado");
        alertBox.classList.add("d-none");
        alertBox.textContent = "";
    });

(function () {
    'use strict'

    var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
                form.classList.add('was-validated');
            }
        }, false)
    })
})()

// Configuración de contadores: [idInput, idSpan, max]
const contadores = [
    ['inputUsuario', 'cntUsuario', 50],
    ['inputDep', 'cntDep', 100],
];

contadores.forEach(([idInput, idSpan, max]) => {
    const input = document.getElementById(idInput);
    const span = document.getElementById(idSpan);

    if (!input || !span) return;

    input.addEventListener('input', function () {
        const actual = this.value.length;
        span.textContent = actual;
        span.style.color = actual >= max * 0.9 ? 'red' : '';
    });
});

/// alertas toast
function mostrarToast(mensaje, tipo = "success") {
    const colores = {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        warning: "bg-warning text-dark",
        info: "bg-info text-dark"
    };

    const toastEl = document.getElementById("toastMensaje");
    const toastTexto = document.getElementById("toastText");

    // Quitar colores anteriores y aplicar el nuevo

    toastEl.classList.remove("bg-success", "bg-danger", "bg-warning", "bg-info", "bg-primary", "text-dark", "text-white");
    toastEl.classList.add(...(colores[tipo] || colores.success).split(" "));

    toastTexto.textContent = mensaje;

    const toast = bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}