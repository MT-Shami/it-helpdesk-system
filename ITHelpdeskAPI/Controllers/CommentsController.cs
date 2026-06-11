using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITHelpdeskAPI.Models;
using ITHelpdeskAPI.Services;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/Tickets/{ticketId}/comments")]
    [ApiController]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _activityLogService;
        private readonly INotificationService _notificationService;

        public CommentsController(
            ApplicationDbContext context,
            IActivityLogService activityLogService,
            INotificationService notificationService)
        {
            _context = context;
            _activityLogService = activityLogService;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetComments(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdminOrAgent = User.IsInRole("Admin") || User.IsInRole("Agent");

            var query = _context.TicketComments
                .Include(c => c.User)
                .Where(c => c.TicketId == ticketId)
                .AsQueryable();

            if (!isAdminOrAgent)
                query = query.Where(c => !c.IsInternal);

            var comments = await query.OrderBy(c => c.CreatedAt).Select(c => new
            {
                c.Id,
                c.CommentText,
                c.IsInternal,
                c.CreatedAt,
                UserName = c.User != null ? c.User.FullName ?? c.User.UserName : "Unknown"
            }).ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult> AddComment(int ticketId, [FromBody] AddCommentDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            bool isInternal = dto.IsInternal;
            if (isInternal && !User.IsInRole("Admin") && !User.IsInRole("Agent"))
                isInternal = false;

            var comment = new TicketComment
            {
                TicketId = ticketId,
                UserId = userId,
                CommentText = dto.CommentText,
                IsInternal = isInternal,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketComments.Add(comment);
            await _context.SaveChangesAsync();

            var action = isInternal ? "added internal note" : "added comment";
            await _activityLogService.LogAsync(userId, ticketId, action);

            if (ticket.CreatedById != null && ticket.CreatedById != userId)
                await _notificationService.SendAsync(ticket.CreatedById, $"New comment on ticket #{ticketId}", ticketId);

            if (ticket.AssignedToAgentId != null && ticket.AssignedToAgentId != userId)
                await _notificationService.SendAsync(ticket.AssignedToAgentId, $"New comment on ticket #{ticketId}", ticketId);

            return Ok(new { message = "Comment added" });
        }
    }

    public class AddCommentDto
    {
        public string CommentText { get; set; } = string.Empty;
        public bool IsInternal { get; set; } = false;
    }
}
