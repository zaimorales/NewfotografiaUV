using System;
using System.Threading.Tasks;
using Fotografia.Models;
using Fotografia.ViewModels;
using Fotografia.Data;
using Microsoft.AspNetCore.Mvc;

namespace Fotografia.Functions
{
    public class ClsEmpleado
    {
        private readonly DaEmpleado _daEmpleado;

        public ClsEmpleado(DaEmpleado daEmpleado)
        {
            _daEmpleado = daEmpleado;
        }

        public async Task<IEnumerable<MoEmpleado>> ObtenerEmpleados(int? nId = null)
        {
            return await _daEmpleado.ObtenerEmpleados(nId);
        }

        public async Task<(bool Success, string Message)> Agregar(VmAgregarEmpleado vmAgregarEmpleado)
        {
            if (vmAgregarEmpleado == null) return (false, "Datos inválidos.");
            if (string.IsNullOrEmpty(vmAgregarEmpleado.SUsuario) || vmAgregarEmpleado.NNoPerson <= 0)
                return (false, "Faltan datos requeridos.");
            await _daEmpleado.InsertarEmpleado(vmAgregarEmpleado);
            return (true, "Empleado agregado correctamente.");
        }
    }
}
