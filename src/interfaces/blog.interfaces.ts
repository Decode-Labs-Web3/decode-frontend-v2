export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  keyword: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_ipfs_hash: string;
  };
  post_ipfs_hash: null | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalLikes: number;
  totalDislikes: number;
  totalComments: number;
}
