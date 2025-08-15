using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Fotografia.Models;
using Fotografia.Data;
using Fotografia.Functions;
using Fotografia.ViewModels;
using System.Security.Cryptography;

namespace Fotografia.Controllers;

public class AdminController : Controller
{
    private readonly ClsEmpleado _clsEmpleado;

    public AdminController(ClsEmpleado clsEmpleado)
    {
        _clsEmpleado = clsEmpleado ?? throw new ArgumentNullException(nameof(clsEmpleado));
    }

    public async Task<IActionResult> Index()
    {
        var lsEmpleados = await _clsEmpleado.ObtenerEmpleados();
        return View(lsEmpleados); // Ahora es IEnumerable<MoEmpleado>
    }

    [HttpPost]
    public async Task<IActionResult> AgregarEmpleado([FromBody] VmAgregarEmpleado empleado)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { mensaje = "Datos inválidos." });

        await _clsEmpleado.Agregar(new VmAgregarEmpleado
        {
            NNoPerson = empleado.NNoPerson,
            SUsuario = empleado.SUsuario,
            SDep = empleado.SDep,
            CPermisos = empleado.CPermisos,
            BAdmin = empleado.BAdmin
        });

        return Ok(new { mensaje = "Empleado agregado correctamente." });
    }


}
