-- 1. Users Table (Holds Employees, Agents, Managers, Admins)
CREATE TABLE [User] (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL, -- Foreign key to Roles table
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2 NULL
);

-- 2. Roles Table
CREATE TABLE Role (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);

-- 3. TicketCategories Table
CREATE TABLE TicketCategory (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL UNIQUE
);

-- 4. Tickets Table (Core Table)
CREATE TABLE Ticket (
    TicketId INT PRIMARY KEY IDENTITY(1,1),
    TicketReferenceNumber NVARCHAR(20) NOT NULL UNIQUE, 
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'New',
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Medium',
    CreatedById INT NOT NULL FOREIGN KEY REFERENCES [User](UserId),
    AssignedToAgentId INT NULL FOREIGN KEY REFERENCES [User](UserId),
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES TicketCategory(CategoryId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    ResolvedAt DATETIME2 NULL,
    ClosedAt DATETIME2 NULL
);

-- 5. TicketComments Table
CREATE TABLE TicketComment (
    CommentId INT PRIMARY KEY IDENTITY(1,1),
    TicketId INT NOT NULL FOREIGN KEY REFERENCES Ticket(TicketId) ON DELETE CASCADE,
    UserId INT NOT NULL FOREIGN KEY REFERENCES [User](UserId),
    CommentText NVARCHAR(MAX) NOT NULL,
    IsInternal BIT NOT NULL DEFAULT 0, 
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 6. TicketAttachments Table
CREATE TABLE TicketAttachment (
    AttachmentId INT PRIMARY KEY IDENTITY(1,1),
    TicketId INT NOT NULL FOREIGN KEY REFERENCES Ticket(TicketId) ON DELETE CASCADE,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    FileSizeBytes INT NOT NULL,
    UploadedById INT NOT NULL FOREIGN KEY REFERENCES [User](UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 7. ActivityLogs Table (Audit Trail)
CREATE TABLE ActivityLog (
    LogId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES [User](UserId),
    Action NVARCHAR(255) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IpAddress NVARCHAR(45) NULL
);