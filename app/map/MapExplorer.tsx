"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import "./map-explorer.css";

const REGION_CENTERS: Record<string, [number, number]> = {
  Ташкент: [69.2797, 41.3111],
  Каракалпакстан: [59.611, 42.461],
  Андижан: [72.344, 40.782],
  Бухара: [64.421, 39.774],
  Джизак: [67.842, 40.115],
  Карши: [65.789, 38.861],
  Навои: [65.379, 40.103],
  Наманган: [71.672, 40.999],
  Самарканд: [66.959, 39.654],
  Термез: [67.278, 37.224],
  Гулистан: [68.78, 40.49],
  Хорезм: [60.63, 41.55],
  Фергана: [71.78, 40.386],
};
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type SearchSuggestion = {
  mapbox_id: string;
  name: string;
  feature_type: string;
  full_address?: string;
  place_formatted?: string;
};

type RetrievedFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    full_address?: string;
    place_formatted?: string;
  };
};

type SearchResponse = {
  suggestions?: SearchSuggestion[];
  features?: RetrievedFeature[];
};

function getGeolocationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Разрешите доступ к геолокации в настройках браузера.";
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Не удалось определить ваше местоположение.";
  }
  if (error.code === error.TIMEOUT) {
    return "Время ожидания геолокации истекло. Попробуйте ещё раз.";
  }
  return "Не удалось получить ваше местоположение.";
}

