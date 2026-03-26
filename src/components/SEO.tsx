import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://percentilers.in/og-image.jpg";

const SEO = ({ title, description, canonical, ogImage = DEFAULT_OG_IMAGE, ogType = "website", noindex }: SEOProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:type" content={ogType} />
    <meta property="og:site_name" content="Percentilers" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@percentilers_in" />
    <meta name="twitter:creator" content="@percentilers_in" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
  </Helmet>
);

export default SEO;
