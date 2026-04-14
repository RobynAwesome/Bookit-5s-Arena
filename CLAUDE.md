# Bookit 5s Arena — Claude Code Instructions

## TOKEN CONSERVATION (MANDATORY — HIGHEST PRIORITY)

- **Zero preambles.** No "Let me...", "I'll...", "Great..." — act immediately.
- **Zero recaps.** No file lists, no summaries after completing work.
- **Zero narration.** Don't describe what tools you're calling.
- **No obvious comments.** Only comment non-obvious logic.
- **Targeted reads only.** offset/limit always. Never full read >150 lines unless required.
- **Batch all independent calls.** One message, parallel tool calls, always.
- **No speculative code.** Only what's asked. No extra error handling, no adjacent refactors.
- **Responses ≤5 lines** unless code, plans, or depth explicitly requested.
- **Warn at 50% context** — say "⚠ context ~50%" so user can checkpoint.
- **No agent spawning** unless task requires parallel work that would otherwise exceed context.

## SKILLS — NEVER AUTO-INVOKE (token cost is high)

Only invoke a skill when Master explicitly names it. Default = do the work directly.

| Risk | Skills — never touch unless named |
|------|-----------------------------------|
| CRITICAL | `brand-voice:*`, `engineering:*`, `design:*`, `sales:*`, `marketing:*`, `data:*`, `legal:*`, `human-resources:*`, `operations:*`, `product-management:*` |
| HIGH | `loop`, `schedule`, `anthropic-skills:pptx`, `anthropic-skills:docx`, `anthropic-skills:xlsx` |
| MEDIUM | `claude-api`, `simplify`, `keybindings-help` |
| OK if named | `update-config`, `anthropic-skills:pdf`, `engineering:code-review` |

**Rule:** If a skill is not explicitly requested by name, do the task with direct tools (Read, Edit, Bash, Grep, Glob). Skills spawn sub-agents = 2–10x token burn.

## Project Context

- **Stack:** Next.js 16 (App Router), React 19, JSX, MongoDB/Mongoose, NextAuth v4, Tailwind v4, Stripe
- **Currency:** ZAR (R)
- **Venue:** Hellenic FC, Milnerton, Cape Town
- **Domain:** fivesarena.com (IONOS)
- **Super admin:** rkholofelo@gmail.com

## Architecture Rules

- **4-tier:** Guest < User < Manager < Admin. Never expose higher-tier UI to lower.
- **God-mode:** /admin/* = rkholofelo@gmail.com only unless explicitly opened.
- **Files:** JSX (not TSX), App Router structure.
- **Commits:** `RobynAwesome <rkholofelo@gmail.com>`. New only, never amend unless asked.

## Code Rules (ABSOLUTE)

- **Full files only.** NEVER snippets. No "rest unchanged" placeholders.
- **Git:** `feat:` / `fix:` / `refactor:` / `docs:` prefix. User approves before push.
- **Complex tasks:** TODO list → confirmation → execute.
- **Unclear?** Ask one specific question. Don't assume.
- **Errors:** Flag immediately. Don't silently fix.

## Signals

| User Says | Action |
|-----------|--------|
| "Just do it" | Execute immediately, no confirmation |
| "Help me with..." | Collaborative back-and-forth |
| "Plan this" | TODO list + wait for confirmation |

## Web Searches

- Microsoft Edge workspaces only. Screenshot + read only. No clicks, no navigation, no asking user to scroll.
- If data exists in memory/vault, use that. Don't chase live screen reads.

## What NOT To Do

- No docstrings/comments on unchanged code
- No adjacent refactors
- No TypeScript types in JSX
- No README/docs unless asked
- No emoji in code or commits
- No hallucination — say "I don't know"
- No narrating tool limits
- No trailing "what would you like to do next?" prompts
- No asking user to interact with their screen
