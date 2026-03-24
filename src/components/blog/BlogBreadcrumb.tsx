import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BlogBreadcrumbProps {
  postTitle: string;
}

const BlogBreadcrumb = ({ postTitle }: BlogBreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
    <ol className="flex items-center gap-1 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        <Link to="/" className="hover:text-foreground transition-colors" itemProp="item">
          <span itemProp="name">Home</span>
        </Link>
        <meta itemProp="position" content="1" />
      </li>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
        <Link to="/blog" className="hover:text-foreground transition-colors" itemProp="item">
          <span itemProp="name">Blog</span>
        </Link>
        <meta itemProp="position" content="2" />
      </li>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
        <span itemProp="name">{postTitle}</span>
        <meta itemProp="position" content="3" />
      </li>
    </ol>
  </nav>
);

export default BlogBreadcrumb;
