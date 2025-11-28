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

function fnEditarEmpleado(id) {
    alert("Editar empleado con ID: " + id);
}

// --- PREVIEW MULTIPLE + SELECCIÓN DE UNA SOLA FOTO ---

let empleado_fotos_temp = [];
let empleado_fotoDuplicada = null;


function empleado_openFileInput() {
    document.getElementById("txtFotosEmpleado").click();
}

function empleado_OnFilesSelected(input) {
    const nuevosArchivos = Array.from(input.files);
    const lista = document.getElementById("divMiniaturasEmpleado");

    // Mostrar contenedores correctos
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

}

function empleado_SeleccionarFoto(index) {
    const foto = empleado_fotos_temp[index];
    if (!foto) return;

    // Cambiar preview principal
    document.getElementById("imgEmpleadoPrincipal").src = foto.url;
    document.getElementById("spEmpleadoFotoNombre").innerText = foto.file.name;

    // Marcar miniatura seleccionada (CORREGIDO)
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
    const jpgFiles = files.filter(f => f.name.toLowerCase().endsWith(".jpg"));

    if (jpgFiles.length === 0) {
        alert("Solo se permiten imágenes JPG.");
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
