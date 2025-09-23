"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import App from "@/components/(app)";
import Auth from "@/components/(auth)";
import { useLoading } from "@/hooks/useLoading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  showSuccess,
  showError,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/utils/toast.utils";

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
  const { loading, setLoading } = useLoading();
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

  // Get user_id from localStorage after component mounts
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      // Upload to IPFS
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
          "X-Frontend-Internal-Request": "true",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          post_ipfs_hash: data.ipfsHash,
        }));
        showSuccess("Image uploaded to IPFS successfully!");
      } else {
        const error = await response.json();
        showError(error.message || "Failed to upload image to IPFS");
        // Reset image if upload fails
        setFormData((prev) => ({
          ...prev,
          post_ipfs_hash: null,
        }));
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error uploading image to IPFS:", err);
      showError("Error uploading image to IPFS");
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
      showError("Please fill in all required fields");
      return;
    }

    setLoading(true);

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
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        showSuccess(SUCCESS_MESSAGES.CREATED);
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
        showError(error.message || "Failed to create blog post");
      }
    } catch (err) {
      console.error("Error creating blog post:", err);
      showError(ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <App.PageHeader
        title="Create Blog Post"
        description="Share your thoughts with the community."
      />

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Featured Image
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
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
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">Uploading to IPFS...</p>
                      </div>
                    </div>
                  )}
                  {formData.post_ipfs_hash && !uploadingImage && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      IPFS ✓
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div>
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  />
                  <p className="text-gray-400 mb-2">Click to upload an image</p>
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
            <label className="block text-sm font-medium text-gray-300">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-300">
              Keywords
            </label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="Enter keywords separated by commas (e.g., blockchain, web3, crypto)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Separate multiple keywords with commas for better discoverability
            </p>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter your blog post title"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={12}
              placeholder="Write your blog post content here..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Auth.SubmitButton loading={loading} className="px-8 py-3">
              {loading ? "Creating Post..." : "Create Post"}
            </Auth.SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
