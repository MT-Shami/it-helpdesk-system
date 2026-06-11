using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHelpdeskAPI.Models
{
    public class TicketAttachment
    {
        [Key]
        public int Id { get; set; }

        public int TicketId { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public long FileSizeBytes { get; set; }

        public string UploadedById { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TicketId")]
        public virtual Ticket? Ticket { get; set; }

        [ForeignKey("UploadedById")]
        public virtual ApplicationUser? UploadedBy { get; set; }
    }
}
