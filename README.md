# IT Help Desk & Ticketing Management System

A full-stack enterprise help desk system with role-based access, ticket management, assignment workflow, comments, notifications, file attachments, reporting, admin panel, knowledge base, and AI-assisted features.

---

## ✨ Features

### Core Features

* **Authentication & Authorization** – JWT with roles: Employee, Agent, Admin, Manager
* **Ticket CRUD** – Create, read, update, delete tickets with categories & priorities
* **Ticket Assignment** – Agents can assign tickets to themselves or others
* **Status Workflow** – New → In Progress → Resolved → Closed (role-controlled)
* **Comments & Internal Notes** – Public replies and agent-only notes
* **Activity Logs** – Full audit trail of every action on a ticket
* **In-App Notifications** – Real-time alerts for assignments, status changes, and new comments
* **File Attachments** – Upload, download, and delete attachments per ticket
* **Reporting** – Dashboard charts (status, monthly trends, categories) with Excel export
* **Knowledge Base** – Searchable articles managed by administrators
* **Admin Panel** – User management, role assignment, account activation/deactivation, and category management
* **AI Features (Mock)** – Category suggestion, priority prediction, reply suggestion, and chat assistant (works without an API key)

### UI / UX

* Modern SaaS-inspired interface using **Tailwind CSS**
* Collapsible left sidebar navigation
* Responsive design (desktop-first and mobile-friendly)
* Color-coded status and priority badges
* Real-time notification bell

---

## 🛠️ Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| Backend      | ASP.NET Core 8 Web API, Entity Framework Core, JWT |
| Database     | SQL Server (LocalDB / SQL Express)                 |
| Frontend     | React 18, Tailwind CSS, Axios, React Router        |
| Charts       | Recharts                                           |
| Excel Export | ClosedXML                                          |
| AI (Mock)    | Keyword-based responses (No external API)          |

---

## 📦 Installation & Setup

### Prerequisites

* .NET 8 SDK
* Node.js 18+
* SQL Server (LocalDB supported)

---

### Backend Setup

```bash
cd ITHelpdeskAPI
dotnet restore
dotnet ef database update
dotnet run
```

The API runs at:

* `http://localhost:5018`
* `https://localhost:7142`

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will open at:

```
http://localhost:3000
```

---

## ⚙️ Configuration

Update the backend API URL inside:

```
frontend/src/services/api.js
```

Default:

```javascript
http://localhost:5018/api
```

---

## 👤 Default Test Account

| Email                                         | Password | Roles           |
| --------------------------------------------- | -------- | --------------- |
| [employee@test.com](mailto:employee@test.com) | Test@123 | Employee, Agent |

This account can be used to test:

### Employee Features

* Create tickets
* View personal tickets
* Add comments
* Upload attachments

### Agent Features

* Assign tickets
* Update ticket status
* Add internal notes
* Access reports

To test **Admin** features, promote this user via SQL or create a separate administrator account.

---

## 🧪 Testing the AI Features

### AI Ticket Suggestions

1. Create a new ticket
2. Enter a title and description
3. Click **AI Suggest**
4. Category and priority will automatically populate based on keywords

### AI Reply Assistant

1. Open a ticket as an Agent
2. Click **Suggest Reply**
3. A recommended response will appear

### AI Chat Assistant

Use the floating chat bubble in the bottom-right corner to ask common IT support questions, such as:

* VPN issues
* Password resets
* Printer problems
* Email access
* Basic troubleshooting

---


## 🧑‍💻 Author

**Mohammad Taha Al Shami**
Full Stack Developer

**IDS Academy Internship Project**

---

## 📄 License

This project was created as an academic internship assignment.

---

## 🔗 Repository

https://github.com/MT-Shami/it-helpdesk-system
