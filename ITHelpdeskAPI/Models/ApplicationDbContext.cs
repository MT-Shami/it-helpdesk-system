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
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<TicketAttachment> TicketAttachments { get; set; }
        public DbSet<TicketCategory> TicketCategories { get; set; }
        public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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

            builder.Entity<TicketComment>()
                .HasOne(tc => tc.Ticket)
                .WithMany()
                .HasForeignKey(tc => tc.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TicketComment>()
                .HasOne(tc => tc.User)
                .WithMany()
                .HasForeignKey(tc => tc.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ActivityLog>()
                .HasOne(al => al.User)
                .WithMany()
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TicketAttachment>()
                .HasOne(ta => ta.Ticket)
                .WithMany()
                .HasForeignKey(ta => ta.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TicketAttachment>()
                .HasOne(ta => ta.UploadedBy)
                .WithMany()
                .HasForeignKey(ta => ta.UploadedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<KnowledgeBaseArticle>()
                .HasOne(kba => kba.CreatedBy)
                .WithMany()
                .HasForeignKey(kba => kba.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}