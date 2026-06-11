using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string userId, int? ticketId, string action, string? details = null)
        {
            var log = new ActivityLog
            {
                UserId = userId,
                TicketId = ticketId,
                Action = action,
                Timestamp = DateTime.UtcNow,
                Details = details
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
