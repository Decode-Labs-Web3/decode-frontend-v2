"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/index.utils";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BlogPostProps } from "@/interfaces/blog.interfaces";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  faNewspaper,
  faClock,
  faThumbsUp,
  faThumbsDown,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

export default function NewsPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPostProps[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiResponse = await fetch("/api/blogs/get", {
          method: "GET",
          headers: getApiHeaders(fingerprintHash),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          throw new Error("Failed to fetch posts");
        }

        const response = await apiResponse.json();

        if (response.statusCode === 200 && response.message) {
          setPosts(response.data || []);
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
  }, [fingerprintHash]);

  const getImageUrl = (post: BlogPostProps) => {
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
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Latest News</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest posts from our community.
            </p>
          </div>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faNewspaper}
                className="w-16 h-16 text-muted-foreground mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something amazing!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card
                  key={post._id}
                  onClick={() => router.push(`/dashboard/news/${post._id}`)}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                      src={getImageUrl(post)}
                      alt={post.title}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0" />
                    <Badge className="absolute left-3 top-3 text-xs capitalize">
                      {post.keyword}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={
                            post.author?.avatar_ipfs_hash
                              ? `https://ipfs.de-id.xyz/ipfs/${post.author.avatar_ipfs_hash}`
                              : undefined
                          }
                          alt={post.author?.display_name}
                        />
                        <AvatarFallback>
                          {post.author?.display_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author.display_name}</span>
                      <span>•</span>
                      <FontAwesomeIcon icon={faClock} />
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {post.content}
                    </p>
                    {post.keyword && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {post.keyword}
                        </Badge>
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
                          <FontAwesomeIcon
                            icon={faThumbsUp}
                            className="mr-1.5"
                          />
                          <span>{post.totalLikes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs hover:text-foreground"
                        >
                          <FontAwesomeIcon
                            icon={faThumbsDown}
                            className="mr-1.5"
                          />
                          <span>{post.totalDislikes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs hover:text-foreground"
                        >
                          <FontAwesomeIcon
                            icon={faComment}
                            className="mr-1.5"
                          />
                          <span>{post.totalComments}</span>
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
