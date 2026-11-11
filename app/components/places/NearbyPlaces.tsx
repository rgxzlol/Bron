import Image from "next/image";
import { placeArrow } from "@/app/assets/svg";
import { PlaceCard, places } from "./PopularPlaces";
import "./nearby-places.css";

export default function NearbyPlaces() {
  return (
    <section className="nearby-places" aria-labelledby="nearby-places-title">
      <div className="nearby-places__header">
        <h2 className="nearby-places__title" id="nearby-places-title">Рядом с вами</h2>
        <button className="nearby-places__view-all" type="button">
          <span>Посмотреть все</span>
          <Image src={placeArrow} alt="" aria-hidden="true" width={17} height={12} />
        </button>
      </div>
      <div className="nearby-places__panel">
        <div className="nearby-places__list" aria-label="Места рядом с вами">
          {places.map((place) => <PlaceCard key={place.id} place={place} />)}
        </div>
      </div>
    </section>
  );
}
