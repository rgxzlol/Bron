"use client";

import { useState } from "react";
import Navbar from "../navbar/Navbar";
import MapExplorer from "./MapExplorer";
import "./map.css";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapPage() {
  const [region, setRegion] = useState("Ташкент");

  return (
    <div className="map-page">
      <Navbar onRegionChange={setRegion} />
      <MapExplorer key={region} region={region} />
    </div>
  );
}
