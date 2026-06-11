using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/Tickets/{ticketId}/activity")]
    [ApiController]
    [Authorize]
    public class ActivityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetActivity(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            var logs = await _context.ActivityLogs
                .Where(al => al.TicketId == ticketId)
                .Include(al => al.User)
                .OrderByDescending(al => al.Timestamp)
                .Select(al => new
                {
                    al.Id,
                    al.Action,
                    al.Timestamp,
                    al.Details,
                    UserName = al.User != null ? al.User.FullName ?? al.User.UserName : "Unknown"
                })
                .ToListAsync();

            return Ok(logs);
        }
    }
}
