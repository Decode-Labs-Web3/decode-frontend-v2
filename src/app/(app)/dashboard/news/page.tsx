"use client";

import { useState, useEffect } from "react";
import { toastError } from "@/utils/index.utils";
import Loading from "@/components/(loading)";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNewspaper,
  faClock,
  faThumbsUp,
  faComment,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogPost {
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

export default function NewsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blogs/blog", {
          method: "GET",
          headers: {
            "X-Frontend-Internal-Request": "true",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();

        if (data.success) {
          setPosts(data.posts || []);
        } else {
          throw new Error(data.message || "Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        const message =
          error instanceof Error ? error.message : "Failed to load posts";
        toastError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const number = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  const getImageUrl = (post: BlogPost) => {
    if (post.post_ipfs_hash) {
      return `https://ipfs.de-id.xyz/ipfs/${post.post_ipfs_hash}`;
    }
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
  };

  return (
    <>
      {loading ? (
        <Loading.NewsCard />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden hover-card">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${getImageUrl(post)})` }}
                  role="img"
                  aria-label={post.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                <Badge className="absolute left-3 top-3 text-xs capitalize">
                  {post.category}
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <FontAwesomeIcon icon={faNewspaper} />
                  <span className="uppercase tracking-wide">Community</span>
                  <span>•</span>
                  <FontAwesomeIcon icon={faClock} />
                  <span>{formatTime(post.createdAt)}</span>
                </div>
                <h3 className="text-lg font-semibold leading-snug mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {post.content}
                </p>
                {post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.keywords.slice(0, 3).map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between w-full border-t border-border pt-3">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs hover:text-foreground"
                    >
                      <FontAwesomeIcon icon={faThumbsUp} className="mr-1.5" />
                      <span>{number(post.upvote)}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs hover:text-foreground"
                    >
                      <FontAwesomeIcon icon={faComment} className="mr-1.5" />
                      <span>0</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                  >
                    <FontAwesomeIcon icon={faShare} className="mr-1.5" />
                    Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
