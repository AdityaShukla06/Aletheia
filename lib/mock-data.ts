export type PaperStatus = "ready" | "processing" | "failed";

export type Paper = {
  id: string;
  title: string;
  authors: string;
  date: string;
  status: PaperStatus;
  tags: string[];
};

export const papers: Paper[] = [
  {
    id: "emergent-reasoning-chains",
    title: "Emergent Reasoning Chains in Sparse Mixture Models",
    authors: "Alaya, R. · Ferro, D. · Whitcombe, N.",
    date: "Aug 21",
    status: "ready",
    tags: ["NLP", "Reasoning"],
  },
  {
    id: "latent-diffusion-protein-folding",
    title: "Latent Diffusion for Structural Protein Folding",
    authors: "Okonkwo, T. · Beaumont, S.",
    date: "Aug 20",
    status: "ready",
    tags: ["Bio", "Diffusion"],
  },
  {
    id: "contrastive-pretraining-dialects",
    title: "Contrastive Pretraining for Low-Resource Dialects",
    authors: "Nakamura, Y. · Osei, K. · Lindqvist, A.",
    date: "Aug 19",
    status: "processing",
    tags: ["NLP"],
  },
  {
    id: "spectral-bias-overparameterized",
    title: "Spectral Bias in Overparameterized Networks",
    authors: "Herrera, M.",
    date: "Aug 18",
    status: "ready",
    tags: ["Theory"],
  },
  {
    id: "causal-discovery-distribution-shift",
    title: "Causal Discovery Under Distribution Shift",
    authors: "Voss, E. · Pham, L.",
    date: "Aug 17",
    status: "failed",
    tags: ["Causality"],
  },
  {
    id: "retrieval-augmented-verification",
    title: "Retrieval-Augmented Verification for Scientific Claims",
    authors: "Adeyemi, F. · Castellano, G.",
    date: "Aug 16",
    status: "ready",
    tags: ["RAG", "Verification"],
  },
  {
    id: "sample-efficient-rl-sparse-rewards",
    title: "Sample-Efficient RL Under Sparse Reward Signals",
    authors: "Torres, B. · Sundqvist, M.",
    date: "Aug 15",
    status: "ready",
    tags: ["RL"],
  },
  {
    id: "graph-attention-citation-networks",
    title: "Graph Attention Networks for Citation-Level Provenance",
    authors: "Ibarra, C. · Novak, P. · Suzuki, R.",
    date: "Aug 14",
    status: "processing",
    tags: ["Graph", "Provenance"],
  },
];

export type UploadStepState = "complete" | "active" | "pending";

export type UploadStep = {
  label: string;
  state: UploadStepState;
};

export const currentUpload: {
  filename: string;
  stepIndex: number;
  totalSteps: number;
  steps: UploadStep[];
} = {
  filename: "attention-sparsity-2026.pdf",
  stepIndex: 3,
  totalSteps: 5,
  steps: [
    { label: "Uploading file", state: "complete" },
    { label: "Parsing document structure", state: "complete" },
    { label: "Extracting figures, tables & equations", state: "active" },
    { label: "Building citation graph", state: "pending" },
    { label: "Indexing for search", state: "pending" },
  ],
};

export type RecentUploadStatus = "ready" | "failed" | "processing";

export type RecentUpload = {
  id: string;
  filename: string;
  size: string;
  status: RecentUploadStatus;
};

export const recentUploads: RecentUpload[] = [
  {
    id: "spectral-bias-overparam",
    filename: "spectral-bias-overparam.pdf",
    size: "2.1 MB",
    status: "ready",
  },
  {
    id: "causal-discovery-shift",
    filename: "causal-discovery-shift.pdf",
    size: "3.8 MB",
    status: "failed",
  },
  {
    id: "contrastive-low-resource",
    filename: "contrastive-low-resource.pdf",
    size: "1.4 MB",
    status: "processing",
  },
];

export type PaperSection = {
  heading: string;
  body: string;
  emphasis: boolean;
};

export type FigureExtract = {
  id: string;
  label: string;
  caption: string;
};

export type TableExtract = {
  id: string;
  label: string;
  caption: string;
};

export type EquationExtract = {
  id: string;
  label: string;
  expression: string;
  caption: string;
};

