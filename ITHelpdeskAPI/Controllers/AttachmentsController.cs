using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/Tickets/{ticketId}/attachments")]
    [ApiController]
    [Authorize]
    public class AttachmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AttachmentsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult> GetAttachments(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            var attachments = await _context.TicketAttachments
                .Where(a => a.TicketId == ticketId)
                .Select(a => new
                {
                    a.Id,
                    a.FileName,
                    a.FileSizeBytes,
                    a.UploadedAt,
                    DownloadUrl = $"/api/Tickets/{ticketId}/attachments/{a.Id}/download"
                })
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpPost]
        public async Task<ActionResult> UploadAttachment(int ticketId, List<IFormFile> files)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads");
            Directory.CreateDirectory(uploadsDir);

            var results = new List<object>();

            foreach (var file in files)
            {
                if (file.Length == 0)
                    continue;

                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsDir, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var attachment = new TicketAttachment
                {
                    TicketId = ticketId,
                    FileName = file.FileName,
                    FilePath = $"/uploads/{uniqueFileName}",
                    FileSizeBytes = file.Length,
                    UploadedById = userId,
                    UploadedAt = DateTime.UtcNow
                };

                _context.TicketAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                results.Add(new
                {
                    attachment.Id,
                    attachment.FileName,
                    attachment.FileSizeBytes,
                    attachment.UploadedAt
                });
            }

            return Ok(results);
        }

        [HttpGet("{attachmentId}/download")]
        public async Task<IActionResult> DownloadAttachment(int ticketId, int attachmentId)
        {
            var attachment = await _context.TicketAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.TicketId == ticketId);

            if (attachment == null)
                return NotFound();

            var filePath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", Path.GetFileName(attachment.FilePath));

            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found on disk");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Seek(0, SeekOrigin.Begin);

            var contentType = "application/octet-stream";
            return File(memory, contentType, attachment.FileName);
        }

        [HttpDelete("/api/Attachments/{id}")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> DeleteAttachment(int id)
        {
            var attachment = await _context.TicketAttachments.FindAsync(id);
            if (attachment == null)
                return NotFound();

            var filePath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", Path.GetFileName(attachment.FilePath));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.TicketAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
