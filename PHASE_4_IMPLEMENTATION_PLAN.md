# Phase 4: AI Integration - Implementation Plan

**Status:** In Progress
**Start Date:** December 26, 2025
**Estimated Duration:** 4 weeks
**Priority:** Optional / Differentiation Feature

---

## Overview

Phase 4 adds Claude-powered AI capabilities to the email editor, enabling users to:
- Generate complete emails from text prompts
- Enhance existing content (grammar, tone, clarity)
- Chat with AI for iterative improvements
- Auto-generate alt text for images
- Get smart template recommendations

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Email Editor UI                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Canvas     │  │  AI Chat     │  │   Sidebar    │      │
│  │   Area       │  │  Sidebar     │  │   Controls   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Service Layer (lib/ai/)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ClaudeService (Primary API Client)                  │  │
│  │  - Message streaming                                 │  │
│  │  - Token management                                  │  │
│  │  - Error handling & retries                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Email Gen   │  │  Content     │  │  Alt Text    │     │
│  │  Service     │  │  Enhancement │  │  Generator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Anthropic Claude API                            │
│  - Claude Sonnet 4.5 (primary model)                        │
│  - Structured output (JSON mode)                            │
│  - Multi-turn conversations                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Week 1: Foundation Setup
**Goal:** Set up infrastructure and basic AI service

