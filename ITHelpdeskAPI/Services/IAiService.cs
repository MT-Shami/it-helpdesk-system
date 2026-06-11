namespace ITHelpdeskAPI.Services
{
    public class AiSuggestionResult
    {
        public string Category { get; set; } = "Other";
        public string Priority { get; set; } = "Medium";
    }

    public interface IAiService
    {
        Task<AiSuggestionResult> SuggestCategoryAndPriorityAsync(string title, string description);
        Task<string> SuggestReplyAsync(string conversationHistory);
        Task<string> ChatAsync(string userMessage);
    }
}
