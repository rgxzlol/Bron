import Categories from "./components/categories/Categories";
import Navbar from "./navbar/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar/>
      <div className="container">
        <Categories/>
      </div>
    </div>
  );
}
