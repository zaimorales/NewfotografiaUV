using System.ComponentModel.DataAnnotations;

namespace Fotografia.Models
{
    public class MoEmpleado
    {
        public int NId { get; set; }
        [Required]
        public string? SUsuario { get; set; }
        [Required]
        public string? SDep { get; set; }
        [Required]
        public int NNoPerson { get; set; }
        [Required]
        public char? CPermisos { get; set; }
        [Required]
        public bool BAdmin { get; set; }
        [Required]
        public DateTime DFAlta { get; set; }
        public DateTime DFUltModif { get; set; }
        public DateTime DFBaja { get; set; }
        public char? CIndActivo { get; set; }
        public required byte[] BFoto { get; set; }
    }
}