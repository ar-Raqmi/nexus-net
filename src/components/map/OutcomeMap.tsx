"use client";

import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CompanyLogo from "@/components/CompanyLogo";
import { ASEAN_VIEW } from "@/lib/geo";
import type { MapArc, MapFocus, MapLayerMode, MapPin, MapStartup } from "./types";

// OpenFreeMap public instance: no key, no limits. MapLibre adds the required attribution itself.
// Turbopack/webpack do not emit the worker beside its shared chunk, so the worker is vendored in public/maplibre (copy from node_modules/maplibre-gl/dist when upgrading).
maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const ARC_SOURCE = "arcs";
const DASH_FRAMES = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
  [0, 1, 3, 3],
  [0, 1.5, 3, 2.5],
  [0, 2, 3, 2],
  [0, 2.5, 3, 1.5],
  [0, 3, 3, 1],
  [0, 3.5, 3, 0.5],
];

interface Props {
  startups: MapStartup[];
  arcs: MapArc[];
  pins: MapPin[];
  mode: MapLayerMode;
  selectedId: string | null;
  focus: MapFocus | null;
  onSelect: (id: string | null) => void;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function markerElement(html: string, className: string, label: string) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.setAttribute("aria-label", label);
  el.innerHTML = html;
  return el;
}

export default function OutcomeMap({ startups, arcs, pins, mode, selectedId, focus, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibre.Map | null>(null);
  const markersRef = useRef<maplibre.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibre.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: ASEAN_VIEW.center,
      zoom: ASEAN_VIEW.zoom,
      minZoom: 2,
      maxZoom: 15,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource(ARC_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "arcs-line",
        type: "line",
        source: ARC_SOURCE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["min", 6, ["+", 1.5, ["*", 0.6, ["get", "count"]]]],
          "line-opacity": 0.55,
        },
      });
      map.addLayer({
        id: "arcs-flow",
        type: "line",
        source: ARC_SOURCE,
        layout: { "line-cap": "butt", "visibility": "none" },
        paint: { "line-color": "#ffffff", "line-width": 1.6, "line-opacity": 0.9, "line-dasharray": DASH_FRAMES[0] },
      });
      setReady(true);
    });
    mapRef.current = map;

    let frame = 0;
    let last = 0;
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (time: number) => {
      if (!reduced && map.getLayer("arcs-flow") && time - last > 60) {
        frame = (frame + 1) % DASH_FRAMES.length;
        map.setPaintProperty("arcs-flow", "line-dasharray", DASH_FRAMES[frame]);
        last = time;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const source = map.getSource(ARC_SOURCE) as maplibre.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: arcs.map((arc) => ({
        type: "Feature",
        properties: { id: arc.id, startupId: arc.startupId, color: arc.color, count: arc.count },
        geometry: { type: "LineString", coordinates: arc.coordinates },
      })),
    });
  }, [arcs, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const showArcs = mode === "outcomes";
    map.setLayoutProperty("arcs-line", "visibility", showArcs ? "visible" : "none");
    map.setLayoutProperty("arcs-flow", "visibility", showArcs && selectedId !== null ? "visible" : "none");
    map.setPaintProperty("arcs-line", "line-opacity", selectedId !== null ? 0.9 : 0.5);
    map.setPaintProperty(
      "arcs-line",
      "line-width",
      selectedId !== null ? ["+", 3, ["*", 0.8, ["get", "count"]]] : ["min", 6, ["+", 1.5, ["*", 0.6, ["get", "count"]]]],
    );
  }, [mode, selectedId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (mode === "outcomes") {
      startups.forEach((startup, i) => {
        const selected = startup.id === selectedId;
        const html = renderToStaticMarkup(<CompanyLogo id={startup.id} name={startup.name} size={selected ? 46 : 38} />);
        const el = markerElement(
          `${startup.isCurrent ? '<span class="map-pulse"></span>' : ""}${html}<span class="map-tag">${escapeHtml(startup.name)}</span>`,
          `map-marker ${selected ? "is-selected" : ""} ${startup.isCurrent ? "is-current" : ""}`,
          `${startup.name}, ${startup.country}`,
        );
        el.style.animationDelay = `${i * 70}ms`;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(selected ? null : startup.id);
        });
        markersRef.current.push(new maplibre.Marker({ element: el, anchor: "center" }).setLngLat(startup.position).addTo(map));
      });
    } else {
      pins.forEach((pin, i) => {
        const el = markerElement(
          `<span class="map-pin-dot ${pin.kind === "luma" ? "is-luma" : ""}"></span>`,
          "map-marker map-pin",
          pin.name,
        );
        el.style.animationDelay = `${i * 40}ms`;
        const popup = new maplibre.Popup({ offset: 16, closeButton: false, className: "map-popup" }).setHTML(
          `<strong>${escapeHtml(pin.name)}</strong><span>${escapeHtml(pin.subtitle)}</span>`,
        );
        markersRef.current.push(
          new maplibre.Marker({ element: el, anchor: "center" }).setLngLat(pin.position).setPopup(popup).addTo(map),
        );
      });
    }
  }, [startups, pins, mode, selectedId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedId || arcs.length === 0) return;
    const bounds = new maplibre.LngLatBounds();
    arcs.forEach((arc) => arc.coordinates.forEach((point) => bounds.extend(point)));
    map.fitBounds(bounds, { padding: 90, maxZoom: 6.5, duration: 900 });
    // Re-fit only when the selection changes, not when the type filter reshuffles arcs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focus) return;
    map.flyTo({ center: focus.position, zoom: focus.zoom, speed: 0.9, curve: 1.5, essential: false });
  }, [focus, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const clear = () => onSelectRef.current(null);
    map.on("click", clear);
    return () => {
      map.off("click", clear);
    };
  }, [ready]);

  return <div ref={containerRef} className="size-full" role="region" aria-label="Map of ASEAN startups, cross-border outcomes and events" />;
}
