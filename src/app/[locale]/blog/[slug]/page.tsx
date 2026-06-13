 import type { Metadata } from "next";
 import { getLocale } from "next-intl/server";
 import { notFound } from "next/navigation";
 import { blogPosts, getBlogPostBySlug } from "@/data/blog";
 import Link from "next/link";
 
 export function generateStaticParams() {
   return blogPosts.map((p) => ({ slug: p.slug }));
 }
 
 export async function generateMetadata({
   params,
 }: {
   params: Promise<{ slug: string }>;
 }): Promise<Metadata> {
   const { slug } = await params;
   const post = getBlogPostBySlug(slug);
   const locale = await getLocale();
 
   if (!post) {
     return { title: "文章未找到" };
   }
 
   const title = locale === "zh-TW" ? post.title_zhTW : post.title_zhCN;
   const excerpt = locale === "zh-TW" ? post.excerpt_zhTW : post.excerpt_zhCN;
 
   return {
     title,
     description: excerpt.slice(0, 160),
     openGraph: {
       title: `${title} | 紫砂雅集`,
       description: excerpt.slice(0, 160),
       type: "article",
       publishedTime: post.createdAt,
     },
     twitter: {
       card: "summary_large_image",
       title: `${title} | 紫砂雅集`,
       description: excerpt.slice(0, 160),
     },
   };
 }
 
 export default async function BlogPostPage({
   params,
 }: {
   params: Promise<{ slug: string }>;
 }) {
   const { slug } = await params;
   const post = getBlogPostBySlug(slug);
   const locale = await getLocale();
 
   if (!post) notFound();
 
   const isTW = locale === "zh-TW";
   const title = isTW ? post.title_zhTW : post.title_zhCN;
   const content = isTW ? post.content_zhTW : post.content_zhCN;
   const excerpt = isTW ? post.excerpt_zhTW : post.excerpt_zhCN;
 
   return (
     <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
       {/* Breadcrumb */}
       <nav className="mb-6 text-xs text-muted-foreground">
         <Link href="/" className="hover:text-primary transition-colors">
           {isTW ? "首頁" : "首页"}
         </Link>
         <span className="mx-2">/</span>
         <Link
           href="/blog"
           className="hover:text-primary transition-colors"
         >
           {isTW ? "部落格" : "博客"}
         </Link>
         <span className="mx-2">/</span>
         <span className="text-foreground">{title}</span>
       </nav>
 
      <article>
        {/* JSON-LD Article Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: title,
              description: excerpt.slice(0, 160),
              datePublished: post.createdAt,
              author: {
                "@type": "Organization",
                name: "紫砂雅集",
              },
              publisher: {
                "@type": "Organization",
                name: "紫砂雅集",
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
        <header className="mb-8">
           <div className="mb-3 text-xs text-muted-foreground">
             {post.createdAt}
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
             {title}
           </h1>
           <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
             {excerpt}
           </p>
         </header>
 
         <div
           className="prose prose-sm prose-zisha max-w-none
             prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-3
             prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
             prose-strong:text-foreground prose-strong:font-medium
             prose-ul:text-muted-foreground prose-ul:mb-4
             prose-ol:text-muted-foreground prose-ol:mb-4
             prose-li:mb-1.5
             prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:rounded"
           dangerouslySetInnerHTML={{ __html: content }}
         />
 
         {/* Tags */}
         <div className="mt-10 pt-6 border-t border-border/50">
           <div className="flex flex-wrap gap-2">
             {post.tags.map((tag) => (
               <span
                 key={tag}
                 className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
               >
                 #{tag}
               </span>
             ))}
           </div>
         </div>
 
         {/* Related posts */}
         <div className="mt-10 pt-6 border-t border-border/50">
           <h2 className="text-sm font-semibold text-foreground mb-3">
             {isTW ? "相關文章" : "相关文章"}
           </h2>
           <div className="space-y-2">
             {blogPosts
               .filter(
                 (p) =>
                   p.category === post.category && p.slug !== post.slug
               )
               .slice(0, 3)
               .map((related) => (
                 <Link
                   key={related.slug}
                   href={`/blog/${related.slug}`}
                   className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                 >
                   → {isTW ? related.title_zhTW : related.title_zhCN}
                 </Link>
               ))}
           </div>
         </div>
 
         {/* Back to blog */}
         <div className="mt-8 text-center">
           <Link
             href="/blog"
             className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
           >
             ← {isTW ? "返回部落格" : "返回博客"}
           </Link>
         </div>
       </article>
     </div>
   );
 }
