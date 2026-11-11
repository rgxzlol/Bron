import Categories from "./components/categories/Categories";
import Stories from "./components/stories/Stories";
import PopularPlaces from "./components/places/PopularPlaces";
import NearbyPlaces from "./components/places/NearbyPlaces";
import Navbar from "./navbar/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar/>
      <div className="container">
        <Categories/>
        <Stories/>
        <PopularPlaces/>
        <NearbyPlaces/>
      </div>
    </div>
  );
}
