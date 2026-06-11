using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHelpdeskAPI.Models
{
    public class Ticket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string Status { get; set; } = "New";
        public string Priority { get; set; } = "Medium";
        public string Category { get; set; } = "Other";

        public string? CreatedById { get; set; }
        public string? AssignedToAgentId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ApplicationUser? CreatedBy { get; set; }
        public virtual ApplicationUser? AssignedToAgent { get; set; }
    }
}