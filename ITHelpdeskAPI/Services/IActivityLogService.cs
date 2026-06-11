namespace ITHelpdeskAPI.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(string userId, int? ticketId, string action, string? details = null);
    }
}
