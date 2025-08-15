using Fotografia.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper;
using Fotografia.ViewModels;

namespace Fotografia.Data;

public class DaEmpleado
{
    private readonly string _connection;

    public DaEmpleado(IConfiguration configuration) => _connection = configuration?.GetConnectionString("DefaultConnection") ?? "";

    public async Task<IEnumerable<MoEmpleado>> ObtenerEmpleados(int? nId = null)
    {
        using var connection = new SqlConnection(_connection);
        return await connection.QueryAsync<MoEmpleado>(
            "PAS_EMPLEADO",
            new { nId },
            commandType: CommandType.StoredProcedure
        );
    }


    public async Task InsertarEmpleado(VmAgregarEmpleado vmAgregarEmpleado)
    {
        using var connection = new SqlConnection(_connection);
        byte[]? fotoBytes = null;

        if (vmAgregarEmpleado.Foto != null && vmAgregarEmpleado.Foto.Length > 0)
        {
            using var ms = new MemoryStream();
            await vmAgregarEmpleado.Foto.CopyToAsync(ms);
            fotoBytes = ms.ToArray();
        }
        await connection.ExecuteAsync(
            "PAI_EMPLEADO",
            new
            {
                vmAgregarEmpleado.SUsuario,
                vmAgregarEmpleado.NNoPerson,
                vmAgregarEmpleado.SDep,
                vmAgregarEmpleado.CPermisos,
                vmAgregarEmpleado.BAdmin,
                BFoto = fotoBytes
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public void ActualizarEmpleado(MoEmpleado moEmpleado)
    {
        using var connection = new SqlConnection(_connection);
        connection.Execute(
            "PAA_EMPLEADO",
            new
            {
                moEmpleado.SUsuario,
                moEmpleado.NNoPerson,
                moEmpleado.SDep,
                moEmpleado.CPermisos,
                moEmpleado.BAdmin,
                moEmpleado.CIndActivo,
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public void EliminarEmpleado(string nId)
    {
        using var connection = new SqlConnection(_connection);
        connection.Execute(
            "PAE_EMPLEADO",
            new { nId = nId },
            commandType: CommandType.StoredProcedure
        );
    }
}
