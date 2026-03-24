import { Helmet } from "react-helmet-async";

interface BlogJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  featuredImage: string | null;
}

const BlogJsonLd = ({ title, description, slug, publishedAt, featuredImage }: BlogJsonLdProps) => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `https://percentilers.in/${slug}`,
    image: featuredImage || "https://percentilers.in/og-image.jpg",
    datePublished: publishedAt || undefined,
    dateModified: publishedAt || undefined,
    author: {
      "@type": "Person",
      name: "Pranshul Verma",
      url: "https://percentilers.in/",
    },
    publisher: {
      "@type": "Organization",
      name: "Percentilers",
      url: "https://percentilers.in/",
      logo: {
        "@type": "ImageObject",
        url: "https://percentilers.in/og-image.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://percentilers.in/${slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://percentilers.in/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://percentilers.in/blog" },
      { "@type": "ListItem", position: 3, name: title, item: `https://percentilers.in/${slug}` },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

export default BlogJsonLd;
