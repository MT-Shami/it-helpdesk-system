namespace ITHelpdeskAPI.Services
{
    public interface INotificationService
    {
        Task SendAsync(string userId, string message, int? relatedTicketId = null);
    }
}