#### Tasks:
1. ✅ Install Anthropic SDK
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. ✅ Add environment variables
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   VITE_AI_MODEL=claude-sonnet-4-5-20250929
   VITE_AI_MAX_TOKENS=4096
   VITE_AI_DAILY_BUDGET=5.00
   ```

3. ✅ Create AI context provider (`src/lib/ai/AIContext.tsx`)
   - State management for AI sidebar
   - Processing state
   - Cost tracking
   - Message history

4. ✅ Create base ClaudeService (`src/lib/ai/services/ClaudeService.ts`)
   - API client wrapper
   - Token counting
   - Error handling
   - Rate limiting

5. ✅ Add AI provider to main App

#### Deliverables:
- Anthropic SDK installed
- Basic AI service layer
- Environment configuration
- AI context provider

---

### Week 2: UI Components
**Goal:** Build AI sidebar and floating button

#### Tasks:
1. ✅ Create AI Floating Button (`src/components/ai/AIFloatingButton.tsx`)
   - Purple gradient button
   - Sparkles icon
   - Budget warning badge
   - Keyboard shortcut (⌘K)

2. ✅ Create AI Sidebar (`src/components/ai/AISidebar.tsx`)
   - Slide-in from right
   - 3 tabs: Generate, Enhance, Chat
   - Cost tracker header
   - Model info footer

3. ✅ Create Generate Tab (`src/components/ai/tabs/GenerateTab.tsx`)
   - Template selection (Newsletter, Event, Emergency, etc.)
   - Prompt input
   - School context (name, audience, tone)
   - Generate button

4. ✅ Create Enhance Tab (`src/components/ai/tabs/EnhanceTab.tsx`)
   - Content selection
   - Enhancement types (Grammar, Tone, Clarity)
   - Before/after diff viewer
   - Accept/reject changes

5. ✅ Create Chat Tab (`src/components/ai/tabs/ChatTab.tsx`)
   - Message history
   - User input field
   - Suggested prompts
   - AI responses

#### Deliverables:
- Functional AI sidebar UI
- All 3 tabs implemented
- Floating button working
- Keyboard shortcuts

---

### Week 3: AI Services & API Routes
**Goal:** Implement core AI functionality

#### Tasks:
1. ✅ Create Email Generator Service (`src/lib/ai/services/EmailGenerator.ts`)
   - Parse user prompts
   - Generate EmailBlock[] structure
   - Apply school branding
   - Handle different templates

2. ✅ Create Content Enhancer Service (`src/lib/ai/services/ContentEnhancer.ts`)
   - Grammar checking
   - Tone adjustment
   - Readability improvements
   - Diff generation

3. ✅ Create Alt Text Generator (`src/lib/ai/services/AltTextGenerator.ts`)
   - Image analysis
   - Descriptive text generation
   - Accessibility compliance

4. ✅ Create System Prompts (`src/lib/ai/prompts/systemPrompts.ts`)
   - Base email editor prompt
   - Template-specific prompts
   - School communication guidelines

5. ✅ Create API Routes (if using backend)
   - `/api/ai/generate` - Email generation
   - `/api/ai/enhance` - Content enhancement
   - `/api/ai/chat` - Chat completions
   - `/api/ai/alt-text` - Alt text generation

#### Deliverables:
- AI services working
- API routes functional
- System prompts optimized
- Error handling in place

---

### Week 4: Integration & Polish
**Goal:** Connect AI to editor, test, and refine

#### Tasks:
1. ✅ Connect AI to Email Editor
   - Apply generated blocks to canvas
   - Update existing blocks
   - Handle undo/redo
   - Save AI-generated content

2. ✅ Implement Cost Tracking
   - Token usage calculation
   - Daily budget monitoring
   - Warning notifications
   - Cost analytics

3. ✅ Add Error Handling
   - API failures (retry logic)
   - Rate limiting
   - Invalid responses
   - User feedback

4. ✅ Testing
   - Unit tests for AI services
   - Integration tests for API routes
   - E2E tests for user workflows
   - Performance testing

5. ✅ Documentation
   - User guide ("How to use AI features")
   - Prompt engineering tips
   - Developer documentation
   - API key setup instructions

#### Deliverables:
- Fully integrated AI features
- Comprehensive error handling
- Complete test coverage
- User documentation

---

## File Structure

```
/src
├── lib/ai/
│   ├── AIContext.tsx                  # AI state management
│   │
│   ├── services/
│   │   ├── ClaudeService.ts           # Main API client
│   │   ├── EmailGenerator.ts          # Email generation logic
│   │   ├── ContentEnhancer.ts         # Text improvement
│   │   ├── AltTextGenerator.ts        # Image alt text
│   │   └── RateLimiter.ts             # API quota management
│   │
│   ├── prompts/
│   │   ├── systemPrompts.ts           # Base system instructions
│   │   ├── templatePrompts.ts         # Template-specific prompts
│   │   └── enhancementPrompts.ts      # Content improvement prompts
│   │
│   ├── types/
│   │   ├── ai.ts                      # AI-specific interfaces
│   │   └── commands.ts                # Command structure types
│   │
│   └── utils/
│       ├── tokenCounter.ts            # Estimate token usage
│       ├── costCalculator.ts          # Cost estimation
│       └── errorHandler.ts            # AI error handling
│
├── components/ai/
│   ├── AIFloatingButton.tsx           # FAB trigger
│   ├── AISidebar.tsx                  # Main sidebar
│   │
│   └── tabs/
│       ├── GenerateTab.tsx            # Email generation
│       ├── EnhanceTab.tsx             # Content enhancement
│       └── ChatTab.tsx                # AI chat interface
│
└── api/ (server-side if needed)
    └── ai/
        ├── generate.ts                # Email generation endpoint
        ├── enhance.ts                 # Content enhancement
        ├── chat.ts                    # Chat completions
        └── alt-text.ts                # Alt text generation
