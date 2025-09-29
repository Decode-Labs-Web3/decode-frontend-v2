"use client";

import Image from "next/image";
import Auth from "@/components/(auth)";
import { useState, useEffect } from "react";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faUpload,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const categories = [
  { value: "decode", label: "Decode" },
  { value: "dehive", label: "Dehive" },
  { value: "dedao", label: "Dedao" },
  { value: "decareer", label: "Decareer" },
  { value: "decourse", label: "Decourse" },
  { value: "defuel", label: "Defuel" },
  { value: "deid", label: "Deid" },
];

export default function BlogPostPage() {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    content: "",
    category: "",
    keywords: "",
    post_ipfs_hash: null as string | null,
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setFormData((prev) => ({
          ...prev,
          user_id: userData.id || "",
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      await uploadImageToIPFS(file);
    }
  };

  const uploadImageToIPFS = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Frontend-Internal-Request": "true",
        },
        body: formData,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          post_ipfs_hash: data.ipfsHash,
        }));
        toastSuccess("Image uploaded to IPFS successfully!");
      } else {
        const error = await response.json();
        toastError(error.message || "Failed to upload image to IPFS");
        // Reset image if upload fails
        setFormData((prev) => ({
          ...prev,
          post_ipfs_hash: null,
        }));
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error uploading image to IPFS:", err);
      toastError("Error uploading image to IPFS");
      // Reset image if upload fails
      setFormData((prev) => ({
        ...prev,
        post_ipfs_hash: null,
      }));
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      post_ipfs_hash: null,
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toastError("Please fill in all required fields");
      return;
    }

    try {
      const body = {
        user_id: formData.user_id,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        keywords: formData.keywords,
        post_ipfs_hash: formData.post_ipfs_hash,
      };

      console.log("Sending body:", body);

      const response = await fetch("/api/blogs/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        toastSuccess("Blog post created successfully");
        setFormData((prev) => ({
          ...prev,
          title: "",
          content: "",
          category: "",
          keywords: "",
          post_ipfs_hash: null,
        }));
        setImagePreview(null);
      } else {
        const error = await response.json();
        toastError(error.message || "Failed to create blog post");
      }
    } catch (err) {
      console.error("Error creating blog post:", err);
      toastError("Failed to create blog post");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Featured Image
          </label>
          <div className="border-2 border-dashed border-[color:var(--border)] rounded-lg p-6 text-center hover:border-[color:var(--foreground)]/30 transition-colors bg-[color:var(--surface)]">
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={256}
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
                {uploadingImage && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-12 h-12 text-[color:var(--muted-foreground)] mx-auto mb-4 animate-spin"
                  />
                )}
                {formData.post_ipfs_hash && !uploadingImage && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                    IPFS ✓
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div>
                <FontAwesomeIcon
                  icon={faImage}
                  className="w-12 h-12 text-[color:var(--muted-foreground)] mx-auto mb-4"
                />
                <p className="text-[color:var(--muted-foreground)] mb-2">
                  Click to upload an image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  Choose Image
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg text-[color:var(--foreground)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Keywords
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="Enter keywords separated by commas (e.g., blockchain, web3, crypto)"
            className="w-full px-4 py-3 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60"
          />
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Separate multiple keywords with commas for better discoverability
          </p>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter your blog post title"
            className="w-full px-4 py-3 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60"
          />
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[color:var(--muted-foreground)]">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={12}
            placeholder="Write your blog post content here..."
            className="w-full px-4 py-3 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-lg text-[color:var(--foreground)] placeholder-[color:var(--muted-foreground)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500/60 resize-vertical"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Auth.SubmitButton className="px-8 py-3">
            Create Post
          </Auth.SubmitButton>
        </div>
      </form>
    </div>
  );
}
