export interface LessonsRoot {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: LessonsItem[];
}

export interface LessonsItem {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  title: string;
  description: string;
  markdown: string;
  richtext: string;
  type: string;
  gist?: string;
}

export async function getLessons(page:number,perPage:number): Promise<LessonsRoot> {
  try {
    const endpoint = `${process.env.PB_URL}/api/collections/portfolio_milestones/records?sort=-created,id&page=${page}&perPage=${perPage}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      return {
        page: 0,
        perPage: 0,
        totalPages: 0,
        totalItems: 0,
        items: [],
      };
    }
    return res.json() as Promise<LessonsRoot>;
  } catch (error) {
    console.log("=== error fetching lessons ===", error);
      return {
        page: 0,
        perPage: 0,
        totalPages: 0,
        totalItems: 0,
        items: [],
      };
  }
}
export async function getOneLesson(id: string): Promise<LessonsItem | undefined> {
  try {
    const endpoint = `${process.env.PB_URL}/api/collections/portfolio_milestones/records/${id}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      console.log("=== error fetchin one lesson ===", res.statusText);
      return
    }
    return res.json() as Promise<LessonsItem | undefined>;
  } catch (error) {
    console.log("=== error fetching one lesson ===", error);
    return;
  }
}
