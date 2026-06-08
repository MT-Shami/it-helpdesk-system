using System.ComponentModel.DataAnnotations;

namespace ITHelpdeskAPI.Models
{
    public class CreateTicketDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Priority { get; set; } = "Medium";
        public string Category { get; set; } = "Other";
        // CreatedById will be taken from the logged-in user (from JWT)
    }
}