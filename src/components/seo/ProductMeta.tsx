import type { Product } from "@/types";
import {
  generateProductMeta,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";

interface ProductMetaProps {
  product: Product;
  locale: string;
}

/**
 * ProductMeta renders JSON-LD structured data and Open Graph meta tags
 * for a product page. This component is intended for use in Server Components.
 */
export function ProductMeta({ product, locale }: ProductMetaProps) {
  const meta = generateProductMeta(product, locale);
  const productJsonLd = generateProductJsonLd(product, locale);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(product, locale);

  const breadcrumbJson = JSON.stringify(breadcrumbJsonLd);
  const productJson = JSON.stringify(productJsonLd);

  return (
    <>
      {/* Open Graph meta tags */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="紫砂雅集" />

      {/* Twitter card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {/* JSON-LD - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      {/* JSON-LD - Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJson }}
      />
    </>
  );
}
