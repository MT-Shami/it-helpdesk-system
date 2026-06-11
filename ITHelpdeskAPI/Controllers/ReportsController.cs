using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHelpdeskAPI.Models;
using ClosedXML.Excel;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Agent,Manager")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("ticket-stats")]
        public async Task<ActionResult> GetTicketStats()
        {
            var statusCounts = await _context.Tickets
                .GroupBy(t => t.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var priorityCounts = await _context.Tickets
                .GroupBy(t => t.Priority)
                .Select(g => new { Priority = g.Key, Count = g.Count() })
                .ToListAsync();

            var categoryCounts = await _context.Tickets
                .GroupBy(t => t.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            var agentCounts = await _context.Tickets
                .Where(t => t.AssignedToAgentId != null)
                .GroupBy(t => t.AssignedToAgent!.UserName)
                .Select(g => new { Agent = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                totalTickets = await _context.Tickets.CountAsync(),
                byStatus = statusCounts,
                byPriority = priorityCounts,
                byCategory = categoryCounts,
                perAgent = agentCounts
            });
        }

        [HttpGet("monthly-tickets")]
        public async Task<ActionResult> GetMonthlyTickets()
        {
            var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);

            var created = await _context.Tickets
                .Where(t => t.CreatedAt >= twelveMonthsAgo)
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            return Ok(new { monthlyCreated = created });
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export([FromQuery] string format = "excel", [FromQuery] string type = "ticket-list")
        {
            var tickets = await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedToAgent)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Tickets");

            worksheet.Cell(1, 1).Value = "Ticket #";
            worksheet.Cell(1, 2).Value = "Title";
            worksheet.Cell(1, 3).Value = "Status";
            worksheet.Cell(1, 4).Value = "Priority";
            worksheet.Cell(1, 5).Value = "Category";
            worksheet.Cell(1, 6).Value = "Created By";
            worksheet.Cell(1, 7).Value = "Assigned To";
            worksheet.Cell(1, 8).Value = "Created At";

            var headerRange = worksheet.Range(1, 1, 1, 8);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            for (int i = 0; i < tickets.Count; i++)
            {
                var t = tickets[i];
                worksheet.Cell(i + 2, 1).Value = t.Id;
                worksheet.Cell(i + 2, 2).Value = t.Title;
                worksheet.Cell(i + 2, 3).Value = t.Status;
                worksheet.Cell(i + 2, 4).Value = t.Priority;
                worksheet.Cell(i + 2, 5).Value = t.Category;
                worksheet.Cell(i + 2, 6).Value = t.CreatedBy?.FullName ?? t.CreatedBy?.UserName ?? "";
                worksheet.Cell(i + 2, 7).Value = t.AssignedToAgent?.FullName ?? t.AssignedToAgent?.UserName ?? "Unassigned";
                worksheet.Cell(i + 2, 8).Value = t.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Seek(0, SeekOrigin.Begin);

            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "tickets.xlsx");
        }
    }
}
