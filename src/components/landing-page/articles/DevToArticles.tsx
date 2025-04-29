import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "../../shared/SectionHeader";
import { fetchMyLatstDevToArticles } from "./api";
type DevToArticlesProps = {};

export async function DevToArticles({}: DevToArticlesProps) {
  const articles = await fetchMyLatstDevToArticles();

  if (!articles) return null;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center lg:px-[10%]">
      <SectionHeader heading="My Latest Articles" id="articles" />
      <ul className="w-full flex flex-wrap justify-center items-center gap-5">
        {articles.map((article) => {
          return (
            <li
              key={article.id}
              className="card w-full sm:h-[350px] 
                md:w-[48%] lg:w-[28%] shadow-lg shadow-base-200 rounded-xl"
            >
              <figure>
                <Image
                  src={article.social_image}
                  alt={article.title}
                  width={300}
                  height={200}
                  className="h-[200px] w-full object-cover hover:scale-105 ease-linear duration-300"
                />
              </figure>
              <div className="p-2 flex flex-col gap-1">
                <h2 className="text-2xl">{article.title}</h2>
                <p className="font-sans text-sm line-clamp-2 brightness-90">
                  {article.description}
                </p>

                <div className="w-full flex justify-between items-center p-2">
                  <div className="flex gap-2 items-center  ">
                    <h3 className="text-xs text-accent">Published at:</h3>
                    <div className="text-xs font-thin ">
                      {new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    className="hover:text-accent"
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    read more
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
