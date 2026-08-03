import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface ProductReview {
  author_name: string | null;
  rating: number;
  content: string | null;
  verified: boolean;
  created_at: string;
}

export interface ProductReviewsData {
  reviews: ProductReview[];
  average: number;
  count: number;
}

/** Opublikowane recenzje produktu + średnia ocena. Bez bazy => pusto (front chowa sekcję). */
export async function getProductReviews(slug: string): Promise<ProductReviewsData> {
  const empty: ProductReviewsData = { reviews: [], average: 0, count: 0 };
  const db = supabaseAdmin();
  if (!db) return empty;

  const { data: product } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
  if (!product) return empty;

  const { data } = await db
    .from("reviews")
    .select("author_name,rating,content,verified,created_at")
    .eq("product_id", product.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as ProductReview[];
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / count : 0;
  return { reviews, average: Number(average.toFixed(2)), count };
}
