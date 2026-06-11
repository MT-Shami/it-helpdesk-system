namespace ITHelpdeskAPI.Services
{
    public class AiService : IAiService
    {
        private static readonly Random _random = new();

        private static readonly string[] Categories =
            { "Hardware", "Software", "Network", "Email", "Access Request", "Other" };

        private static readonly string[] Priorities =
            { "Low", "Medium", "High", "Critical" };

        private static readonly string[] Replies =
        {
            "Thank you for reaching out. I've reviewed the details and will begin working on this right away. I'll keep you updated on progress.",
            "I understand the issue you're facing. Let me run some diagnostics and get back to you with a solution within the next few hours.",
            "I've checked the system logs and found the root cause. We'll deploy a fix shortly. Please allow up to 2 hours for the changes to take effect.",
            "Thanks for providing those details. I've escalated this to our senior team for further investigation. You should hear back within 24 hours.",
            "I've reset the configuration on our end. Please try again now and let me know if the issue persists. If it does, we'll schedule a remote session.",
            "After investigating, this appears to be a known issue. Please follow the steps in KB article #2045: restart the service and clear the local cache. Let me know if that resolves it.",
            "I've submitted a request to the relevant team to process this. You should receive confirmation via email once completed. I'll monitor the ticket and follow up."
        };

        public AiService(HttpClient httpClient, IConfiguration configuration) { }

        public Task<AiSuggestionResult> SuggestCategoryAndPriorityAsync(string title, string description)
        {
            string category = InferCategory(title, description);
            string priority = InferPriority(title, description);
            return Task.FromResult(new AiSuggestionResult { Category = category, Priority = priority });
        }

        public Task<string> SuggestReplyAsync(string conversationHistory)
        {
            return Task.FromResult(Replies[_random.Next(Replies.Length)]);
        }

        public Task<string> ChatAsync(string userMessage)
        {
            return Task.FromResult(GenerateChatResponse(userMessage));
        }

        private static string InferCategory(string title, string description)
        {
            var text = (title + " " + description).ToLowerInvariant();

            if (text.Contains("network") || text.Contains("connect") || text.Contains("wifi")
                || text.Contains("vpn") || text.Contains("internet") || text.Contains("lan"))
                return "Network";

            if (text.Contains("email") || text.Contains("outlook") || text.Contains("exchange")
                || text.Contains("mail") || text.Contains("inbox"))
                return "Email";

            if (text.Contains("password") || text.Contains("login") || text.Contains("access")
                || text.Contains("permission") || text.Contains("account"))
                return "Access Request";

            if (text.Contains("computer") || text.Contains("laptop") || text.Contains("monitor")
                || text.Contains("keyboard") || text.Contains("mouse") || text.Contains("printer")
                || text.Contains("hardware") || text.Contains("device"))
                return "Hardware";

            if (text.Contains("software") || text.Contains("app") || text.Contains("program")
                || text.Contains("install") || text.Contains("update") || text.Contains("crash")
                || text.Contains("error") || text.Contains("bug") || text.Contains("windows")
                || text.Contains("office"))
                return "Software";

            return Categories[_random.Next(Categories.Length)];
        }

        private static string InferPriority(string title, string description)
        {
            var text = (title + " " + description).ToLowerInvariant();

            if (text.Contains("critical") || text.Contains("down") || text.Contains("outage")
                || text.Contains("emergency") || text.Contains("unable to work")
                || text.Contains("cannot access") || text.Contains("deadline"))
                return "Critical";

            if (text.Contains("urgent") || text.Contains("important") || text.Contains("blocked")
                || text.Contains("crash") || text.Contains("data loss") || text.Contains("security"))
                return "High";

            if (text.Contains("slow") || text.Contains("improvement") || text.Contains("request")
                || text.Contains("question") || text.Contains("help"))
                return "Low";

            return Priorities[_random.Next(Priorities.Length)];
        }

        private static string GenerateChatResponse(string message)
        {
            var text = message.ToLowerInvariant();

            if (text.Contains("vpn") || text.Contains("remote access"))
                return "To connect to the VPN, open the Cisco AnyConnect client, enter the VPN server address (vpn.company.com), and log in with your corporate credentials. If you're having trouble, make sure you're connected to the internet and try restarting the AnyConnect service. For persistent issues, contact the network team.";

            if (text.Contains("password") || text.Contains("reset") || text.Contains("forgot"))
                return "To reset your password, go to https://password.company.com and click 'Forgot Password'. Enter your corporate email and follow the instructions sent to your inbox. The new password must be at least 12 characters with uppercase, lowercase, a number, and a special character. If the self-service portal doesn't work, please submit an Access Request ticket.";

            if (text.Contains("printer") || text.Contains("print"))
                return "For printer issues, first check that the printer is powered on and connected to the network. Try restarting the print spooler service (run 'services.msc' and restart 'Print Spooler'). If the printer shows offline, go to Devices & Printers, right-click the printer, and select 'See what's printing' then 'Use Printer Online'. For persistent issues, include the printer model and IP address in a ticket.";

            if (text.Contains("email") || text.Contains("outlook") || text.Contains("mail"))
                return "For Outlook issues, first try restarting Outlook. If it hangs, open it in Safe Mode (outlook.exe /safe). Check if you can access webmail at https://outlook.office.com to see if the issue is client-side. Corrupt OST files can be fixed by closing Outlook, navigating to %localappdata%\\Microsoft\\Outlook, and renaming the .ost file — Outlook will recreate it on next launch.";

            if (text.Contains("wifi") || text.Contains("wireless") || text.Contains("network") || text.Contains("internet"))
                return "Basic network troubleshooting: 1) Run Windows Network Troubleshooter. 2) Open Command Prompt as admin and type 'ipconfig /release' then 'ipconfig /renew'. 3) Type 'ipconfig /flushdns'. 4) Restart your computer. If you're on Wi-Fi, try connecting via ethernet to isolate the issue. If the problem persists, please include your IP address (type 'ipconfig' in CMD) when submitting a ticket.";

            if (text.Contains("slow") || text.Contains("lag") || text.Contains("performance"))
                return "For slow computer performance: 1) Check Task Manager for high CPU/memory usage. 2) Close unused browser tabs and applications. 3) Clear temporary files using Disk Cleanup. 4) Restart the computer. 5) Ensure Windows Updates are installed. If the issue persists, submit a ticket with your computer's specs and what you were doing when the slowdown occurred.";

            if (text.Contains("software") || text.Contains("install") || text.Contains("application"))
                return "To install new software, you'll need admin rights. Go to Software Center (Start Menu > Microsoft System Center > Software Center) and browse available applications. If the software isn't listed, submit a Software Request ticket with the software name, version, and business justification. For self-installable software, right-click the installer and select 'Run as Administrator'.";

            if (text.Contains("teams") || text.Contains("zoom") || text.Contains("meeting"))
                return "For Teams/Zoom issues: 1) Check your audio devices in Settings > Devices. 2) Run the audio/video test call. 3) Clear the app cache (%appdata%\\Microsoft\\Teams for Teams). 4) Reinstall the application. For meeting join issues, try joining via web browser instead of the desktop app as a temporary workaround.";

            if (text.Contains("hello") || text.Contains("hi") || text.Contains("hey"))
                return "Hello! I'm the IT Helpdesk Assistant. I can help with common topics: VPN, password resets, printer issues, email/Outlook, Wi-Fi/network problems, slow computers, software installation, and Teams/Zoom. Just describe your issue and I'll do my best to help. For complex issues, I'll recommend opening a ticket.";

            return "I'm not sure I understand your question. Could you please rephrase or provide more details? You can ask me about: VPN connection, password reset, printer issues, email/Outlook, Wi-Fi/network problems, slow computer, software installation, or Teams/Zoom. If you need immediate assistance, please open a ticket and an agent will help you shortly.";
        }
    }
}
