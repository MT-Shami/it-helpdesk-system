using System.ComponentModel.DataAnnotations;

namespace ITHelpdeskAPI.Models
{
    public class UpdateTicketDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? AssignedToAgentId { get; set; }
    }
}