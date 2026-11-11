import Image from "next/image";
import { storyKhinkali } from "@/app/assets/img";
import { storyRatingStar, storySeparator } from "@/app/assets/svg";
import "./stories.css";

const stories = [
  { id: "khinkali-1", name: "Про Хинкали", rating: "4.6" },
  { id: "khinkali-2", name: "Про Хинкали", rating: "4.6" },
];

export default function Stories() {
  return (
    <section className="stories" aria-labelledby="stories-title">
      <h2 className="stories__title" id="stories-title">Истории</h2>
      <div className="stories__list" aria-label="Истории заведений">
        {stories.map((story) => (
          <article className="stories__card" key={story.id}>
            <Image className="stories__image" src={storyKhinkali} alt={story.name} />
            <span className="stories__border" aria-hidden="true" />
            <div className="stories__caption">
              <span className="stories__name">{story.name}</span>
              <Image className="stories__separator" src={storySeparator} alt="" aria-hidden="true" />
              <span className="stories__rating">
                <Image src={storyRatingStar} alt="" aria-hidden="true" />
                {story.rating}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}