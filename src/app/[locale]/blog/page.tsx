 import type { Metadata } from "next";
 import { getLocale } from "next-intl/server";
 import { blogPosts } from "@/data/blog";
 import Link from "next/link";
 
 const CATEGORY_LABELS_CN: Record<string, string> = {
   care: "养护指南",
   knowledge: "紫砂知识",
   tutorial: "冲泡教程",
   culture: "茶文化",
 };
 
 const CATEGORY_LABELS_TW: Record<string, string> = {
   care: "養護指南",
   knowledge: "紫砂知識",
   tutorial: "沖泡教程",
   culture: "茶文化",
 };
const CATEGORY_LABELS_EN: Record<string, string> = {
  care: "Care Guide",
  knowledge: "Zisha Knowledge",
  tutorial: "Brewing Tutorial",
  culture: "Tea Culture",
};
 
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEN = locale === "en";

  if (isEN) {
    return {
      title: "Blog",
      description:
        "Yixing Zisha teapot knowledge, tea ceremony culture, Gongfu tea tutorials. From seasoning and care to clay identification — professional zisha content for international tea lovers.",
      openGraph: {
        title: "Blog - Zisha Teapot Knowledge | Tea Culture | Brewing Guides | Zisha Artisan",
        description:
          "Yixing Zisha teapot knowledge, tea ceremony culture, Gongfu tea tutorials. Professional zisha content for tea lovers worldwide.",
      },
    };
  }

  const isTW = locale === "zh-TW";
  return {
    title: isTW ? "部落格" : "博客",
    description: isTW
      ? "紫砂壶知识、茶道文化、功夫茶教程。从开壶养护到泥料鉴别，为海外华人提供专业紫砂内容。"
      : "紫砂壶知识、茶道文化、功夫茶教程。从开壶养护到泥料鉴别，为海外华人提供专业紫砂内容。",
    openGraph: {
      title: isTW ? "部落格 - 紫砂壶知识 | 茶文化 | 冲泡教程 | 紫砂雅集" : "博客 - 紫砂壶知识 | 茶文化 | 冲泡教程 | 紫砂雅集",
      description:
        "紫砂壶知识、茶道文化、功夫茶教程。从开壶养护到泥料鉴别，为海外华人提供专业紫砂内容。",
    },
  };
}
 
 export default async function BlogPage() {
   const locale = await getLocale();
   const isEN = locale === "en";
   const isTW = locale === "zh-TW";
   const labels = isEN ? CATEGORY_LABELS_EN : (isTW ? CATEGORY_LABELS_TW : CATEGORY_LABELS_CN);
 
   const sortedPosts = [...blogPosts].sort(
     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   );
 
   return (
     <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
       {/* Breadcrumb */}
       <nav className="mb-6 text-xs text-muted-foreground">
         <Link href="/" className="hover:text-primary transition-colors">
           {isEN ? "Home" : isTW ? "首页" : "首页"}
         </Link>
         <span className="mx-2">/</span>
         <span className="text-foreground">
           {isEN ? "Blog" : isTW ? "部落格" : "博客"}
         </span>
       </nav>
 
       <div className="mb-10">
         <h1 className="text-3xl font-bold tracking-tight text-foreground">
           {isEN ? "Zisha Artisan Blog" : isTW ? "紫砂雅集部落格" : "紫砂雅集博客"}
         </h1>
         <p className="mt-2 text-muted-foreground">
           {isEN ? "Zisha knowledge, tea culture, brewing guides — explore the world of Yixing clay teapots" : isTW
             ? "紫砂知識、茶道文化、沖泡教程 — 探索紫砂壺的精彩世界"
             : "紫砂知识、茶道文化、冲泡教程 — 探索紫砂壶的精彩世界"}
         </p>
       </div>
 
       <div className="space-y-8">
         {sortedPosts.map((post) => (
           <article
             key={post.slug}
             className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:shadow-md hover:border-border"
           >
             <div className="flex items-start gap-2 mb-2">
               <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                 {labels[post.category] || post.category}
               </span>
               <span className="text-[10px] text-muted-foreground">
                 {post.createdAt}
               </span>
             </div>
             <Link href={`/blog/${post.slug}`}>
               <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                 {isEN ? post.title_en : (isTW ? post.title_zhTW : post.title_zhCN)}
               </h2>
             </Link>
             <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
               {isEN ? post.excerpt_en : (isTW ? post.excerpt_zhTW : post.excerpt_zhCN)}
             </p>
             <div className="mt-3 flex flex-wrap gap-1.5">
               {post.tags.slice(0, 3).map((tag) => (
                 <span
                   key={tag}
                   className="text-[10px] text-muted-foreground/70"
                 >
                   #{tag}
                 </span>
               ))}
             </div>
           </article>
         ))}
       </div>
     </div>
   );
 }
