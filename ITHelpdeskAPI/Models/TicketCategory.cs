using System.ComponentModel.DataAnnotations;

namespace ITHelpdeskAPI.Models
{
    public class TicketCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
