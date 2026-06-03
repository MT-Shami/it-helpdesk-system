using Microsoft.AspNetCore.Identity;

namespace ITHelpdeskAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
    }
}