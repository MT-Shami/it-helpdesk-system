using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/kb/articles")]
    [ApiController]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KnowledgeBaseController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetArticles([FromQuery] string? category, [FromQuery] string? q)
        {
            var query = _context.KnowledgeBaseArticles
                .Where(a => a.IsApproved)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(a => a.Category == category);

            if (!string.IsNullOrEmpty(q))
                query = query.Where(a => a.Title.Contains(q) || a.Content.Contains(q));

            var articles = await query
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Category,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync();

            return Ok(articles);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetArticle(int id)
        {
            var isAuthenticated = User.Identity?.IsAuthenticated == true;

            KnowledgeBaseArticle? article;
            if (isAuthenticated)
                article = await _context.KnowledgeBaseArticles.FirstOrDefaultAsync(a => a.Id == id);
            else
                article = await _context.KnowledgeBaseArticles.FirstOrDefaultAsync(a => a.Id == id && a.IsApproved);

            if (article == null)
                return NotFound();

            return Ok(new
            {
                article.Id,
                article.Title,
                article.Content,
                article.Category,
                article.IsApproved,
                article.CreatedAt,
                article.UpdatedAt
            });
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return Ok(Array.Empty<object>());

            var articles = await _context.KnowledgeBaseArticles
                .Where(a => a.IsApproved && (a.Title.Contains(q) || a.Content.Contains(q)))
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new { a.Id, a.Title, a.Category, a.CreatedAt })
                .ToListAsync();

            return Ok(articles);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateArticle([FromBody] CreateArticleDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var article = new KnowledgeBaseArticle
            {
                Title = dto.Title,
                Content = dto.Content,
                Category = dto.Category,
                IsApproved = dto.IsApproved,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.KnowledgeBaseArticles.Add(article);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateArticle(int id, [FromBody] CreateArticleDto dto)
        {
            var article = await _context.KnowledgeBaseArticles.FindAsync(id);
            if (article == null)
                return NotFound();

            article.Title = dto.Title;
            article.Content = dto.Content;
            article.Category = dto.Category;
            article.IsApproved = dto.IsApproved;
            article.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _context.KnowledgeBaseArticles.FindAsync(id);
            if (article == null)
                return NotFound();

            _context.KnowledgeBaseArticles.Remove(article);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateArticleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false;
    }
}
