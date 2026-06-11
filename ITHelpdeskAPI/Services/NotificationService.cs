using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendAsync(string userId, string message, int? relatedTicketId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                RelatedTicketId = relatedTicketId
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}
