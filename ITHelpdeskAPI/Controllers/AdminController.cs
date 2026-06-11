using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("users")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    user.UserName,
                    user.IsActive,
                    Roles = roles
                });
            }

            return Ok(result);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.Role);

            return NoContent();
        }

        [HttpPost("users/{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.IsActive = !user.IsActive;
            await _userManager.UpdateAsync(user);

            return Ok(new { user.IsActive });
        }

        [HttpGet("categories")]
        public async Task<ActionResult> GetCategories()
        {
            var categories = await _context.TicketCategories.ToListAsync();
            return Ok(categories);
        }

        [HttpPost("categories")]
        public async Task<ActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Category name is required");

            var category = new TicketCategory { Name = dto.Name.Trim() };
            _context.TicketCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
        {
            var category = await _context.TicketCategories.FindAsync(id);
            if (category == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Category name is required");

            category.Name = dto.Name.Trim();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.TicketCategories.FindAsync(id);
            if (category == null)
                return NotFound();

            var hasTickets = await _context.Tickets.AnyAsync(t => t.Category == category.Name);
            if (hasTickets)
                return BadRequest("Cannot delete category that is in use by tickets");

            _context.TicketCategories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ChangeRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
