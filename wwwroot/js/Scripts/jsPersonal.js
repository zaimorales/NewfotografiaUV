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
