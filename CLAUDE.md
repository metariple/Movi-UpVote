# MoviUpVote

Уютный топ фильмов и сериалов для тусовки. Next.js (App Router) + Supabase (Postgres + Auth + RLS) + Vercel.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing
When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.
- Product ideas/brainstorming → /office-hours
- Architecture → /plan-eng-review
- Design system → /design-consultation; visual polish → /design-review
- Bugs/errors → /investigate
- QA/testing site behavior → /qa or /qa-only
- Code review/diff check → /review
- Ship/deploy/PR → /ship or /land-and-deploy
