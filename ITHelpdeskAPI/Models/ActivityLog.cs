using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHelpdeskAPI.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public int? TicketId { get; set; }

        [Required]
        public string Action { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string? Details { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }
}
