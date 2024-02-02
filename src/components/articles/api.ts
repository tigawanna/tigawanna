export async function fetchMyLatstDevToArticles() {
  try {
    const apiKey = process.env.DEV_TO_KEY;
    const username = "tigawanna";

    const articles= await fetch(`https://dev.to/api/articles?username=${username}&per_page=4`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        return data;
      });
      return articles as DevtoArticles
  } catch (error:any) {
    console.log("error getting articles", error);
    return
  }
}

export type DevtoArticles = DevtoArticle[]

export interface DevtoArticle {
    type_of: string
    id: number
    title: string
    description: string
    readable_publish_date: string
    slug: string
    path: string
    url: string
    comments_count: number
    public_reactions_count: number
    collection_id?: number
    published_timestamp: string
    positive_reactions_count: number
    cover_image: string
    social_image: string
    canonical_url: string
    created_at: string
    edited_at: string
    crossposted_at: any
    published_at: string
    last_comment_at: string
    reading_time_minutes: number
    tag_list: string[]
    tags: string
    user: DevtoArticleUser
}

export interface DevtoArticleUser {
    name: string
    username: string
    twitter_username: string
    github_username: string
    user_id: number
    website_url: string
    profile_image: string
    profile_image_90: string
}
