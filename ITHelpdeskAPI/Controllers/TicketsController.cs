using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // All endpoints require authentication
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
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
            {
                query = query.Where(t => t.CreatedById == userId);
            }

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
                AssignedToAgentName = t.AssignedToAgent != null ? t.AssignedToAgent.UserName : null
            }).ToListAsync();

            return Ok(tickets);
        }

        // GET: api/Tickets/5
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
                AssignedToAgentName = ticket.AssignedToAgent?.UserName
            };

            return Ok(ticketDto);
        }

        // POST: api/Tickets
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
                CreatedById = userId
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await _context.Entry(ticket).Reference(t => t.CreatedBy).LoadAsync();

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                Priority = ticket.Priority,
                Category = ticket.Category,
                CreatedById = ticket.CreatedById,
                CreatedByName = ticket.CreatedBy?.UserName
            };

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
        }

        // PUT: api/Tickets/5
        // Employees can edit their own tickets (title, description, priority, category)
        // Admins and Agents can edit all fields including status and assigned agent
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
                // Employee: can only edit their own tickets
                if (ticket.CreatedById != userId)
                    return Forbid();

                // Limit editable fields for employees
                ticket.Title = updateDto.Title;
                ticket.Description = updateDto.Description;
                ticket.Priority = updateDto.Priority;
                ticket.Category = updateDto.Category;
                // status and AssignedToAgentId remain unchanged
            }
            else
            {
                // Admin/Agent: full edit
                ticket.Title = updateDto.Title;
                ticket.Description = updateDto.Description;
                ticket.Status = updateDto.Status;
                ticket.Priority = updateDto.Priority;
                ticket.Category = updateDto.Category;
                ticket.AssignedToAgentId = updateDto.AssignedToAgentId;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}