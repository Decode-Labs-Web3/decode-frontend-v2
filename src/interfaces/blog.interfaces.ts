export interface BlogPost {
  _id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  post_ipfs_hash: string;
  upvote: number;
  downvote: number;
  updatedAt: string;
  createdAt: string;
}
