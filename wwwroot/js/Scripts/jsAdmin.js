document.addEventListener("DOMContentLoaded", function () {
    $('#ddlEstudiante').val('5');
    var tblEmpleados = new DataTable('#tblEmpleados', {
        pageLength: 5,
        responsive: true,
        ordering: true,
        paging: true,
        searching: true,
        destroy: true,
        lengthChange: true,
        dom: 'rtip',
        lengthMenu: [
            [1, 4], /* Valores a mostrar */
            [1, 4], /* Etiquetas a mostrar */
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
            info: 'Mostrando _START_ de _TOTAL_ usuarios',
            lengthMenu: 'Ver _MENU_',
            infoEmpty: "Ningun usuario encontrado",
        }
    })

});

// This script initializes a DataTable on the element with ID 'tblEmpleados'.
function fnMostrarAgregarEmpleado() {
    $("#mdlAgregarEmpleado").modal("show");
}

const empleados = [
    { id: 1, noPersonal: "1001", usuario: "jlopez", dep: "Recursos Humanos" },
    { id: 2, noPersonal: "1002", usuario: "mgarcia", dep: "Contabilidad" },
    { id: 3, noPersonal: "1003", usuario: "rperez", dep: "TI" }
];

// Botón buscar
document.getElementById("btnBuscar").addEventListener("click", function () {
    const termino = document.getElementById("txtBusqueda").value.trim().toLowerCase();
    const ddl = document.getElementById("ddlResultados");

    if (termino === "") {
        return;
    }

    // Limpiar resultados previos
    ddl.innerHTML = '<option value="" selected hidden>Seleccione...</option>';

    // Filtrar empleados por número personal o usuario
    const resultados = empleados.filter(emp =>
        emp.noPersonal.includes(termino) ||
        emp.usuario.toLowerCase().includes(termino)
    );

    // Si hay resultados, mostrarlos
    if (resultados.length > 0) {
        resultados.forEach(emp => {
            const opt = document.createElement("option");
            opt.value = emp.id;
            opt.textContent = `${emp.noPersonal} - ${emp.usuario} (${emp.dep})`;
            ddl.appendChild(opt);
        });
        document.getElementById("divBusqueda").style.display = "block";

        // Seleccionar automáticamente el primero y rellenar
        ddl.selectedIndex = 1;
        rellenarDatos(resultados[0]);
        habilitarPermisos();
    } else {
        document.getElementById("divBusqueda").style.display = "none";
        alert("No se encontraron empleados.");
    }
});

// Evento al cambiar de selección en el select
document.getElementById("ddlResultados").addEventListener("change", function () {
    const seleccionado = empleados.find(emp => emp.id == this.value);
    if (seleccionado) {
        rellenarDatos(seleccionado);
        habilitarPermisos();
    }
});

// Función para rellenar campos
function rellenarDatos(emp) {
    document.getElementById("txtNoPersonal").value = emp.noPersonal;
    document.getElementById("txtUsuario").value = emp.usuario;
    document.getElementById("txtDep").value = emp.dep;
}

// Función para habilitar campos de permisos
function habilitarPermisos() {
    document.getElementById("ddlPermisos").disabled = false;
    document.getElementById("txtAdmin").disabled = false;
}

const modalAgregarEmpleado = document.getElementById('mdlAgregarEmpleado');

modalAgregarEmpleado.addEventListener('show.bs.modal', function () {
    // Limpiar campos de búsqueda y resultados
    document.getElementById("txtBusqueda").value = "";
    document.getElementById("divBusqueda").style.display = "none";
    document.getElementById("ddlResultados").innerHTML = '<option value="" selected hidden>Seleccione...</option>';

    // Limpiar datos del empleado
    document.getElementById("txtNoPersonal").value = "";
    document.getElementById("txtUsuario").value = "";
    document.getElementById("txtDep").value = "";

    // Resetear permisos y administrador
    document.getElementById("ddlPermisos").value = "";
    document.getElementById("txtAdmin").checked = false;

    // Deshabilitar permisos y admin
    document.getElementById("ddlPermisos").disabled = true;
    document.getElementById("txtAdmin").disabled = true;
});

document.getElementById("btnAgregarEmpleado").addEventListener("click", function () {
    const noPersonal = document.getElementById("txtNoPersonal").value.trim();
    const usuario = document.getElementById("txtUsuario").value.trim();
    const dep = document.getElementById("txtDep").value.trim();
    const permisos = document.getElementById("ddlPermisos").value;
    const esAdmin = document.getElementById("txtAdmin").checked;

    const permisosChar = permisos.length > 0 ? permisos.charAt(0) : null;

    if (!noPersonal) {
        alert("Debes seleccionar un empleado antes de guardar.");
        return;
    }
    if (!permisos) {
        alert("Debes seleccionar los permisos.");
        return;
    }

    const datos = {
        NNoPerson: parseInt(noPersonal),
        SUsuario: usuario,
        SDep: dep,
        CPermisos: permisosChar,
        BAdmin: esAdmin
    };

    fetch("/Admin/AgregarEmpleado", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error al guardar el empleado");
            return response.json();
        })
        .then(data => {
            alert(data.mensaje);
            const modal = bootstrap.Modal.getInstance(document.getElementById('mdlAgregarEmpleado'));
            modal.hide();
        })
        .catch(error => {
            console.error(error);
            alert("Ocurrió un error al guardar.");
        });
});
