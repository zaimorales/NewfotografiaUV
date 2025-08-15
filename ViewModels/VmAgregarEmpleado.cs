using System.ComponentModel.DataAnnotations;

namespace Fotografia.ViewModels
{
    public class VmAgregarEmpleado
    {
        public int NNoPerson { get; set; }
        public string? SUsuario { get; set; }
        public string? SDep { get; set; }
        public char? CPermisos { get; set; }
        public bool BAdmin { get; set; }
        public IFormFile? Foto { get; set; }
    }
}
