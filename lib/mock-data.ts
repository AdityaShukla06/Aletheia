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
