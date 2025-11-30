"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Textarea } from "@/components/ui/textarea";
import { useFingerprint } from "@/hooks/useFingerprint.hooks";
import { toastSuccess, toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  faImage,
  faUpload,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const keywords = [
  "Decode",
  "Dehive",
  "Dedao",
  "Decareer",
  "Decourse",
  "Defuel",
  "Deid",
];

export default function BlogPostPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    keyword: "",
    post_ipfs_hash: null as string | null,
  });

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    },
    []
  );

  const uploadImageToIPFS = useCallback(async (file: File) => {
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
  }, []);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        await uploadImageToIPFS(file);
      }
    },
    [uploadImageToIPFS]
  );

  const removeImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      post_ipfs_hash: null,
    }));
    setImagePreview(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title || !formData.content) {
        toastError("Please fill in all required fields");
        return;
      }

      try {
        const body = {
          title: formData.title,
          content: formData.content,
          keyword: formData.keyword,
          post_ipfs_hash: formData.post_ipfs_hash,
        };

        console.log("Sending body:", body);

        const apiResponse = await fetch("/api/blogs/post", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(body),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });

        if (!apiResponse.ok) {
          console.error("API response not ok:", apiResponse);
        }

        const response = await apiResponse.json();
        if (
          response.statusCode === 201 &&
          response.message === "Post created successfully"
        ) {
          toastSuccess("Blog post created successfully");
          setFormData(() => ({
            title: "",
            content: "",
            keyword: "",
            post_ipfs_hash: null,
          }));
          setImagePreview(null);
          router.push("/dashboard/news");
        } else {
          const error = await response.json();
          toastError(error.message || "Failed to create blog post");
        }
      } catch (err) {
        console.error("Error creating blog post:", err);
        toastError("Failed to create blog post");
      }
    },
    [formData, fingerprintHash, router]
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Featured Image</Label>
              <div className="border-2 border-dashed border-(--border) rounded-lg p-6 text-center hover:border-(--foreground)/30 transition-colors bg-(--muted)/50">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview || ""}
                      alt="Preview"
                      width={400}
                      height={256}
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    {uploadingImage && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="w-12 h-12 text-(--muted-foreground) mx-auto mb-4 animate-spin"
                      />
                    )}
                    {formData.post_ipfs_hash && !uploadingImage && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        IPFS
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={removeImage}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full p-1 h-6 w-6"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <FontAwesomeIcon
                      icon={faImage}
                      className="w-12 h-12 text-(--muted-foreground) mx-auto mb-4"
                    />
                    <p className="text-(--muted-foreground) mb-2">
                      Click to upload an image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="w-4 h-4 mr-2"
                        />
                        Choose Image
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Keyword <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.keyword}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, keyword: value }))
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

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter your blog post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Create Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