export default function MapExplorer({ region }: { region: string }) {
  const regionCenter = REGION_CENTERS[region] ?? REGION_CENTERS.Ташкент;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      return;
    }

    let active = true;
    let map: MapboxMap | null = null;

    void import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!active || !mapElementRef.current) {
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;
      map = new mapboxgl.Map({
        container: mapElementRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: regionCenter,
        zoom: 12,
        minZoom: 3,
        maxZoom: 20,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
      map.on("load", () => {
        if (active) {
          setMapReady(true);
          setMapError(null);
        }
      });
      map.on("error", (event) => {
        if (active && !map?.loaded()) {
          setMapError(event.error.message || "Не удалось загрузить карту Mapbox.");
        }
      });
    }).catch((error: unknown) => {
      if (active) {
        setMapError(error instanceof Error ? error.message : "Не удалось загрузить карту Mapbox.");
      }
    });

    return () => {
      active = false;
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
  }, [regionCenter]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || query.trim().length < 3 || selectedLocation) {
      return;
    }

    let controller: AbortController | null = null;
    const timer = window.setTimeout(async () => {
      controller = new AbortController();
      setSearchLoading(true);
      setSearchError(null);

      try {
        const sessionToken = sessionTokenRef.current ?? crypto.randomUUID();
        sessionTokenRef.current = sessionToken;
        const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
        url.searchParams.set("q", query.trim());
        url.searchParams.set("access_token", MAPBOX_TOKEN);
        url.searchParams.set("session_token", sessionToken);
        url.searchParams.set("language", "ru");
        url.searchParams.set("limit", "6");
        url.searchParams.set("types", "poi,address,street,place,locality");
        url.searchParams.set("country", "UZ");
        url.searchParams.set("proximity", `${regionCenter[0]},${regionCenter[1]}`);

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Поиск Mapbox завершился с ошибкой (${response.status}).`);
        }
        const data = (await response.json()) as SearchResponse;
        setSuggestions(data.suggestions ?? []);
        setActiveSuggestion(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSuggestions([]);
        setSearchError(error instanceof Error ? error.message : "Не удалось выполнить поиск.");
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, [query, regionCenter, selectedLocation]);

  const selectSuggestion = useCallback(async (suggestion: SearchSuggestion) => {
    if (!MAPBOX_TOKEN) {
      setSearchError("Поиск недоступен: не задан токен Mapbox.");
      return;
    }

    const sessionToken = sessionTokenRef.current;
    if (!sessionToken) {
      setSearchError("Сессия поиска завершена. Повторите запрос.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const url = new URL(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}`,
      );
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("session_token", sessionToken);
      url.searchParams.set("language", "ru");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Не удалось открыть выбранное место (${response.status}).`);
      }
      const data = (await response.json()) as SearchResponse;
      const feature = data.features?.[0];
      const coordinates = feature?.geometry?.coordinates;
      if (!coordinates || coordinates.length !== 2 || !coordinates.every(Number.isFinite)) {
        throw new Error("Mapbox не вернул координаты выбранного места.");
      }

      const label =
        feature.properties?.name ??
        feature.properties?.full_address ??
        suggestion.name;
      const map = mapRef.current;
      if (!map) {
        throw new Error("Карта ещё загружается. Попробуйте выбрать место позже.");
      }
      map.flyTo({ center: coordinates, zoom: 16, essential: true });

      markerRef.current?.remove();
      const { default: mapboxgl } = await import("mapbox-gl");
      markerRef.current = new mapboxgl.Marker({ color: "#0a6af7" })
        .setLngLat(coordinates)
        .addTo(map);

      setSelectedLocation(label);
      setMapError(null);
      setQuery(label);
      setSuggestions([]);
      sessionTokenRef.current = null;
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Не удалось открыть выбранное место.");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setMapError("Этот браузер не поддерживает геолокацию.");
      return;
    }

    setLocating(true);
    setMapError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position: [number, number] = [coords.longitude, coords.latitude];
        try {
          const map = mapRef.current;
          if (!map) {
            throw new Error("Карта ещё загружается. Попробуйте ещё раз.");
          }
          map.flyTo({ center: position, zoom: 15, essential: true });
          markerRef.current?.remove();
          const { default: mapboxgl } = await import("mapbox-gl");
          markerRef.current = new mapboxgl.Marker({ color: "#12a76a" })
            .setLngLat(position)
            .addTo(map);
          setSelectedLocation("Моё местоположение");
          setQuery("");
          setSuggestions([]);
        } catch (error) {
          setMapError(error instanceof Error ? error.message : "Не удалось отметить местоположение.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setMapError(getGeolocationError(error));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const resetMap = () => {
    markerRef.current?.remove();
    markerRef.current = null;
    mapRef.current?.flyTo({ center: regionCenter, zoom: 12, essential: true });
    setSelectedLocation(null);
    setQuery("");
    setSuggestions([]);
    setSearchError(null);
  };

  const updateQuery = (value: string) => {
    if (selectedLocation) {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.flyTo({ center: regionCenter, zoom: 12, essential: true });
    }
    setSelectedLocation(null);
    setQuery(value);
    setSuggestions([]);
    setSearchError(null);
    setSearchLoading(value.trim().length >= 3);
    setActiveSuggestion(-1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSuggestions([]);
      setActiveSuggestion(-1);
    } else if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((activeSuggestion + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((activeSuggestion - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeSuggestion]);
    }
  };

  const showSearchResults =
    !selectedLocation &&
    (suggestions.length > 0 ||
      searchLoading ||
      Boolean(searchError) ||
      query.trim().length >= 3);

  return (
    <main className="map-explorer">
      <div className="map-explorer__canvas" ref={mapElementRef} aria-label={`Интерактивная карта: ${region}`} />

      <section className="map-search" aria-labelledby="map-title">
        <div className="map-search__heading">
          <div>
            <h1 className="map-search__title" id="map-title">Карта</h1>
            <p className="map-search__subtitle">Ищите места и адреса</p>
          </div>
          {selectedLocation && (
            <button className="map-search__reset" type="button" onClick={resetMap}>
              Сбросить
            </button>
          )}
        </div>

        <div className="map-search__field-wrap">
          <div className="map-search__field">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>
            <input
              type="search"
              role="combobox"
              maxLength={256}
              value={query}
              placeholder="Название места или адрес"
              aria-label="Поиск мест и адресов"
              aria-autocomplete="list"
              aria-controls={showSearchResults ? "map-search-results" : undefined}
              aria-expanded={showSearchResults}
              aria-activedescendant={activeSuggestion >= 0 ? `map-search-option-${activeSuggestion}` : undefined}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {query && (
              <button
                className="map-search__clear"
                type="button"
                aria-label="Очистить поиск"
                onClick={() => updateQuery("")}
              >
                ×
              </button>
            )}
          </div>

          {showSearchResults && (
            <div className="map-search__results" id="map-search-results" role="listbox" aria-label="Результаты поиска">
              {searchLoading && <p className="map-search__message">Ищем…</p>}
              {!searchLoading && searchError && <p className="map-search__message map-search__message--error">{searchError}</p>}
              {!searchLoading && !searchError && suggestions.length === 0 && query.trim().length >= 3 && (
                <p className="map-search__message">Ничего не найдено</p>
              )}
              {!searchLoading && suggestions.map((suggestion, index) => (
                <button
                  className={`map-search__option${index === activeSuggestion ? " is-active" : ""}`}
                  id={`map-search-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeSuggestion}
                  key={suggestion.mapbox_id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectSuggestion(suggestion)}
                >
                  <span className="map-search__option-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M19 10.2c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z" />
                      <circle cx="12" cy="10" r="2.2" />
                    </svg>
                  </span>
                  <span className="map-search__option-text">
                    <strong>{suggestion.name}</strong>
                    <small>{suggestion.full_address ?? suggestion.place_formatted ?? suggestion.feature_type}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedLocation && (
          <p className="map-search__selection" aria-live="polite">
            <span className="map-search__selection-dot" />
            {selectedLocation}
          </p>
        )}
      </section>

      <div className="map-tools" aria-label="Управление картой">
        <button type="button" aria-label="Моё местоположение" title="Моё местоположение" onClick={locateUser} disabled={locating || !mapReady}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Приблизить карту"
          title="Приблизить"
          onClick={() => mapRef.current?.zoomIn()}
          disabled={!mapReady}
        >
          <span aria-hidden="true">+</span>
        </button>
        <button
          type="button"
          aria-label="Отдалить карту"
          title="Отдалить"
          onClick={() => mapRef.current?.zoomOut()}
          disabled={!mapReady}
        >
          <span aria-hidden="true">−</span>
        </button>
        {selectedLocation && (
          <button type="button" aria-label={`Показать ${region}`} title={`Показать ${region}`} onClick={resetMap}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11a9 9 0 1 1 2.64 6.36M3 17v-6h6" />
            </svg>
          </button>
        )}
      </div>

      <div className="map-explorer__status" aria-live="polite">
        {!mapReady && !mapError && MAPBOX_TOKEN && <span className="map-explorer__loading">Загружаем карту…</span>}
        {(mapError || !MAPBOX_TOKEN) && (
          <span className="map-explorer__error" role="alert">
            {mapError ?? "Не задан NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN для загрузки карты."}
          </span>
        )}
      </div>
    </main>
  );
}
