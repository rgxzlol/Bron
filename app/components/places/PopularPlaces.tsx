import Image, { type StaticImageData } from "next/image";
import { popularThePlow } from "@/app/assets/img";
import {
  placeArrow,
  placeHeart,
  placeLocation,
  placeRatingStar,
  placeSeparator,
  placeTime,
} from "@/app/assets/svg";
import "./popular-places.css";

export type Place = {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  rating: string;
  distance: string;
  hours: string;
  price: string;
  image: StaticImageData;
};

export const places: Place[] = [
  {
    id: "the-plow-1",
    name: "The plow",
    category: "Ресторан",
    cuisine: "Узбекская кухня",
    rating: "4.6",
    distance: "1.2km",
    hours: "9:00-22:00",
    price: "120 000 - 160 000 сум",
    image: popularThePlow,
  },
  {
    id: "the-plow-2",
    name: "The plow",
    category: "Ресторан",
    cuisine: "Узбекская кухня",
    rating: "4.6",
    distance: "1.2km",
    hours: "9:00-22:00",
    price: "120 000 - 160 000 сум",
    image: popularThePlow,
  },
  {
    id: "the-plow-3",
    name: "The plow",
    category: "Ресторан",
    cuisine: "Узбекская кухня",
    rating: "4.6",
    distance: "1.2km",
    hours: "9:00-22:00",
    price: "120 000 - 160 000 сум",
    image: popularThePlow,
  },
];

export function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="popular-places__card">
      <div className="popular-places__photo">
        <Image
          className="popular-places__image"
          src={place.image}
          alt={`${place.name} — ресторан`}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <button className="popular-places__favorite" type="button" aria-label="Добавить в любимые">
          <Image src={placeHeart} alt="" aria-hidden="true" width={24} height={24} />
        </button>
      </div>
      <div className="popular-places__details">
        <div className="popular-places__name-row">
          <h3 className="popular-places__name">{place.name}</h3>
          <span className="popular-places__price">{place.price}</span>
        </div>
        <div className="popular-places__category">
          <span>{place.category}</span>
          <Image src={placeSeparator} alt="" aria-hidden="true" width={4} height={4} />
          <span>{place.cuisine}</span>
        </div>
        <div className="popular-places__meta">
          <span className="popular-places__rating">
            <Image src={placeRatingStar} alt="" aria-hidden="true" width={15} height={14} />
            {place.rating}
          </span>
          <span className="popular-places__meta-item">
            <Image src={placeLocation} alt="" aria-hidden="true" width={18} height={22} />
            {place.distance}
          </span>
          <span className="popular-places__meta-item">
            <Image src={placeTime} alt="" aria-hidden="true" width={24} height={24} />
            {place.hours}
          </span>
        </div>
        <button className="popular-places__book" type="button">Забронировать</button>
      </div>
    </article>
  );
}

export default function PopularPlaces() {
  return (
    <section className="popular-places" aria-labelledby="popular-places-title">
      <div className="popular-places__header">
        <h2 className="popular-places__title" id="popular-places-title">Популярные места</h2>
        <button className="popular-places__view-all" type="button">
          <span>Посмотреть все</span>
          <Image src={placeArrow} alt="" aria-hidden="true" width={17} height={12} />
        </button>
      </div>
      <div className="popular-places__grid">
        {places.map((place) => <PlaceCard key={place.id} place={place} />)}
      </div>
    </section>
  );
}
