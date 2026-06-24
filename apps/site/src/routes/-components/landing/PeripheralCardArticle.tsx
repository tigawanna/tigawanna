import type { InfoCard } from "@/config/info";

type PeripheralCardArticleProps = {
  card: InfoCard;
  index: number;
  flat?: boolean;
};

export function PeripheralCardArticle({ card, index, flat = false }: PeripheralCardArticleProps) {
  return (
    <article
      className={flat ? "playing-card playing-card--flat" : "playing-card"}
      data-test={`peripheral-card-${index}`}
    >
      <p className="playing-card-tag">{card.tag}</p>
      <h3 className="playing-card-title">{card.title}</h3>
      <p className="playing-card-body">{card.body}</p>
      <span className="playing-card-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}
