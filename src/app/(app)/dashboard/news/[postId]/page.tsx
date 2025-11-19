"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/index.utils";
import { getApiHeaders } from "@/utils/api.utils";
import { useParams, useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BlogDetailProps } from "@/interfaces/blog.interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  faThumbsUp,
  faThumbsDown,
  faComment,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function NewsPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const { postId } = useParams();
  const [loading, setLoading] = useState(true);
  const [postDetail, setPostDetail] = useState<BlogDetailProps>(
    {} as BlogDetailProps
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiResponse = await fetch("/api/blogs/specific", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ postId }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          throw new Error("Failed to fetch posts");
        }

        const response = await apiResponse.json();

        if (
          response.statusCode === 200 &&
          response.message === "Post fetched successfully"
        ) {
          setPostDetail(response.data);
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
  }, [fingerprintHash, postId]);
  const getImageUrl = (post: BlogDetailProps) => {
    if (post.post_ipfs_hash) {
      return `https://ipfs.de-id.xyz/ipfs/${post.post_ipfs_hash}`;
    }
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
  };

  const number = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  return (
    <>
      {loading ? (
        <Loading.NewsCard />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to News
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{postDetail.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          postDetail.author?.avatar_ipfs_hash
                            ? `https://ipfs.de-id.xyz/ipfs/${postDetail.author.avatar_ipfs_hash}`
                            : undefined
                        }
                        alt={postDetail.author?.display_name}
                      />
                      <AvatarFallback>
                        {postDetail.author?.display_name
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{postDetail.author?.display_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(postDetail.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">{postDetail.keyword}</Badge>
              </div>
            </CardHeader>

            {postDetail.post_ipfs_hash && (
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={getImageUrl(postDetail)}
                    alt={postDetail.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            )}

            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{postDetail.content}</p>
              </div>
            </CardContent>

            <CardFooter className="flex items-center gap-4">
              <Button
                variant={
                  postDetail.userReaction === "like" ? "default" : "ghost"
                }
                size="sm"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faThumbsUp} />
                <span>{number(postDetail.totalLikes || 0)}</span>
              </Button>
              <Button
                variant={
                  postDetail.userReaction === "dislike" ? "default" : "ghost"
                }
                size="sm"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faThumbsDown} />
                <span>{number(postDetail.totalDislikes || 0)}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faComment} />
                <span>{number(postDetail.totalComments || 0)}</span>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Comments ({postDetail.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {postDetail.comments?.length > 0 ? (
                postDetail.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          comment.author?.avatar_ipfs_hash
                            ? `https://ipfs.de-id.xyz/ipfs/${comment.author.avatar_ipfs_hash}`
                            : undefined
                        }
                        alt={comment.author?.display_name}
                      />
                      <AvatarFallback>
                        {comment.author?.display_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {comment.author?.display_name}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
