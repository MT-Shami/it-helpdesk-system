namespace ITHelpdeskAPI.Models
{
    public class TicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? CreatedById { get; set; }
        public string? AssignedToAgentId { get; set; }
        public string? CreatedByName { get; set; }
        public string? AssignedToAgentName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}