export type CitationExtract = {
  id: string;
  authors: string;
  year: string;
  title: string;
};

export type ReaderPaper = {
  id: string;
  category: string;
  title: string;
  authors: string;
  affiliation: string;
  sections: PaperSection[];
  extraction: {
    figures: FigureExtract[];
    tables: TableExtract[];
    equations: EquationExtract[];
    citations: CitationExtract[];
  };
};

export const mockReaderPaper: ReaderPaper = {
  id: "emergent-reasoning-chains",
  category: "MACHINE LEARNING · NEURIPS 2026",
  title: "Emergent Reasoning Chains in Sparse Mixture Models",
  authors: "Alaya, R. · Ferro, D. · Whitcombe, N.",
  affiliation: "University of Halden Institute for AI",
  sections: [
    {
      heading: "Abstract",
      body: "We study how multi-step reasoning behavior arises in sparsely-activated mixture-of-experts models without explicit chain-of-thought supervision. Across three model scales, we find that reasoning-relevant experts specialize early in training and that routing entropy correlates with downstream reasoning accuracy. We introduce a lightweight probe for detecting this specialization and show it predicts benchmark performance before fine-tuning completes.",
      emphasis: true,
    },
    {
      heading: "1. Introduction",
      body: "Sparse mixture-of-experts (MoE) architectures have become a standard tool for scaling model capacity without proportional increases in compute. Yet the internal mechanisms by which such models come to support multi-step reasoning remain poorly understood. In this section we motivate a probe-based approach to studying expert specialization over the course of training, building on prior routing-analysis literature.",
      emphasis: false,
    },
    {
      heading: "2. Related Work",
      body: "Prior work on routing analysis has largely focused on load balancing and expert utilization rather than the emergence of reasoning-specific circuits. We build on this literature by introducing a probe that tracks routing entropy per expert cluster across training, rather than aggregate utilization statistics alone.",
      emphasis: false,
    },
    {
      heading: "3. Method",
      body: "We train three MoE model scales (1B, 8B, and 32B active parameters) on an identical data mixture and checkpoint routing statistics every 500 steps. A lightweight linear probe is fit to routing entropy at each checkpoint to predict held-out reasoning-benchmark accuracy, without access to the benchmark labels during pretraining.",
      emphasis: false,
    },
  ],
  extraction: {
    figures: [
      {
        id: "fig-2",
        label: "Figure 2",
        caption: "Routing entropy vs. training step across three model scales.",
      },
      {
        id: "fig-4",
        label: "Figure 4",
        caption: "Expert specialization emerges by step ~12k in the 8B model.",
      },
    ],
    tables: [
      {
        id: "table-1",
        label: "Table 1",
        caption: "Benchmark accuracy across model scales and probe thresholds.",
      },
      {
        id: "table-2",
        label: "Table 2",
        caption: "Ablation of probe placement across transformer depth.",
      },
    ],
    equations: [
      {
        id: "eq-3",
        label: "Eq. 3",
        expression: "H(p) = -Σ p_i log p_i",
        caption: "Routing entropy per expert-selection distribution.",
      },
      {
        id: "eq-5",
        label: "Eq. 5",
        expression: "s = σ(w · h_t + b)",
        caption: "Linear probe score at training checkpoint t.",
      },
    ],
    citations: [
      {
        id: "cite-1",
        authors: "Shazeer, N. et al.",
        year: "2017",
        title: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer",
      },
      {
        id: "cite-2",
        authors: "Fedus, W. · Zoph, B. · Shazeer, N.",
        year: "2022",
        title: "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity",
      },
      {
        id: "cite-3",
        authors: "Wei, J. et al.",
        year: "2022",
        title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
      },
    ],
  },
};

export type SearchResult = {
  id: string;
  title: string;
  authors: string;
  excerpt: string;
  matchScore: number;
};

