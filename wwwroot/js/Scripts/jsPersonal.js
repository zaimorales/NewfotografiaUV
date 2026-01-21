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
    return file && file.type === "image/jpeg" &&
        file.name.toLowerCase().endsWith(".jpg");
}


document.getElementById("frmAgregarEmpleado").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch("/Personal/AgregarEmpleado", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("mdlAgregarEmpleado"));
            modal.hide();

            alert("Empleado agregado correctamente ✅");
            location.reload(); // recarga la tabla
        } else {
            alert("Ocurrió un error al guardar el empleado ❌");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error inesperado al guardar.");
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
function fnEditarEmpleado(id, usuario) {

    // Crear instancia del modal
    const modal = new bootstrap.Modal(document.getElementById("mdlEditarFotoEmpleado"));

    // Mostrar usuario/matrícula
    document.getElementById("spMatriculaEditarFotoEmpleado").innerText = usuario;

    // Cargar foto actual del backend
    document.getElementById("imgEditarFotoEmpleado").src = `/Personal/MostrarFoto?id=${id}`;

    // Guardar el ID en el input file
    document.getElementById("txtNuevaFotoEmpleado").setAttribute("data-id", id);

    // Mostrar modal
    modal.show();
}

document.getElementById("txtNuevaFotoEmpleado")
    .addEventListener("change", function () {

        const file = this.files[0];
        const btnSubir = document.getElementById("txtNuevaFotoEmpleado");

        if (!file.name.toLowerCase().endsWith(".jpg")) {
            alert("Solo se permiten imágenes JPG js1");
            this.value = "";
            return;
        }

        if (file) { // si ya se selecciono un archivo el boton de subir se oculta
            btnSubir.disabled = true;
            btnSubir.style.display = "none";
        }

        const reader = new FileReader();
        reader.onload = e => {
            const imgPreview = document.getElementById("imgPreviewNuevaFoto");
            imgPreview.src = e.target.result;
            imgPreview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
    });

document.getElementById("mdlEditarFotoEmpleado")
    .addEventListener("hidden.bs.modal", () => {

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
        alert("Seleccione una imagen");
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
        alert("Foto actualizada correctamente ✅");

        bootstrap.Modal
            .getInstance(document.getElementById("mdlEditarFotoEmpleado"))
            .hide();

        location.reload();
    } else {
        alert("Error al actualizar la foto ❌");
    }
}

async function editarEmpleado_GuardarFoto() {

    const input = document.getElementById("txtNuevaFotoEmpleado");
    const id = input.getAttribute("data-id");
    const file = input.files[0];

    if (!file) {
        alert("Seleccione una imagen");
        return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("foto", file);

    const response = await fetch("/Personal/ActualizarFotoEmpleado", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        alert("Foto actualizada correctamente ✅");

        bootstrap.Modal
            .getInstance(document.getElementById("mdlEditarFotoEmpleado"))
            .hide();

        location.reload();
    } else {
        alert("Error al actualizar la foto ❌");
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
        alert("Solo se permiten imágenes JPG");

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




//   DRAG & DROP PARA FOTOS

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
        alert("Solo se permiten imágenes JPG. js2");
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

        location.reload();
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
