using Microsoft.AspNetCore.Mvc;
using Fotografia.Models;
using Fotografia.Data;
using System;
using System.Collections.Generic;
using Fotografia.ViewModels;

namespace Fotografia.Controllers
{
    public class PersonalController : Controller
    {
        private readonly DaEmpleado _daEmpleado;

        public PersonalController(DaEmpleado daEmpleado)
        {
            _daEmpleado = daEmpleado ?? throw new ArgumentNullException(nameof(daEmpleado));
        }

        public async Task<IActionResult> Index()
        {
            // Recupera la lista de empleados desde tu capa de datos
            var lsEmpleados = await _daEmpleado.ObtenerEmpleados() ?? new List<MoEmpleado>();
            return View(lsEmpleados);
        }

        [HttpPost]
        public async Task<IActionResult> AgregarEmpleado(VmAgregarEmpleado vm)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Datos inválidos" });

            await _daEmpleado.InsertarEmpleado(vm);

            return Ok(new { success = true });
        }

        [HttpGet]
        public async Task<IActionResult> MostrarFoto(int id)
        {
            var empleado = (await _daEmpleado.ObtenerEmpleados(id)).FirstOrDefault();
            if (empleado == null || empleado.BFoto == null)
                return NotFound();

            return File(empleado.BFoto, "image/jpeg"); // o "image/png" si aplica
        }


        [HttpPost]
        public IActionResult ActualizarEmpleado([FromBody] MoEmpleado empleado)
        {
            if (empleado == null || empleado.NId == 0)
                return BadRequest(new { success = false, message = "Datos inválidos" });

            try
            {
                _daEmpleado.ActualizarEmpleado(empleado);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ActualizarFoto(int id, IFormFile foto)
        {
            if (foto == null || foto.Length == 0)
                return BadRequest("Archivo inválido");

            byte[] fotoBytes;
            using (var ms = new MemoryStream())
            {
                await foto.CopyToAsync(ms);
                fotoBytes = ms.ToArray();
            }

            await _daEmpleado.ActualizarFotoEmpleado(id, fotoBytes);

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> ActualizarFotoEmpleado(int id, IFormFile foto)
        {
            if (foto == null || foto.Length == 0)
                return BadRequest("Imagen inválida");

            byte[] bytes;
            using (var ms = new MemoryStream())
            {
                await foto.CopyToAsync(ms);
                bytes = ms.ToArray();
            }

            await _daEmpleado.ActualizarFotoEmpleado(id, bytes);
            return Ok();
        }


        [HttpPost]
        public IActionResult EliminarEmpleado([FromBody] VmEliminarEmpleado vm)
        {
            if (vm == null || vm.NId <= 0)
                return BadRequest(new { success = false, message = "ID inválido" });

            var resultado = _daEmpleado.EliminarEmpleado(vm.NId);

            if (resultado == 0)
            {
                return Ok(new
                {
                    success = false,
                    message = "El empleado ya se encuentra eliminado."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Empleado eliminado correctamente."
            });
        }



    }
}
