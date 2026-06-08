using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ITHelpdeskAPI.Models;

namespace ITHelpdeskAPI.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships for Ticket entity
            builder.Entity<Ticket>()
                .HasOne(t => t.CreatedBy)
                .WithMany()
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Ticket>()
                .HasOne(t => t.AssignedToAgent)
                .WithMany()
                .HasForeignKey(t => t.AssignedToAgentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}