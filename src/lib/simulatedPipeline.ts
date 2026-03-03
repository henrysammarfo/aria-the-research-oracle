import { AgentEvent, AgentName, TaskState } from "@/types/aria";

// Simulated agent pipeline for demo mode
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let eventId = 0;
const ev = (agent: AgentName, type: AgentEvent["type"], content: string): AgentEvent => ({
  id: String(++eventId),
  agent,
  type,
  content,
  timestamp: Date.now(),
});

export async function runSimulatedPipeline(
  query: string,
  onEvent: (e: AgentEvent) => void
): Promise<TaskState["report"]> {
  eventId = 0;

  // Orchestrator planning
  onEvent(ev("Orchestrator", "thinking", `Analyzing task: "${query}"`));
  await delay(800);
  onEvent(ev("Orchestrator", "thinking", "Decomposing into subtasks based on complexity analysis..."));
  await delay(1200);
  onEvent(ev("Orchestrator", "plan", JSON.stringify({
    plan: [
      { id: 1, type: "research", description: "Search for current data, studies, and expert opinions", dependencies: [] },
      { id: 2, type: "analyze", description: "Deep reasoning on findings — identify patterns, contradictions, and gaps", dependencies: [1] },
      { id: 3, type: "code", description: "Generate data visualizations and statistical analysis", dependencies: [1] },
      { id: 4, type: "write", description: "Synthesize all findings into a structured, cited report", dependencies: [2, 3] },
    ],
    reasoning: "Task requires multi-source research, analytical reasoning, quantitative analysis, and structured synthesis."
  })));
  await delay(600);
  onEvent(ev("Orchestrator", "result", "Plan created: 4 subtasks across Research → Analysis → Code → Write pipeline. Dispatching..."));
  await delay(500);

  // Researcher
  onEvent(ev("Researcher", "thinking", "Formulating search queries for maximum coverage..."));
  await delay(700);
  onEvent(ev("Researcher", "action", "web_search(\"" + query.slice(0, 50) + " 2024 2025 data\")"));
  await delay(1500);
  onEvent(ev("Researcher", "action", "Found 47 results. Filtering for relevance and recency..."));
  await delay(800);
  onEvent(ev("Researcher", "action", "fetch_page(\"https://arxiv.org/abs/2024.xxxxx\") — extracting content..."));
  await delay(1200);
  onEvent(ev("Researcher", "action", "fetch_page(\"https://www.mckinsey.com/research/...\") — extracting content..."));
  await delay(1000);
  onEvent(ev("Researcher", "action", "web_search(\"" + query.slice(0, 30) + " economic impact statistics\")"));
  await delay(1300);
  onEvent(ev("Researcher", "action", "Cross-referencing 12 sources for factual consistency..."));
  await delay(900);
  onEvent(ev("Researcher", "result", "Research complete: 12 primary sources identified, 47 data points extracted, 8 expert opinions catalogued. Confidence: 0.91"));
  await delay(400);

  // Analyst
  onEvent(ev("Analyst", "thinking", "<think> Examining the evidence base for logical consistency..."));
  await delay(800);
  onEvent(ev("Analyst", "thinking", "<think> Source [3] claims 40% productivity increase, but source [7] shows only 15%. Need to reconcile methodology differences..."));
  await delay(1500);
  onEvent(ev("Analyst", "thinking", "<think> The McKinsey data uses self-reported metrics while the Stanford study uses controlled experiments. Weighting accordingly..."));
  await delay(1200);
  onEvent(ev("Analyst", "thinking", "<think> Identifying a gap: no longitudinal data beyond 18 months for most studies. This limits confidence in long-term predictions..."));
  await delay(1100);
  onEvent(ev("Analyst", "result", "Analysis complete: 5 key findings identified, 2 contradictions resolved, 3 evidence gaps flagged. Average confidence: 0.87"));
  await delay(400);

  // Coder
  onEvent(ev("Coder", "thinking", "Designing analysis pipeline for quantitative data..."));
  await delay(600);
  onEvent(ev("Coder", "code", `import pandas as pd
import matplotlib.pyplot as plt

data = {
    'Year': [2020, 2021, 2022, 2023, 2024],
    'Adoption_Rate': [12, 24, 41, 58, 73],
    'Productivity_Impact': [5, 12, 22, 31, 38]
}
df = pd.DataFrame(data)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(df['Year'], df['Adoption_Rate'], 'o-', label='Adoption Rate (%)')
ax.plot(df['Year'], df['Productivity_Impact'], 's--', label='Productivity Impact (%)')
ax.set_title('Trend Analysis: Adoption vs Impact')
ax.legend()
plt.savefig('/tmp/chart_trend.png', dpi=150)
print(df.describe())`));
  await delay(1800);
  onEvent(ev("Coder", "action", "Validating code via AST parsing... ✓ No unsafe imports detected"));
  await delay(500);
  onEvent(ev("Coder", "action", "Executing in sandboxed subprocess (timeout: 10s)..."));
  await delay(1200);
  onEvent(ev("Coder", "result", "Execution complete: 1 chart generated, statistical summary produced. No errors."));
  await delay(400);

  // Writer
  onEvent(ev("Writer", "thinking", "Structuring report with executive summary, findings, and citations..."));
  await delay(800);
  onEvent(ev("Writer", "action", "Generating executive summary from 5 key findings..."));
  await delay(1000);
  onEvent(ev("Writer", "action", "Mapping 12 inline citations to source bibliography..."));
  await delay(900);
  onEvent(ev("Writer", "action", "Embedding charts and data tables into report body..."));
  await delay(700);
  onEvent(ev("Writer", "result", "Report generated: 2,847 words, 5 sections, 12 citations, 1 chart. Exporting to Markdown + PDF..."));
  await delay(500);

  // Complete
  onEvent(ev("Orchestrator", "complete", "All agents finished successfully. Report ready."));

  return {
    title: `Research Report: ${query}`,
    markdown: generateMockReport(query),
    sources: [
      { title: "McKinsey Global Institute — Future of Work Report 2024", url: "https://mckinsey.com/research" },
      { title: "Stanford HAI — AI Index Report 2024", url: "https://aiindex.stanford.edu" },
      { title: "World Economic Forum — Jobs of Tomorrow 2025", url: "https://weforum.org/reports" },
      { title: "MIT Sloan — Productivity and AI Adoption Study", url: "https://mitsloan.mit.edu" },
      { title: "Bureau of Labor Statistics — Occupational Outlook", url: "https://bls.gov/ooh" },
      { title: "arXiv:2024.15847 — LLM Impact on Software Engineering", url: "https://arxiv.org" },
    ],
  };
}

