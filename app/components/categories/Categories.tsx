import Image, { type StaticImageData } from "next/image";
import { chemodan, education, food, games, gantel, med_kit, salon, tire } from "@/app/assets/img";
import "./categories.css";

const categories: { title: string; image: StaticImageData }[] = [
  { title: "Рестораны", image: food },
  { title: "Медицина", image: med_kit },
  { title: "Салоны красоты", image: salon },
  { title: "Образование", image: education },
  { title: "Отели", image: chemodan },
  { title: "Авто сервис", image: tire },
  { title: "Развлечения", image: games },
];

function CategoryCard({
  title,
  image,
  compact = false,
}: {
  title: string;
  image: StaticImageData;
  compact?: boolean;
}) {
  return (
    <article className={`categories__card${compact ? " categories__card--compact" : ""}`}>
      <h2 className="categories__title">{title}</h2>
      <Image className="categories__image" src={image} alt="" />
    </article>
  );
}

export default function Categories() {
  return (
    <section className="categories" aria-label="Категории услуг">
      <div className="categories__grid">
        {categories.map((category) => (
          <CategoryCard key={category.title} {...category} />
        ))}
        <div className="categories__last-column">
          <CategoryCard title="Спорт и фитнес" image={gantel} compact />
          <button className="categories__view-all" type="button">
            <span>Посмотреть<br />все</span>
            <span className="categories__view-all-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
