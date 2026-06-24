export type RepoVisibility = "public" | "private" | "internal";

export type GitHubRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  visibility: RepoVisibility;
  description: string | null;
  updatedAt: string;
};

export type StoredCredentials = {
  token: string;
  username: string;
  loginMethod: "pat" | "device";
};

export type BulkAction = "delete" | "public" | "private";

export type ActionResult = {
  repo: GitHubRepo;
  ok: boolean;
  error?: string;
};
