# Job Description Research — 2025-2026

> **Purpose**: Foundational research for building the JD Assistant tool.
> **Date**: 2026-02-04
> **Method**: Progressive Perplexity prompts synthesizing current best practices.

---

## Table of Contents

1. [Modern JD Structure & AI-Optimization](#1-modern-jd-structure--ai-optimization)
2. [Inclusive Language — Gender](#2-inclusive-language--gender)
3. [Inclusive Language — Neurodiversity & Introverts](#3-inclusive-language--neurodiversity--introverts)
4. [Requirements & Leveling](#4-requirements--leveling)
5. [Compensation & Benefits Transparency](#5-compensation--benefits-transparency)
6. [Red Flags & Anti-Patterns](#6-red-flags--anti-patterns)
7. [Applied AI / LLM-Era Role Specifics](#7-applied-ai--llm-era-role-specifics)
8. [Key Sources](#8-key-sources)
9. [Form Fields Derived](#9-form-fields-derived)

---

## 1. Modern JD Structure & AI-Optimization

### Prompt

```
For software engineering job descriptions in 2025-2026, what is the optimal structure and format
for both human readability AND AI/ATS parsing? Drawing from sources like:

- HootRecruit's AI-optimized JD guidance
- Gem's "AI prompting do's and don'ts for JDs"
- Rally Recruitment Marketing's AI-written JD process

Please address:

1. What sections should a modern SWE JD include, in what order?
2. How should JDs be formatted for AI parsing (standard titles, clean sections, keyword discipline)?
3. What is the ideal length and how does it affect AI matching?
4. How do you balance SEO/keyword optimization without "keyword stuffing"?
5. What specific measurable requirements work best vs. vague language?

Focus on practical, current guidance - not 2018-era advice.
```

### Answer

Modern SWE job descriptions in 2025-2026 prioritize scannable structures that engage humans while feeding AI/ATS systems precise, parseable data for matching.

#### Optimal Sections and Order

Use this 6-7 section sequence for maximum parseability and readability:

1. **Job Title**: First line, exact and standard (e.g., "Senior Software Engineer")
2. **Job Overview/About the Role**: 2-4 sentences on company mission, role impact, and why apply
3. **Key Responsibilities**: 5-8 bullets, action verbs + metrics
4. **Required Qualifications**: 4-6 bullets, must-haves only
5. **Preferred Skills**: 3-5 bullets, nice-to-haves
6. **What We Offer/Benefits**: Comp range, perks, culture
7. **To Apply**: Clear CTA

#### AI Parsing Formatting

- **Standard titles**: H2/### headers (e.g., "## Key Responsibilities"); no custom names
- **Clean sections**: Bullets/lists for everything parseable; short paragraphs (<4 lines)
- **Keyword discipline**: Natural integration in titles/bullets; front-load in overview/reqs
- **Markdown/HTML friendly**: Bold key terms; avoid PDFs

#### Ideal Length

**400-700 words** (1 page printed):
- AI matching: Shorter = higher precision; >1000 words risks truncation
- Human factor: 75% abandon >60 seconds read
- Optimized JDs see 20-30% higher app quality

#### Keyword Balance

- **Smart placement**: 60% in title/overview/reqs
- **Cap repeats**: 2-3x per keyword max
- **Density**: 3-5% keyword density; higher flags as spam

#### Measurable vs. Vague Language

| Vague (Avoid) | Measurable (Use) |
|---------------|------------------|
| "Strong communicator" | "Led cross-team demos for 50+ stakeholders" |
| "Experience with cloud" | "3+ years AWS; deployed services handling 1M req/day" |
| "Passionate about AI" | "Shipped 2+ prod LLM features (evals, RAG)" |
| "Team player" | "Mentored 3 juniors to promotion via code reviews" |

---

## 2. Inclusive Language — Gender

### Prompt

```
What specific words and phrases in software engineering job descriptions have been shown to
discourage women from applying? Please provide:

1. A list of "masculine-coded" words to avoid (with research citations)
2. Gender-neutral alternatives for each
3. Phrases that have been shown to ATTRACT more diverse candidates
4. Specific examples of before/after rewrites

Focus on peer-reviewed research from sources like the Journal of Personality and Social
Psychology, or studies by Textio, Applied, or similar hiring analytics companies.
```

### Answer

Certain words signal "masculine" environments, reducing women's anticipated belonging and application rates by 10-30% per Gaucher et al. (2011) JPSP study.

#### Masculine-Coded Words to Avoid

| Masculine Word | Research Source | Impact |
|----------------|-----------------|--------|
| Aggressive | Gaucher et al. (2011) JPSP; Textio | Women perceive less belonging |
| Competitive | Gaucher et al.; Textio | Reduces female interest ~20% |
| Dominant | JPSP study; Applied | Signals male fit |
| Driven | Textio masculine list | High in male-dominated ads |
| Leader (standalone) | Gaucher et al. | Assumed male-coded |
| Ninja/superstar/guru | Textio/Unitive | Turnoff for women |
| Assertive | Kat Matfield app (JPSP-based) | Lowers belongingness |
| Decisive | JPSP; Textio | Mediates reduced appeal |
| Outspoken | Matfield/JPSP | Women anticipate exclusion |
| Fearless | Textio/Expedia analysis | Flags as masculine |

#### Gender-Neutral Alternatives

| Masculine | Neutral Alternative |
|-----------|---------------------|
| Aggressive | Proactive, bold |
| Competitive | Collaborative, results-oriented |
| Dominant | Influential, guiding |
| Driven | Motivated, dedicated |
| Leader | Ownership, mentorship |
| Ninja/superstar | Expert, specialist |
| Assertive | Confident communicator |
| Decisive | Sound decision-maker |
| Outspoken | Clear advocate |
| Fearless | Resilient, innovative |

#### Phrases That Attract Diverse Candidates

- "Collaborate with diverse teams"
- "Support each other" / "team support"
- "Continuous learning" / "grow together"
- "Inclusive environment" / "we value different perspectives"
- "Flexible work" / "work-life harmony"
- Action + impact: "Deliver outcomes with your team"

#### Before/After Rewrites

**Before (Masculine)**:
> "Be a competitive leader who fearlessly drives aggressive projects and dominates code reviews as a superstar ninja."

**After (Neutral)**:
> "Take ownership of projects, collaborate on code reviews, and deliver impactful results with your team."

**Before**:
> "Assertive individual to lead dominant backend initiatives."

**After**:
> "Confident contributor to guide backend development and mentor peers."

2025 PNAS study confirms: Replacing masculine words boosts apps from women AND low-masculinity men.

---

## 3. Inclusive Language — Neurodiversity & Introverts

### Prompt

```
How can software engineering job descriptions be written to avoid discouraging introverts,
neurodivergent candidates, and people with different communication styles? Please address:

1. Phrases that signal "extrovert-only culture" (e.g., "outgoing", "high-energy")
2. How to describe collaboration without requiring constant social interaction
3. Language that welcomes neurodivergent candidates (autism, ADHD, dyslexia)
4. How to describe "soft skills" without excluding people who communicate differently
5. Specific before/after examples

Cite research on neurodiversity in tech hiring and inclusive job posting practices.
```

### Answer

Job descriptions often embed extrovert bias, discouraging introverts (40-50% of population) and neurodivergent folks (15-20% prevalence), who self-select out at rates 2-3x higher per Deloitte and Specialisterne studies.

#### Extrovert-Only Signals to Avoid

- "Outgoing" or "high-energy" (flags social extroversion)
- "Strong communicator" or "excellent verbal skills" (assumes neurotypical fluency)
- "Team player" (implies constant group syncs)
- "Thrives in fast-paced environment" (overlooks sensory overload)
- "Customer-facing" or "evangelize ideas" (prioritizes charisma)

#### Describing Collaboration Inclusively

Frame as flexible/methods-based, not volume:

- ✅ "Collaborate via docs/PRs/Slack; async updates welcome."
- ✅ "Work with teams through written specs, paired programming, or meetings as needed."
- ❌ "Daily standups with high interaction"

#### Welcoming Neurodivergent Language

Explicit, plain signals boost apps 20-30%:

- "We support neurodiversity; request accommodations anytime."
- "Flexible communication styles valued."
- "Plain language used; ask for clarification."
- "Sensory-friendly options available."

#### Inclusive "Soft Skills" Description

| Vague/Excluding | Inclusive Rewrite |
|-----------------|-------------------|
| "Strong communicator" | "Share ideas clearly via writing, visuals, or discussion" |
| "Team player" | "Contribute to team goals through your strengths" |
| "Adaptable" | "Adjust to changes with support as needed" |
| "Passionate" | "Deeply engaged in problem-solving" |

#### Before/After Examples

**Before (Excluding)**:
> "Outgoing team player with excellent verbal skills who thrives in high-energy, fast-paced collaborative environments."

**After (Inclusive)**:
> "Collaborate effectively via Slack/docs/meetings (async preferred); flexible styles welcome. We value diverse problem-solving approaches."

**Before**:
> "Assertive leader to evangelize ideas in customer-facing role."

**After**:
> "Share technical insights through demos, docs, or presentations; accommodations for style available."

Research (Deloitte 2025, Specialisterne) shows such tweaks yield 90%+ retention for neurodivergent hires at SAP/Microsoft/Dell programs.

---

## 4. Requirements & Leveling

### Prompt

```
How should software engineering job descriptions handle requirements, qualifications, and level
expectations in 2025? Drawing from:

- progression.fyi public engineering ladders
- 4dayweek.io AI Engineer career paths
- Research on how underrepresented groups respond to requirement lists

Please address:

1. What is the optimal number of "required" vs "preferred" qualifications?
2. How should level expectations be communicated (L4, Staff, IC3, etc.) when companies have
   different ladders?
3. How do you write requirements that don't trigger "I must meet 100%" self-selection?
4. Should years of experience be listed? What's the current best practice?
5. How do modern companies (Buffer, GitLab, Automattic) structure their requirements sections?

Include the HP/McKinsey research on application rates and any 2024-2025 follow-up studies.
```

### Answer

2025 SWE JDs emphasize flexible, outcome-based requirements to combat self-selection bias. HP/McKinsey research shows women apply 20-30% less if they miss even 1 "required" item (Mohr 2011 HP study; McKinsey WiW 2025 confirms persistence).

#### Optimal Required vs. Preferred Split

**3-6 "required"** (true blockers) + **4-8 "preferred"** (nice-to-haves); progression.fyi recommends 10-15 total competencies per level.

- >10 requireds doubles drop-off for underrepresented groups
- Modern norm: Bold 3-4 must-haves, rest optional

#### Communicating Level Expectations

Use universal descriptors + scope/behavior examples from ladders; avoid proprietary labels unless defined:

- ✅ "Senior: Owns features cross-team; mentors juniors"
- ✅ Link to public ladders: "See progression.fyi for benchmarks"
- ✅ "Mid-level: Independent delivery; growth mindset"
- ❌ "L4/IC3" without explanation

#### Avoiding 100% Self-Selection

Phrase as ranges/aspirational — reduces women drop-off 25%:

- "If you meet ~60-70% + excited to learn..."
- "We'd love experience in X; transferable skills count."
- "Strong candidates have most of: [list]; others encouraged."
- Focus outcomes: "Shipped production systems" vs. rigid checkboxes

#### Years of Experience Best Practice

**Optional/ranged or omit**: "3-7 years or equivalent impact"

- Dropping YOE lifts underrepresented apps 15%
- If used: "Mid-career: 5+ years production exp preferred"
- Emphasize projects/portfolio over years

#### Modern Companies' Structures

| Company | Structure | Key Tactic |
|---------|-----------|------------|
| GitLab | Responsibilities → "What we look for" (bullets, no "req") | "Experience building X; self-managers thrive" |
| Buffer/Automattic | "The role" → "About you" (preferred skills) | Outcomes > checkboxes; "If you have most..." |
| Progression.fyi exemplars | 12 skills/level as benchmarks, not gates | "Proficiency in most areas" |

---

## 5. Compensation & Benefits Transparency

### Prompt

```
What does current research say about salary transparency in software engineering job descriptions?

1. Do JDs with salary ranges get more applicants? By how much?
2. What is the impact on diverse candidate pools specifically?
3. How should salary ranges be presented (narrow vs wide range)?
4. What benefits information most influences candidate decisions?
5. What are the legal requirements in major tech hubs (California, Colorado, NYC, EU)?

Cite studies from Glassdoor, LinkedIn Economic Graph, or academic research on pay transparency.
```

### Answer

Salary transparency in 2025-2026 SWE JDs boosts applications 30-40% overall while improving diversity.

#### Applicant Increase from Ranges

**2-3x more apps**:
- Glassdoor 2025: 79% more likely to apply
- LinkedIn: 35% uplift
- Indeed: 2-3x qualified interest
- Shortens time-to-fill 20-30%

#### Diversity Impact

Strong positive:
- Salesforce saw 15% diverse app rise
- Women/underreps apply more to transparent posts
- McKinsey WiW 2025: Reduces bias in negotiations

#### Presentation: Narrow vs. Wide

**30-50% range around midpoint** (e.g., $170k-$220k for $195k mid):
- Too narrow (<20%) deters seniors
- Too wide (>60%) signals vagueness
- Format: "$170,000 - $220,000 base + equity/bonus; DOE/location"

#### Influential Benefits Info

Top drivers (Glassdoor/LinkedIn):
1. Equity/RSUs (SWE priority)
2. Remote/flex PTO (40% factor)
3. Health/401k match
4. Learning stipend

Best format: "Total comp $250k-$350k OTE"

#### Legal Requirements (Tech Hubs, 2026)

| Location | Rules |
|----------|-------|
| California | Pay scale in all postings (15+ emp); good faith range |
| Colorado | Comp/benefits in postings + internal promo notice |
| NYC/NY State | Range in postings (4+ emp); upon request elsewhere |
| EU (Germany/UK) | Range upon request; some (BE/NL) mandate postings |

Non-compliance fines $100-10k/post; comply nationwide for remote SWE roles.

---

## 6. Red Flags & Anti-Patterns

### Prompt

```
What phrases and patterns in software engineering job descriptions are known "red flags" that
cause qualified candidates to self-select out in 2025? Please list:

1. Phrases that signal toxic culture ("fast-paced", "wear many hats", "like a family", "rockstar")
2. Unrealistic requirement combinations (e.g., "10 years React experience", "expert in everything")
3. Phrases that signal poor work-life balance or crunch culture
4. Jargon, buzzwords, and "AI slop" that make JDs less effective
5. Signs of a poorly defined role or bait-and-switch

For each red flag, provide research basis and a better alternative. Focus on what actually drives
candidate behavior based on current data from LinkedIn, Glassdoor, Blind, or hiring analytics.
```

### Answer

Candidates self-select out from 2025 SWE JDs with toxic signals, per Glassdoor (40% skip "red flag" posts), Blind/LinkedIn data (30% drop for crunch hints), and Ongig analytics (vague reqs cut apps 50%).

#### 1. Toxic Culture Signals

| Red Flag Phrase | Why It Repels (Data) | Better Alternative |
|-----------------|----------------------|--------------------|
| "Fast-paced" | Glassdoor: 35% skip (signals chaos/burnout) | "Dynamic projects with clear priorities" |
| "Wear many hats" | Blind: Implies overload/no focus | "Versatile role with growth opportunities" |
| "Like a family" | LinkedIn: 40% distrust (blurs boundaries) | "Supportive, collaborative team" |
| "Rockstar/ninja" | Ongig/Textio: Attracts egos, repels teams (25% drop) | "Expert collaborator/impact player" |

#### 2. Unrealistic Requirements

| Red Flag | Why Repels | Alternative |
|----------|------------|-------------|
| "10+ years React" | Ongig: Impossible for new frameworks; 50% qualified skip | "Deep React exp + quick learner" |
| "Expert in everything" (10+ stacks) | ExactStaff: Signals disorg; shrinks pool 60% | "Strong in 2-3 + willingness to expand" |

#### 3. Work-Life Balance / Crunch Signals

| Red Flag | Why Repels (Data) | Alternative |
|----------|-------------------|-------------|
| "Always-on/hustle" | Blind: 45% pass (burnout fear) | "Flexible hours; async work" |
| "Unlimited PTO" (vague) | Glassdoor: Distrusts usage | "20+ PTO days + recharge policy" |
| "Crunch time/late nights" | LinkedIn: 30% drop post-layoffs | "Sustainable delivery cycles" |

#### 4. Jargon / AI Slop / Buzzwords

| Red Flag | Why Ineffective | Alternative |
|----------|-----------------|-------------|
| AI slop (generic: "innovative, passionate, cutting-edge") | Inc./NYT: 40% skip low-effort AI text | Specific outcomes: "Shipped 99.9% uptime service" |
| Buzzword soup ("synergize blockchain disrupt") | Ongig: Reduces reads 25% | Plain: "Build scalable APIs in Go" |

#### 5. Poorly Defined / Bait-and-Switch

| Red Flag | Why Repels | Alternative |
|----------|------------|-------------|
| Vague duties ("various tasks") | ExactStaff: 50% assume bait-switch | "Own auth service + 2 features/quarter" |
| No specifics (comp, remote) | Glassdoor: 30% skip | "Remote, $170-220k base" |
| Overly broad (SWE + sales/marketing) | Remotebase: Signals chaos | Focused scope + "team support" |

Fixes lift apps 20-50%; test via Glassdoor reviews/Blind threads for validation.

---

## 7. Applied AI / LLM-Era Role Specifics

### Prompt

```
For job descriptions targeting Applied AI Engineers or software engineers working with LLMs in
2025-2026, what specific skills and responsibilities should be included? Drawing from:

- D.E. Shaw "Applied AI Engineer" posting
- LinkedIn Talent Solutions AI/ML job description library
- Workable and Adaface AI Engineer templates
- "Core Skills Every AI Engineer Needs in 2025" breakdowns

Please address:

1. What distinguishes "Applied AI Engineer" from "ML Engineer" or "Data Scientist" in JD language?
2. What LLM-era skills should be called out (vector DBs, RAG, evals, observability, prompt engineering)?
3. How should responsibilities reflect production deployment vs. research/training?
4. What language describes "agentic systems" and AI infrastructure work?
5. How do you avoid 2018 ML boilerplate when the role is actually about LLM integration?

Provide specific language examples that reflect current applied-AI realities.
```

### Answer

Applied AI Engineer JDs in 2025-2026 emphasize production integration of LLMs over pure research, distinguishing from ML Engineers (model training/MLOps) or Data Scientists (analysis/storytelling).

#### 1. Applied AI vs. ML Engineer vs. Data Scientist

| Role | Focus | JD Language |
|------|-------|-------------|
| Applied AI Engineer | Integrate/deploy LLMs into apps/infra | "Ship LLM-powered features end-to-end" |
| ML Engineer | Train/tune/deploy models at scale | "Build training pipelines; optimize inference" |
| Data Scientist | Extract insights via stats/exploration | "Analyze data; build dashboards; storytelling" |

D.E. Shaw example: "Greenfield AI agents transforming workflows" (not "research novel algos").

#### 2. LLM-Era Skills to Call Out

**Required**:
- Prompt engineering / chain-of-thought
- Vector DBs (Pinecone, Weaviate), RAG pipelines
- LLM evals (RAGAS, DeepEval; faithfulness, relevance)
- Observability (LangSmith, Phoenix; latency/error tracking)
- Fine-tuning / PEFT (LoRA for custom models)

**Preferred**:
- Orchestration (LangChain, LlamaIndex)
- Scaling (vLLM, SGLang)

Example: "Build RAG systems with vector search; implement LLM evals scoring >90% accuracy."

#### 3. Production vs. Research Responsibilities

Focus deployment/iteration, not invention:

- ✅ "Deploy LLM pipelines to Kubernetes; achieve <500ms P99 latency"
- ✅ "Instrument evals/observability for 99.9% uptime"
- ✅ "Integrate LLMs with APIs/telephony for real-time use"
- ❌ "Invent new architectures"

D.E. Shaw: "Design/deploy AI agents/RAG frameworks accelerating decisions."

#### 4. Agentic Systems / AI Infra Language

"Agentic" = autonomous, multi-step:

- "Build agentic systems: LLMs calling tools/APIs in loops"
- "Orchestrate multi-agent workflows (e.g., planner+executor)"
- "Shared AI platform: GPU infra, vLLM serving, MLflow tracking"

Example: "Develop agentic AI for code gen/data workflows; integrate with scientific software."

#### 5. Avoiding 2018 ML Boilerplate

| Old (2018) | New (2025) |
|------------|------------|
| "Deep learning frameworks; train models from scratch" | "Production LLM apps: RAG, agents, evals" |
| "CNNs/TensorFlow/computer vision" | "LangChain/PyTorch; prompt tuning" |
| "Hyperparameter sweeps" | "Prompt optimization; eval-driven iteration" |

**Full Requirement Example** (Adaface-inspired):
- **Required**: 3+ yrs prod SWE; LLM integration (RAG/prompting); Python/FastAPI; evals/observability
- **Responsibilities**: "Ship agentic voice AI: telephony+LLM; monitor drift/latency"

---

## 8. Key Sources

### Live AI Role Examples (Current Patterns)

| Source | URL | Use For |
|--------|-----|---------|
| LinkedIn Talent Solutions AI/ML JD Library | business.linkedin.com/talent-solutions | Current expectations, cross-functional impact |
| Workable "AI Engineer job description" | resources.workable.com/ai-engineer-job-description | Responsibilities vs. requirements separation |
| Adaface "Applied AI Engineer Template" | adaface.com/job-descriptions/applied-ai-engineer | Applied AI framing, production focus |
| D.E. Shaw "Applied AI Engineer" | deshaw.com/careers/applied-ai-engineer-5375 | Agentic systems, high-bar quant/infra roles |

### Framework / Ladder Sources

| Source | URL | Use For |
|--------|-----|---------|
| progression.fyi | progression.fyi | Public ladders, level expectations |
| 4dayweek.io AI Engineer Career Path | 4dayweek.io/career-path/ai-engineer | Career path vocabulary, track variants |
| GSA "Understanding AI job roles" | coe.gsa.gov/coe/ai-guide-for-government | Role differentiation (data eng vs. AI vs. PM) |

### JD-Writing & AI-Optimization Playbooks

| Source | URL | Use For |
|--------|-----|---------|
| Gem "AI prompting do's + don'ts for JDs" | gem.com/blog/ai-prompting-dos-donts | LLM-assisted drafting guidance |
| Rally Recruitment Marketing | rallyrecruitmentmarketing.com | AI-written JD process |
| HootRecruit "AI-Optimized JDs" | hootrecruit.com/blog/ai-optimized-job-descriptions | ATS parsing, keyword discipline |

### Research Citations

| Study | Source | Key Finding |
|-------|--------|-------------|
| Gaucher et al. (2011) | Journal of Personality and Social Psychology | Masculine-coded words reduce women's belonging |
| HP/McKinsey (2011, 2025) | McKinsey Women in the Workplace | Women apply at 100% match; men at 60% |
| Deloitte Neurodiversity (2025) | Deloitte Insights | Neurodivergent self-select out 2-3x more |
| PNAS (2025) | pnas.org | Debiasing language increases diverse apps |
| Textio Field Data | textio.com | Language predicts gender of hire |

---

## 9. Form Fields Derived

Based on this research, the JD Assistant form should include:

### Required Fields

| Field | Purpose | Research Basis |
|-------|---------|----------------|
| Job Title | Standard, AI-parseable | Section 1: AI parsing |
| Company Name | Context | — |
| Role Level | Senior, Staff, Principal, etc. | Section 4: Leveling |
| Key Responsibilities | 5-8 bullets, action verbs + metrics | Section 1: Structure |
| Required Qualifications | 3-6 items, true blockers only | Section 4: HP/McKinsey |
| Preferred Qualifications | 4-8 items, nice-to-haves | Section 4: Self-selection |
| Compensation Range | 30-50% spread around midpoint | Section 5: Transparency |
| Location/Remote Policy | Clear statement | Section 6: Red flags |
| Benefits Highlights | Top 3-5 | Section 5: Drivers |

### Optional Fields

| Field | Purpose | Research Basis |
|-------|---------|----------------|
| **Company Career Ladder** | Paste ladder for accurate leveling | Section 4: progression.fyi |
| **Company-Mandated Preamble** | EEO, diversity statements (relaxed validation) | Legal compliance |
| **Company-Mandated Legal Text** | Disclaimers, notices (relaxed validation) | Legal compliance |
| Tech Stack Details | Specific technologies | Section 1: Measurable |
| Team Size/Structure | Context for collaboration | Section 3: Neurodiversity |
| Applied AI Specifics | LLM-era skills if AI role | Section 7: Applied AI |
| Hiring Manager Name | Personalization | — |
| Interview Process Overview | Transparency | Section 6: Bait-and-switch |

### Validation Rules (for Validator Tool)

The validator should check for:

1. **Inclusive Language**: Flag masculine-coded words (Section 2)
2. **Neurodiversity-Friendly**: Flag extrovert-only signals (Section 3)
3. **Requirements Balance**: Warn if >6 required items (Section 4)
4. **Self-Selection Language**: Suggest "60-70%" phrasing (Section 4)
5. **Red Flags**: Flag toxic culture phrases (Section 6)
6. **AI Slop Detection**: Flag generic buzzwords (Section 6)
7. **Compensation Presence**: Warn if missing (Section 5)
8. **Length Check**: Warn if >700 words (Section 1)

**Note**: Company-mandated preambles and legal text should have **relaxed validation** — do not flag EEO statements, legal disclaimers, etc. even if they contain boilerplate language.

---

## Appendix: Quick Reference Tables

### Words to Avoid → Alternatives

| Avoid | Use Instead | Why |
|-------|-------------|-----|
| Aggressive | Proactive, bold | Gender-coded |
| Competitive | Collaborative, results-oriented | Gender-coded |
| Ninja/rockstar/guru | Expert, specialist | Gender-coded, ego-attracting |
| Fast-paced | Dynamic projects with clear priorities | Toxic signal |
| Wear many hats | Versatile role with growth opportunities | Overload signal |
| Like a family | Supportive, collaborative team | Boundary issues |
| Strong communicator | Share ideas via writing, visuals, or discussion | Excludes neurodivergent |
| Team player | Contribute through your strengths | Excludes introverts |
| Outgoing, high-energy | Flexible styles welcome | Excludes introverts |
| Always-on, hustle | Flexible hours; async work | Burnout signal |

### Section Order (AI-Optimized)

1. Job Title (standard)
2. Job Overview / About the Role (2-4 sentences)
3. Key Responsibilities (5-8 bullets)
4. Required Qualifications (3-6 items)
5. Preferred Skills (4-8 items)
6. What We Offer / Benefits
7. To Apply (clear CTA)

### Level Descriptors (Universal)

| Level | Scope | Behaviors |
|-------|-------|-----------|
| Junior/Entry | Task-level; needs guidance | Learning, asking questions |
| Mid-Level | Feature-level; independent delivery | Owns small projects |
| Senior | Cross-team features; mentors juniors | Technical leadership |
| Staff | Org-wide impact; sets direction | Strategic influence |
| Principal | Company-wide; defines standards | Industry recognition |
