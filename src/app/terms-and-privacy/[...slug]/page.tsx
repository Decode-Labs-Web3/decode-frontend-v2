import { Metadata } from "next";
import { notFound } from "next/navigation";
import TermsPage from "../terms";
import PrivacyPage from "../privacy";

export const metadata: Metadata = {
  title: "Legal Documents - Decode Network",
  description: "Terms of Service and Privacy Policy for Decode Network",
};

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;

  // Handle different route patterns
  if (slug.length === 1) {
    const page = slug[0];

    switch (page) {
      case "terms":
      case "terms-of-service":
        return <TermsPage />;
      case "privacy":
      case "privacy-policy":
        return <PrivacyPage />;
      default:
        notFound();
    }
  }

  // Handle nested routes like /terms-and-privacy/legal/terms
  if (slug.length === 2 && slug[0] === "legal") {
    const page = slug[1];

    switch (page) {
      case "terms":
      case "terms-of-service":
        return <TermsPage />;
      case "privacy":
      case "privacy-policy":
        return <PrivacyPage />;
      default:
        notFound();
    }
  }

  notFound();
}

// Generate static params for known routes
export async function generateStaticParams() {
  return [
    { slug: ["terms"] },
    { slug: ["terms-of-service"] },
    { slug: ["privacy"] },
    { slug: ["privacy-policy"] },
    { slug: ["legal", "terms"] },
    { slug: ["legal", "terms-of-service"] },
    { slug: ["legal", "privacy"] },
    { slug: ["legal", "privacy-policy"] },
  ];
}
