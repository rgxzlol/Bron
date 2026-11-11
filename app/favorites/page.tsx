import Image from "next/image";
import Navbar from "../navbar/Navbar";
import { find, settings } from "../assets/svg";
import { PlaceCard, places } from "../components/places/PopularPlaces";
import "./favorites.css";

const favoritePlaces = Array.from({ length: 3 }, (_, row) =>
  places.map((place) => ({ ...place, id: `${place.id}-favorite-${row}` })),
).flat();

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <main className="container">
        <section className="favorites-page" aria-labelledby="favorites-title">
          <div className="favorites-page__header">
            <h1 className="favorites-page__title" id="favorites-title">Любимые места</h1>
            <div className="favorites-page__search" role="search">
              <Image src={find} alt="" aria-hidden="true" width={24} height={24} />
              <input
                type="search"
                name="q"
                placeholder="Ищите интересные места и сервисы"
                aria-label="Поиск любимых мест"
              />
              <button type="button" aria-label="Фильтры">
                <Image src={settings} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>
          </div>
          <div className="favorites-page__grid" aria-label="Любимые места">
            {favoritePlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        </section>
      </main>
    </>
  );
}
