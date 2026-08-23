export type PaperStatus = "uploaded" | "processing" | "ready" | "failed";
export type JobStatus = "pending" | "running" | "succeeded" | "failed";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProcessingJob {
  id: string;
  paper_id: string;
  status: JobStatus;
  stage: string | null;
  progress: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: string;
  project_id: string;
  title: string | null;
  filename: string;
  storage_path: string;
  sha256: string | null;
  page_count: number | null;
  status: PaperStatus;
  created_at: string;
  processed_at: string | null;
  job: ProcessingJob | null;
}
