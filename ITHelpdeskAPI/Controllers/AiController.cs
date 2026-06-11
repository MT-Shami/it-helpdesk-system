using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ITHelpdeskAPI.Services;

namespace ITHelpdeskAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("suggest-category-priority")]
        public async Task<ActionResult> SuggestCategoryAndPriority([FromBody] SuggestTicketDto dto)
        {
            var result = await _aiService.SuggestCategoryAndPriorityAsync(dto.Title, dto.Description);
            return Ok(result);
        }

        [HttpPost("suggest-reply")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<ActionResult> SuggestReply([FromBody] SuggestReplyDto dto)
        {
            var reply = await _aiService.SuggestReplyAsync(dto.ConversationHistory);
            return Ok(new { suggestedReply = reply });
        }

        [HttpPost("chat")]
        public async Task<ActionResult> Chat([FromBody] ChatDto dto)
        {
            var reply = await _aiService.ChatAsync(dto.Message);
            return Ok(new { reply });
        }
    }

    public class SuggestTicketDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class SuggestReplyDto
    {
        public string ConversationHistory { get; set; } = string.Empty;
    }

    public class ChatDto
    {
        public string Message { get; set; } = string.Empty;
    }
}
