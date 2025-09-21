"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import App from "@/components/(app)";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNewspaper,
  faClock,
  faThumbsUp,
  faComment,
  faShare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

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
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blogs/blog", {
          method: "GET",
          headers: {
            "Frontend-Internal-Request": "true",
          },
          cache: "no-store",
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
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err instanceof Error ? err.message : "Failed to load posts");
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
      return `https://gateway.pinata.cloud/ipfs/${post.post_ipfs_hash}`;
    }
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader
        title="News"
        description="Latest blog posts from the community."
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4"
            />
            <p className="text-gray-400">Loading posts...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon
            icon={faNewspaper}
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-400">
            Be the first to share something with the community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {posts.map((post) => (
            <article
              key={post._id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={getImageUrl(post)}
                  alt={post.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-md bg-blue-500/80 text-white capitalize">
                  {post.category}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                  <FontAwesomeIcon icon={faNewspaper} />
                  <span className="uppercase tracking-wide">Community</span>
                  <span>•</span>
                  <FontAwesomeIcon icon={faClock} />
                  <span>{formatTime(post.createdAt)}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold leading-snug mb-1">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {post.content}
                </p>
                {post.keywords && post.keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-4 text-gray-300">
                    <button className="flex items-center gap-1.5 text-xs hover:text-white">
                      <FontAwesomeIcon icon={faThumbsUp} />
                      <span>{number(post.upvote)}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs hover:text-white">
                      <FontAwesomeIcon icon={faComment} />
                      <span>0</span>
                    </button>
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <FontAwesomeIcon icon={faShare} /> Share
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