```

---

## Key Features

### 1. Email Generation
**User Flow:**
1. Click AI button (floating or in sidebar)
2. Select template type (Newsletter, Event, etc.)
3. Enter prompt: "Create a newsletter about parent-teacher conferences"
4. Provide context (school name, audience, tone)
5. Click "Generate"
6. AI generates complete email with blocks
7. Review and edit as needed
8. Save to canvas

**Technical:**
- Uses Claude Sonnet 4.5 for generation
- Structured JSON output (EmailBlock[])
- School branding applied automatically
- Validates generated content
- Estimates ~1000 tokens input, ~2000 output

### 2. Content Enhancement
**User Flow:**
1. Select text block on canvas
2. Click "Enhance" in AI sidebar
3. Choose enhancement type:
   - Fix grammar/spelling
   - Make more professional
   - Simplify language
   - Make more engaging
4. Review changes (diff view)
5. Accept or reject

**Technical:**
- Uses Claude Haiku 4.5 for speed
- Shows before/after comparison
- Preserves formatting
- Undo supported
- Estimates ~500 tokens

### 3. AI Chat
**User Flow:**
1. Open AI chat tab
2. Type natural language commands:
   - "Add a red button that says Register"
   - "Make the heading larger"
   - "Change email to a 2-column layout"
3. AI executes commands
4. Review changes on canvas
5. Continue iterating

**Technical:**
- Multi-turn conversation context
- Executes structured commands
- Real-time canvas updates
- Command history
- Estimates ~300-800 tokens per exchange

### 4. Alt Text Generation
**User Flow:**
1. Upload image to block
2. AI automatically generates alt text
3. User can edit or approve
4. Alt text saved with image

**Technical:**
- Auto-triggers on image upload
- Uses Claude Haiku 4.5 (fast)
- Describes image content
- Accessibility compliant
- Estimates ~100-200 tokens

---

## Model Selection Strategy

**Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) - **PRIMARY MODEL**
- Use for: Email generation, complex enhancements, chat
- Why: Best balance of speed, cost, and quality
- Cost: $3/1M input tokens, $15/1M output tokens
- Speed: ~3-5 seconds for email generation

**Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) - **QUICK TASKS**
- Use for: Alt text, simple enhancements, quick fixes
- Why: Extremely fast and cost-effective
- Cost: Lower than Sonnet
- Speed: ~1-2 seconds

**Claude Opus 4.5** (`claude-opus-4-5-20251101`) - **PREMIUM (Future)**
- Use for: Complex multi-email campaigns, advanced features
- Why: Highest quality for sophisticated tasks
- Cost: Higher than Sonnet
- Speed: Slower but highest quality

---

## Cost Estimation

### Per-Operation Costs:
- Email Generation: ~$0.036 per email (1K input + 2K output)
- Content Enhancement: ~$0.015 per enhancement (500 tokens)
- AI Chat: ~$0.012 per message (300-800 tokens)
- Alt Text: ~$0.003 per image (100-200 tokens)

### Monthly Estimates:
- 100 emails/month: ~$3.60
- 1,000 emails/month: ~$36
- 10,000 emails/month: ~$360

### Daily Budget:
- Default: $5.00/day (~140 email generations)
- Configurable per user/organization
- Warning at 50%, 80%, 100%
- Auto-reset at midnight

---

## Security & Privacy

### API Key Management:
- Store in `.env` (never commit)
- Use server-side API routes (not client-side)
- Implement key rotation policy
- Monitor usage and costs

### Data Privacy:
- **FERPA Compliance:** Never send student personal data
- **Content Filtering:** Scrub sensitive info before API calls
- **No Logging:** Don't log user email content
- **Clear Privacy Policy:** Inform users about AI usage

### Input Validation:
- Sanitize all user inputs
- Limit prompt length (max 2000 characters)
- Block code injection attempts
- Validate AI responses before rendering

### Output Validation:
- Sanitize all generated HTML
- Check for malicious URLs
- Validate block structure
- Apply content security policies

---

## Testing Strategy

### Unit Tests:
```typescript
describe('ClaudeService', () => {
  it('generates valid email blocks from prompt', async () => {
    const service = new ClaudeService(TEST_API_KEY)
    const blocks = await service.generateEmail('Create a newsletter')
    expect(blocks).toBeInstanceOf(Array)
    expect(blocks.length).toBeGreaterThan(0)
  })

  it('handles API errors gracefully', async () => {
    const service = new ClaudeService('invalid-key')
    await expect(service.generateEmail('test')).rejects.toThrow()
  })

  it('respects daily budget limits', async () => {
    // Test budget enforcement
  })
})
```

### Integration Tests:
- Test full flow: Prompt → API → Canvas update
- Test multi-turn chat conversations
- Test undo/redo with AI changes
- Test cost tracking accuracy

### E2E Tests:
- User generates email via AI
- User enhances existing content
- User chats with AI to modify email
- User uploads image and gets alt text

### Manual Testing Checklist:
- [ ] AI generates appropriate emails for each template type
- [ ] Enhanced content matches requested tone
- [ ] Chat commands execute correctly
- [ ] Alt text is descriptive and accurate
- [ ] Cost tracking is accurate
- [ ] Error messages are helpful
- [ ] Performance is acceptable (<5s for email generation)
- [ ] Undo/redo works with AI changes

---

## Risk Mitigation

### Technical Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API downtime | Medium | High | Fallback to manual editing, queue requests, retry logic |
| Rate limiting | Medium | Medium | Implement request queue, monitor usage, upgrade tier |
| Poor AI outputs | Low | Medium | Human review always required, refinement prompts |
| High costs | Medium | High | Daily budget limits, cost tracking, usage alerts |
| Security breach | Low | Critical | Server-side API, never expose keys, input validation |

### User Risks:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Over-reliance on AI | Medium | Low | Education, always allow manual editing |
| Privacy concerns | Low | High | Clear privacy policy, FERPA compliance, no data logging |
| Learning curve | Medium | Low | Tooltips, tutorials, suggested prompts, examples |
| Budget overruns | Medium | Medium | Real-time cost display, warnings, hard limits |

---

## Success Metrics

### Adoption:
- **Goal:** 60% of users try AI features within first month
- **Measurement:** Track unique users of AI chat

### Efficiency:
- **Goal:** Reduce email creation time by 40%
- **Measurement:** Time from start to save (before/after AI)

### Quality:
- **Goal:** 70% of AI-generated emails used with <5 edits
- **Measurement:** Track edit count after AI generation

### Satisfaction:
- **Goal:** 4+ star rating for AI features
- **Measurement:** In-app feedback surveys

### Cost:
- **Goal:** Stay within budget 95% of the time
- **Measurement:** Budget overrun incidents

---

## Future Enhancements (Phase 5+)

### Short-term (3-6 months):
- Image generation (AI-created graphics)
- Multi-language translation
- A/B testing suggestions
- Subject line optimization
- Send time recommendations

### Long-term (6-12 months):
- Personalization (dynamic content per recipient)
- Analytics prediction (open rate, click rate estimates)
- Voice-to-email (speech recognition)
- Multi-channel (SMS, social posts)
- Workflow automation

---

## Documentation Requirements

### User Documentation:
1. **Quick Start Guide:** "Generate Your First Email with AI"
2. **Video Tutorial:** Screen recording of email generation
3. **Prompt Library:** 20+ example prompts for different email types
4. **FAQ:** Common questions and troubleshooting
5. **Best Practices:** How to write effective prompts

### Developer Documentation:
1. **API Integration Guide:** How to add new AI features
2. **Prompt Engineering:** Best practices for school context
3. **Architecture Diagram:** Visual system overview
4. **Testing Guide:** How to test AI features
5. **Deployment Guide:** Environment setup and configuration

---

## Next Steps

### Immediate (Today):
1. ✅ Install Anthropic SDK
2. ✅ Set up environment variables
3. ✅ Create AI context provider
4. ✅ Create basic ClaudeService

### This Week:
1. ⏳ Build AI sidebar UI
2. ⏳ Implement Generate tab
3. ⏳ Test email generation
4. ⏳ Add error handling

### Next Week:
1. ⏳ Implement Enhance tab
2. ⏳ Implement Chat tab
3. ⏳ Add cost tracking
4. ⏳ Create API routes

### Week 3-4:
1. ⏳ Full integration testing
2. ⏳ Documentation
3. ⏳ User testing
4. ⏳ Launch preparation

---

## Questions & Decisions

### Open Questions:
- [ ] Budget approval for API costs?
- [ ] Preferred rollout strategy (beta users first)?
- [ ] Which model to use as default (Sonnet vs Haiku)?
- [ ] Should we support custom system prompts?
- [ ] Integration with existing school systems?

### Design Decisions:
- ✅ Sidebar on right side (consistent with existing UI)
- ✅ Floating button in bottom-right corner
- ✅ 3-tab structure (Generate, Enhance, Chat)
- ✅ Daily budget limit with warnings
- ✅ Cost displayed prominently

### Technical Decisions:
- ✅ Use Anthropic SDK (not raw API)
- ✅ Client-side for MVP, server-side for production
- ✅ Zustand for local state, AI context for global
- ✅ React Hot Toast for notifications
- ✅ No streaming initially (add later)

---

**Document Version:** 1.0
**Last Updated:** December 26, 2025
**Status:** Ready for Implementation