function generateMockReport(query: string): string {
  return `# Executive Summary

This report examines **${query}** through a multi-agent autonomous research pipeline. Analysis of 12 primary sources, 47 data points, and 8 expert opinions reveals five key findings with an average confidence score of 0.87.

The evidence suggests a significant and accelerating trend, with adoption rates increasing from 12% (2020) to 73% (2024). However, long-term impact data beyond 18 months remains limited, introducing uncertainty into forward projections.

---

## Key Findings

### Finding 1: Accelerating Adoption Curve *(Confidence: 0.93)*
Adoption rates have followed an S-curve pattern, with the inflection point occurring in mid-2022. Current trajectory suggests 85%+ adoption by 2026. [1][2]

### Finding 2: Productivity Gains Are Real but Overstated *(Confidence: 0.84)*
Self-reported productivity gains (40%) significantly exceed controlled measurements (15-22%). The gap is attributed to measurement methodology differences and selection bias in survey populations. [3][7]

### Finding 3: Job Displacement is Offset by Job Creation *(Confidence: 0.79)*
While 23% of current tasks face automation risk, new role categories have grown 34% since 2022. Net employment impact appears slightly positive in aggregate, but highly uneven across sectors. [4][5]

### Finding 4: Skills Gap is the Primary Bottleneck *(Confidence: 0.91)*
Organizations report that lack of trained personnel (67%) is a larger barrier than cost (34%) or technical limitations (29%). Upskilling programs show 3x ROI within 12 months. [2][6]

### Finding 5: Regulatory Uncertainty is Slowing Enterprise Adoption *(Confidence: 0.88)*
42% of enterprises cite regulatory uncertainty as a factor delaying full deployment. The EU AI Act and proposed US frameworks create compliance complexity for multinational operations. [1][8]

---

## Data & Evidence

| Year | Adoption Rate | Productivity Impact | New Roles Created |
|------|:---:|:---:|:---:|
| 2020 | 12% | +5% | 12,000 |
| 2021 | 24% | +12% | 34,000 |
| 2022 | 41% | +22% | 89,000 |
| 2023 | 58% | +31% | 156,000 |
| 2024 | 73% | +38% | 234,000 |

*Chart: Trend analysis showing adoption rate vs productivity impact (2020-2024)*

---

## Confidence Assessment

Overall report confidence: **0.87 / 1.00**

- Strongest evidence: Adoption rates (multiple corroborating sources)
- Weakest evidence: Long-term job displacement predictions (limited longitudinal data)
- Key assumption: Current regulatory trajectory continues without major disruption

## Limitations & Gaps

1. No longitudinal studies beyond 18 months for most metrics
2. Geographic bias toward North American and European data
3. Self-reporting bias in productivity measurements not fully corrected
4. Emerging regulatory changes may invalidate forward projections

---

## Sources

[1] McKinsey Global Institute — Future of Work Report 2024
[2] Stanford HAI — AI Index Report 2024
[3] World Economic Forum — Jobs of Tomorrow 2025
[4] MIT Sloan — Productivity and AI Adoption Study
[5] Bureau of Labor Statistics — Occupational Outlook
[6] arXiv:2024.15847 — LLM Impact on Software Engineering
[7] Deloitte — Enterprise AI Survey Q3 2024
[8] Brookings Institution — AI Policy Analysis 2024

---

*Report generated by ARIA — Autonomous Research Intelligence Agent*
*Powered by GLM-4-Plus (Orchestrator, Writer), GLM-Z1 (Analyst), GLM-4-Plus (Coder)*
*${new Date().toLocaleDateString()} | 2,847 words | 12 citations*`;
}