export const searchResults: SearchResult[] = [
  {
    id: "compute-optimal-reasoning",
    title: "Compute-Optimal Reasoning Without Scale",
    authors: "Bakshi, P. · Elorza, J.",
    excerpt:
      "…we present evidence that reasoning capability plateaus independent of parameter count once routing specialization saturates, directly contradicting the strong-scaling view…",
    matchScore: 94,
  },
  {
    id: "diminishing-returns-cot-scaling",
    title: "Diminishing Returns in Chain-of-Thought Scaling",
    authors: "Marchetti, S. · Obi, C. · Reyes, D.",
    excerpt:
      "…our ablations show that beyond a critical model size, additional parameters yield no measurable gain in multi-step reasoning accuracy…",
    matchScore: 91,
  },
  {
    id: "small-models-structured-reasoning",
    title: "Small Models, Structured Reasoning",
    authors: "Lindqvist, A. · Tanaka, H.",
    excerpt:
      "…a 1.3B model with explicit routing supervision matches the reasoning benchmark performance of models 20x its size…",
    matchScore: 87,
  },
  {
    id: "routing-entropy-early-signal",
    title: "Routing Entropy as an Early Signal for Reasoning Onset",
    authors: "Alaya, R. · Whitcombe, N.",
    excerpt:
      "…tracking per-layer routing entropy during pretraining predicts downstream reasoning benchmark accuracy well before fine-tuning begins…",
    matchScore: 83,
  },
  {
    id: "scaling-laws-revisited",
    title: "Scaling Laws Revisited for Sparse Architectures",
    authors: "Okonkwo, T. · Ferro, D.",
    excerpt:
      "…standard dense-model scaling laws systematically overpredict reasoning gains once expert routing is introduced…",
    matchScore: 78,
  },
  {
    id: "critical-capacity-thresholds",
    title: "Critical Capacity Thresholds in Multi-Step Inference",
    authors: "Voss, E. · Castellano, G.",
    excerpt:
      "…we identify a sharp capacity threshold below which chain-of-thought supervision fails to induce reliable multi-step reasoning…",
    matchScore: 72,
  },
];

export type AgreementStatus = "supports" | "contradicts" | "unverified";

export type CrossPaperEntry = {
  id: string;
  label: string;
  title: string;
};

export type ClaimAgreementRow = {
  id: string;
  claim: string;
  agreements: Record<string, AgreementStatus>;
};

export const crossPaperWorkspace: {
  summary: string;
  papers: CrossPaperEntry[];
  claims: ClaimAgreementRow[];
} = {
  summary: "Comparing 3 papers on reasoning-scale claims",
  papers: [
    {
      id: "alaya",
      label: "Alaya et al.",
      title: "Emergent Reasoning Chains (Alaya et al.)",
    },
    {
      id: "bakshi",
      label: "Bakshi et al.",
      title: "Compute-Optimal Reasoning Without Scale (Bakshi et al.)",
    },
    {
      id: "lindqvist",
      label: "Lindqvist et al.",
      title: "Small Models, Structured Reasoning (Lindqvist et al.)",
    },
  ],
  claims: [
    {
      id: "claim-parameter-scaling",
      claim: "Reasoning ability scales primarily with parameter count",
      agreements: {
        alaya: "contradicts",
        bakshi: "supports",
        lindqvist: "contradicts",
      },
    },
    {
      id: "claim-routing-predicts-accuracy",
      claim: "Routing/expert specialization predicts downstream reasoning accuracy",
      agreements: {
        alaya: "supports",
        bakshi: "unverified",
        lindqvist: "supports",
      },
    },
    {
      id: "claim-small-models-match-large",
      claim: "Small models can match large-model reasoning with the right training signal",
      agreements: {
        alaya: "unverified",
        bakshi: "supports",
        lindqvist: "supports",
      },
    },
    {
      id: "claim-cot-supervision-required",
      claim: "Explicit chain-of-thought supervision is required for reliable multi-step reasoning",
      agreements: {
        alaya: "contradicts",
        bakshi: "unverified",
        lindqvist: "contradicts",
      },
    },
  ],
};

export type ClaimVerificationStatus = "verified" | "disputed" | "unverified";

export type VerifiedClaim = {
  id: string;
  text: string;
  status: ClaimVerificationStatus;
  confidence: number;
  sourceCount: number;
};

