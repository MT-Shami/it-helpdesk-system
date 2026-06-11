using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHelpdeskAPI.Models
{
    public class TicketComment
    {
        [Key]
        public int Id { get; set; }

        public int TicketId { get; set; }

        public string UserId { get; set; } = string.Empty;

        [Required]
        public string CommentText { get; set; } = string.Empty;

        public bool IsInternal { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TicketId")]
        public virtual Ticket? Ticket { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }
}
