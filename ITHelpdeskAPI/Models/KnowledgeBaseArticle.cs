using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHelpdeskAPI.Models
{
    public class KnowledgeBaseArticle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public bool IsApproved { get; set; } = false;

        public string CreatedByUserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CreatedByUserId")]
        public virtual ApplicationUser? CreatedBy { get; set; }
    }
}