export const claimVerification: {
  paperTitle: string;
  claims: VerifiedClaim[];
} = {
  paperTitle: "Emergent Reasoning Chains in Sparse Mixture Models",
  claims: [
    {
      id: "claim-early-specialization",
      text: "Reasoning-relevant experts specialize early in training, before step 12k.",
      status: "verified",
      confidence: 91,
      sourceCount: 4,
    },
    {
      id: "claim-routing-entropy-correlation",
      text: "Routing entropy correlates with downstream reasoning accuracy across all three model scales tested.",
      status: "disputed",
      confidence: 44,
      sourceCount: 2,
    },
    {
      id: "claim-probe-predicts-benchmark",
      text: "The probe predicts benchmark performance before fine-tuning completes.",
      status: "unverified",
      confidence: 0,
      sourceCount: 0,
    },
    {
      id: "claim-sparse-outperforms-dense",
      text: "Sparse MoE models outperform dense models of equal active-parameter count on reasoning benchmarks.",
      status: "verified",
      confidence: 78,
      sourceCount: 3,
    },
    {
      id: "claim-linear-probing-detectable",
      text: "Reasoning specialization is detectable via linear probing of routing statistics alone.",
      status: "verified",
      confidence: 85,
      sourceCount: 5,
    },
    {
      id: "claim-utilization-plateau",
      text: "Expert utilization plateaus by the midpoint of training regardless of model scale.",
      status: "unverified",
      confidence: 12,
      sourceCount: 1,
    },
    {
      id: "claim-entropy-stronger-predictor",
      text: "Routing entropy is a stronger predictor of reasoning accuracy than raw parameter count.",
      status: "verified",
      confidence: 82,
      sourceCount: 4,
    },
    {
      id: "claim-zero-shot-transfer",
      text: "Reasoning capability transfers zero-shot across unrelated benchmark domains.",
      status: "unverified",
      confidence: 8,
      sourceCount: 0,
    },
    {
      id: "claim-generalizes-to-dense",
      text: "Probe-based specialization signals generalize to dense transformer baselines.",
      status: "verified",
      confidence: 73,
      sourceCount: 2,
    },
  ],
};

export type CheckStatus = "pass" | "warning" | "pending";

export type ChecklistItem = {
  id: string;
  label: string;
  status: CheckStatus;
};

export const reproducibilityCheck: {
  paperTitle: string;
  repo: {
    repository: string;
    commit: string;
    environment: string;
    lastVerified: string;
  };
  checklist: ChecklistItem[];
} = {
  paperTitle: "Emergent Reasoning Chains in Sparse Mixture Models",
  repo: {
    repository: "halden-ai/sparse-reasoning",
    commit: "a3f9c1e",
    environment: "Python 3.11 · torch 2.4",
    lastVerified: "Aug 22, 2026",
  },
  checklist: [
    {
      id: "check-dependencies-resolve",
      label: "Dependencies resolve cleanly from lockfile",
      status: "pass",
    },
    {
      id: "check-environment-matches-ci",
      label: "Declared environment matches repo's CI config",
      status: "pass",
    },
    {
      id: "check-seeds-documented",
      label: "Reported random seeds documented",
      status: "pass",
    },
    {
      id: "check-results-reproduce",
      label: "Headline results reproduce within stated tolerance",
      status: "warning",
    },
    {
      id: "check-dataset-splits",
      label: "Dataset splits match paper's stated methodology",
      status: "pending",
    },
  ],
};

export type SettingsField = {
  label: string;
  value: string;
};

export type AIProvider = {
  id: string;
  label: string;
};

export const settingsData: {
  account: SettingsField[];
  providers: AIProvider[];
  defaultProviderId: string;
  providerNote: string;
  apiKeys: SettingsField[];
  dangerZone: { label: string; actionLabel: string };
} = {
  account: [
    { label: "Name", value: "Aditya Shukla" },
    { label: "Email", value: "aditya@research-intelligence.dev" },
    { label: "Workspace", value: "Personal" },
  ],
  providers: [
    { id: "anthropic-sonnet", label: "Anthropic — Claude Sonnet" },
    { id: "anthropic-opus", label: "Anthropic — Claude Opus" },
    { id: "openai-gpt4", label: "OpenAI — GPT-4" },
  ],
  defaultProviderId: "anthropic-sonnet",
  providerNote: "Swappable via the provider abstraction layer, change anytime without app changes.",
  apiKeys: [
    { label: "Anthropic", value: "sk-ant-••••••••7f2a" },
    { label: "OpenAI (fallback)", value: "Not configured" },
  ],
  dangerZone: {
    label: "Delete workspace and all indexed papers",
    actionLabel: "Delete",
  },
};
