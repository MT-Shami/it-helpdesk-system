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

        public string Status { get; set; } = "New";          // New, In Progress, Resolved, Closed
        public string Priority { get; set; } = "Medium";     // Low, Medium, High, Critical
        public string Category { get; set; } = "Other";      // Hardware, Software, Network, Email, Access Request, Other

        // Foreign keys
        public string? CreatedById { get; set; }
        public string? AssignedToAgentId { get; set; }

        // Navigation properties
        [ForeignKey("CreatedById")]
        public virtual ApplicationUser? CreatedBy { get; set; }

        [ForeignKey("AssignedToAgentId")]
        public virtual ApplicationUser? AssignedToAgent { get; set; }
    }
}