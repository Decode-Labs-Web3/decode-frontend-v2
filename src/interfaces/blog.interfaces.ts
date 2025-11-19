export interface BlogPostProps {
  _id: string;
  title: string;
  content: string;
  keyword: string;
  author: AuthorProps;
  post_ipfs_hash: null | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
}

export interface BlogDetailProps {
  _id: string;
  title: string;
  content: string;
  keyword: string;
  author: AuthorProps;
  post_ipfs_hash: null | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
  userReaction: "like" | "dislike" | null;
  comments: CommentProps[];
}

interface AuthorProps {
  id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
}

interface CommentProps {
  _id: string;
  post: string;
  content: string;
  author: AuthorProps;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
