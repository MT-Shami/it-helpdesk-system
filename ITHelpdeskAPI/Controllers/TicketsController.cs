using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITHelpdeskAPI.Models;
using ITHelpdeskAPI.Services;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IActivityLogService _activityLogService;
        private readonly INotificationService _notificationService;

        public TicketsController(
            ApplicationDbContext context,
            IActivityLogService activityLogService,
            INotificationService notificationService)
        {
            _context = context;
            _activityLogService = activityLogService;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdminOrAgent = User.IsInRole("Admin") || User.IsInRole("Agent");

            var query = _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedToAgent)
                .AsQueryable();

            if (!isAdminOrAgent)
                query = query.Where(t => t.CreatedById == userId);

            var tickets = await query.Select(t => new TicketDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                Category = t.Category,
                CreatedById = t.CreatedById,
                AssignedToAgentId = t.AssignedToAgentId,
                CreatedByName = t.CreatedBy != null ? t.CreatedBy.UserName : null,
                AssignedToAgentName = t.AssignedToAgent != null ? t.AssignedToAgent.UserName : null,
                CreatedAt = t.CreatedAt
            }).ToListAsync();

            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdminOrAgent = User.IsInRole("Admin") || User.IsInRole("Agent");

            var ticket = await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedToAgent)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
                return NotFound();

            if (!isAdminOrAgent && ticket.CreatedById != userId)
                return Forbid();

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                Priority = ticket.Priority,
                Category = ticket.Category,
                CreatedById = ticket.CreatedById,
                AssignedToAgentId = ticket.AssignedToAgentId,
                CreatedByName = ticket.CreatedBy?.UserName,
                AssignedToAgentName = ticket.AssignedToAgent?.UserName,
                CreatedAt = ticket.CreatedAt
            };

            return Ok(ticketDto);
        }

        [HttpGet("assigned-to-me")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetAssignedToMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var tickets = await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedToAgent)
                .Where(t => t.AssignedToAgentId == userId)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    Category = t.Category,
                    CreatedById = t.CreatedById,
                    AssignedToAgentId = t.AssignedToAgentId,
                    CreatedByName = t.CreatedBy != null ? t.CreatedBy.UserName : null,
                    AssignedToAgentName = t.AssignedToAgent != null ? t.AssignedToAgent.UserName : null,
                    CreatedAt = t.CreatedAt
                }).ToListAsync();

            return Ok(tickets);
        }

        [HttpGet("unassigned")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetUnassigned()
        {
            var tickets = await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedToAgent)
                .Where(t => t.AssignedToAgentId == null)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    Category = t.Category,
                    CreatedById = t.CreatedById,
                    AssignedToAgentId = t.AssignedToAgentId,
                    CreatedByName = t.CreatedBy != null ? t.CreatedBy.UserName : null,
                    AssignedToAgentName = t.AssignedToAgent != null ? t.AssignedToAgent.UserName : null,
                    CreatedAt = t.CreatedAt
                }).ToListAsync();

            return Ok(tickets);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketDto createDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var ticket = new Ticket
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Priority = createDto.Priority,
                Category = createDto.Category,
                Status = "New",
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await _context.Entry(ticket).Reference(t => t.CreatedBy).LoadAsync();

            await _activityLogService.LogAsync(userId, ticket.Id, "Ticket Created", $"Title: {ticket.Title}");

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                Priority = ticket.Priority,
                Category = ticket.Category,
                CreatedById = ticket.CreatedById,
                CreatedByName = ticket.CreatedBy?.UserName,
                CreatedAt = ticket.CreatedAt
            };

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(int id, UpdateTicketDto updateDto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdminOrAgent = User.IsInRole("Admin") || User.IsInRole("Agent");

            if (!isAdminOrAgent)
            {
                if (ticket.CreatedById != userId)
                    return Forbid();

                ticket.Title = updateDto.Title;
                ticket.Description = updateDto.Description;
                ticket.Priority = updateDto.Priority;
                ticket.Category = updateDto.Category;
            }
            else
            {
                ticket.Title = updateDto.Title;
                ticket.Description = updateDto.Description;
                ticket.Status = updateDto.Status;
                ticket.Priority = updateDto.Priority;
                ticket.Category = updateDto.Category;
                ticket.AssignedToAgentId = updateDto.AssignedToAgentId;
            }

            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(userId!, ticket.Id, "Ticket Updated");

            return NoContent();
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> AssignTicket(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            ticket.AssignedToAgentId = userId;

            if (ticket.Status == "New")
                ticket.Status = "In Progress";

            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(userId!, ticket.Id, "Ticket Assigned");

            if (ticket.CreatedById != null && ticket.CreatedById != userId)
                await _notificationService.SendAsync(ticket.CreatedById, $"Ticket #{ticket.Id} has been assigned to an agent", ticket.Id);

            return Ok(new { message = "Ticket assigned successfully" });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            var validStatuses = new[] { "New", "In Progress", "Resolved", "Closed" };
            if (!validStatuses.Contains(dto.Status))
                return BadRequest("Invalid status value");

            ticket.Status = dto.Status;
            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(userId!, ticket.Id, "Status Changed", $"Changed to {dto.Status}");

            if (ticket.CreatedById != null && ticket.CreatedById != userId)
                await _notificationService.SendAsync(ticket.CreatedById, $"Ticket #{ticket.Id} status changed to {dto.Status}", ticket.Id);

            return Ok(new { message = "Status updated" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(userId!, null, "Ticket Deleted", $"Ticket #{id} deleted");

            return NoContent();
        }
    }

    public class ChangeStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
