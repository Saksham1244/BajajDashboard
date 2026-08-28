# Agent Guidelines & gstack Skills

## gstack Skills Suite

This repository is equipped with the full **gstack** skill suite by Garry Tan. The skills are installed locally under `.agents/skills/` and available globally across the system.

### Available Skills Quick Reference

| Stage | Command / Skill | Role & Responsibility |
| :--- | :--- | :--- |
| **Think** | `/office-hours` | **YC Office Hours** — Six forcing questions to clarify problem, status quo, and wedge. |
| **Plan** | `/plan-ceo-review` | **CEO / Founder Review** — Rethink scope and discover the 10-star product. |
| **Plan** | `/plan-eng-review` | **Eng Manager Review** — Lock in architecture, failure modes, data flow, and test plans. |
| **Plan** | `/plan-design-review` | **Senior Designer Review** — 0-10 design dimension scoring and AI slop detection. |
| **Plan** | `/plan-devex-review` | **Developer Experience Review** — DX benchmarking, TTHW timing, and friction audit. |
| **Plan** | `/autoplan` | **Automated Review Pipeline** — Runs CEO $\rightarrow$ Design $\rightarrow$ Eng $\rightarrow$ DX reviews automatically. |
| **Design** | `/design-consultation` | **Design Partner** — Establishes brand design system and creative risks from scratch. |
| **Design** | `/design-shotgun` | **Design Explorer** — Generates 4-6 AI UI mockup variants for visual iteration. |
| **Design** | `/design-html` | **Design Engineer** — Transforms mockups into production-ready responsive HTML/CSS. |
| **Review** | `/review` | **Staff Engineer Review** — Deep production-readiness, edge case, and bug inspection. |
| **Review** | `/codex` | **Second Opinion** — Independent multi-AI code review from OpenAI Codex CLI. |
| **Debug** | `/investigate` | **Root Cause Debugger** — Systematic hypothesis-driven debugging. No fixes without root cause. |
| **Quality** | `/qa` | **QA Lead** — Automated test flows with real browser, finds bugs, and applies regression tests. |
| **Quality** | `/qa-only` | **QA Reporter** — Pure bug reporting and visual audit without applying code changes. |
| **Quality** | `/design-review` | **Visual Polish Audit** — Live site design critique and direct UI refinement. |
| **Quality** | `/devex-review` | **Live DX Audit** — Real developer onboarding testing and TTHW verification. |
| **Release** | `/ship` | **Release Engineer** — Test execution, coverage audit, branch sync, and PR creation. |
| **Release** | `/land-and-deploy` | **Continuous Deployment** — Merge PR, wait for CI/CD, and verify production health. |
| **Release** | `/canary` | **SRE Monitoring** — Post-deployment error monitoring and performance canary loop. |
| **Docs** | `/document-release` | **Technical Writer** — Automatically updates all repository docs to reflect shipped changes. |
| **Docs** | `/document-generate`| **Documentation Author** — Generates Diataxis-framework documentation (tutorials/reference). |
| **Security**| `/cso` | **Chief Security Officer** — OWASP Top 10 + STRIDE threat modeling with exploit verification. |
| **Safety** | `/guard` / `/careful` | **Safety Rails** — Blocks destructive shell commands (`rm -rf`, `DROP TABLE`, force push). |
| **Safety** | `/freeze` / `/unfreeze`| **Directory Lock** — Restricts code edits to designated directories during debugging. |
| **Browser** | `/browse` | **Browser Automation** — Fast headless/headed Chromium browsing, clicks, and screenshots. |
| **Reflect** | `/retro` | **Engineering Retrospective** — Weekly team retro, shipping velocity, and test health metrics. |
| **Memory**  | `/learn` | **Durable Memory** — Project-specific patterns, pitfalls, and learnings compounding over time. |

---

## Operating Protocol

1. **Test-First & Verifiable Evidence**: Before shipping or merging, run test suites and verify outcomes.
2. **Boil the Ocean**: Complete the entire lake—do not skip edge cases, error states, or responsive viewports.
3. **Confusion Protocol**: If facing architectural ambiguity or high-risk destructive changes, stop and present trade-offs clearly to the user.
