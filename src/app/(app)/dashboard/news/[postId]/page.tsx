"use client";

import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import Loading from "@/components/(loading)";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/index.utils";
import { getApiHeaders } from "@/utils/api.utils";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BlogDetailProps } from "@/interfaces/blog.interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  faNewspaper,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const keywords = [
  "Decode",
  "Dehive",
  "Dedao",
  "Decareer",
  "Decourse",
  "Defuel",
  "Deid",
];

export default function NewsPage() {
  const router = useRouter();
  const { postId } = useParams();
  const { user } = useUser();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [postDetail, setPostDetail] = useState<BlogDetailProps>(
    {} as BlogDetailProps
  );
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [editPostForm, setEditPostForm] = useState({
    title: "",
    content: "",
    keyword: "",
  });
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
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
        if (apiResponse.status === 404) {
          setNotFound(true);
        } else {
          toastError("Failed to fetch posts");
        }
        return;
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
  }, [fingerprintHash, postId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/blogs/specific", {
        method: "DELETE",
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
        response.message === "Post deleted successfully"
      ) {
        setDeleteDialog(false);
        router.push("/dashboard/news");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load posts";
      toastError(message);
    }
  }, [fingerprintHash, postId, router]);

  const handleEditPost = useCallback(async () => {
    if (!editPostForm.title || !editPostForm.content || !editPostForm.keyword) {
      toastError("Please fill in all required fields");
      return;
    }
    try {
      const apiResponse = await fetch("/api/blogs/specific", {
        method: "PUT",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ postId, ...editPostForm }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to fetch posts");
      }

      const response = await apiResponse.json();

      if (
        response.statusCode === 200 &&
        response.message === "Post updated successfully"
      ) {
        setEditDialog(false);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load posts";
      toastError(message);
    }
  }, [fingerprintHash, postId, editPostForm, fetchPosts]);

  const handleComment = useCallback(async () => {
    if (!commentContent) {
      toastError("Comment content cannot be empty");
      return;
    }
    try {
      const apiResponse = await fetch("/api/blogs/comment", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ postId, content: commentContent }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to post comment");
      }

      const response = await apiResponse.json();

      if (
        response.statusCode === 201 &&
        response.message === "Comment created successfully"
      ) {
        setCommentContent("");
        fetchPosts();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      const message =
        error instanceof Error ? error.message : "Failed to post comment";
      toastError(message);
    }
  }, [fingerprintHash, postId, fetchPosts, commentContent]);

  const handleCommentEdit = useCallback(
    async (commentId: string, content: string) => {
      if (!content) {
        toastError("Comment content cannot be empty");
        return;
      }
      try {
        const apiResponse = await fetch("/api/blogs/comment", {
          method: "PUT",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ commentId, content }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          throw new Error("Failed to update comment");
        }

        const response = await apiResponse.json();

        if (response.statusCode === 200) {
          setEditingCommentId(null);
          setEditingCommentContent("");
          fetchPosts();
        }
      } catch (error) {
        console.error("Error updating comment:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update comment";
        toastError(message);
      }
    },
    [fingerprintHash, fetchPosts]
  );

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      try {
        const apiResponse = await fetch("/api/blogs/comment", {
          method: "DELETE",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ commentId }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          throw new Error("Failed to delete comment");
        }

        const response = await apiResponse.json();

        if (response.statusCode === 200) {
          setDeleteCommentDialogOpen(false);
          setDeleteCommentId(null);
          fetchPosts();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        const message =
          error instanceof Error ? error.message : "Failed to delete comment";
        toastError(message);
      }
    },
    [fingerprintHash, fetchPosts]
  );

  const getImageUrl = (post: BlogDetailProps) => {
    if (post.post_ipfs_hash) {
      return `https://ipfs.de-id.xyz/ipfs/${post.post_ipfs_hash}`;
    }
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
  };

  const number = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon
              icon={faNewspaper}
              className="w-16 h-16 text-muted-foreground mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Post Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The post you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push("/dashboard/news")}>
              Back to News
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <Loading.NewsCard />;
  }

  return (
    <>
      {loading ? (
        <Loading.NewsCard />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => router.back()}>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to News
            </Button>

            {user._id === postDetail.author.id && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditPostForm({
                      title: postDetail.title,
                      content: postDetail.content,
                      keyword: postDetail.keyword,
                    });
                    setEditDialog(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Post
                </Button>

                <Button variant="outline" onClick={() => setDeleteDialog(true)}>
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete Post
                </Button>
              </div>
            )}
          </div>

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
                    className="object-contain"
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

          <div className="mt-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    user?.avatar_ipfs_hash
                      ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                      : undefined
                  }
                  alt={user?.display_name}
                />
                <AvatarFallback>
                  {user?.display_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                />

                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCommentContent("")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentContent.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>

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
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comment.author?.display_name}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {comment.author?.id === user?._id && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditingCommentContent(comment.content);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteCommentId(comment._id);
                                setDeleteCommentDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingCommentContent}
                            onChange={(e) =>
                              setEditingCommentContent(e.target.value)
                            }
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleCommentEdit(
                                  comment._id,
                                  editingCommentContent
                                )
                              }
                              disabled={!editingCommentContent.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{comment.content}</p>
                      )}
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

          <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeletePost}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialog} onOpenChange={setEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Post</DialogTitle>
                <DialogDescription>
                  Update your post details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editPostForm.title}
                    onChange={(e) =>
                      setEditPostForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-keyword">Keyword</Label>
                  <Select
                    value={editPostForm.keyword}
                    onValueChange={(value) =>
                      setEditPostForm((prev) => ({ ...prev, keyword: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a keyword" />
                    </SelectTrigger>
                    <SelectContent>
                      {keywords.map((keyword) => (
                        <SelectItem key={keyword} value={keyword}>
                          {keyword}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editPostForm.content}
                    onChange={(e) =>
                      setEditPostForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Enter post content"
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditPost}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteCommentDialogOpen}
            onOpenChange={setDeleteCommentDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this comment? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteCommentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteCommentId && handleCommentDelete(deleteCommentId)
                  }
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
