import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "../../lib/leafletIcons";
import type { Ground } from "../../types";

interface Props {
  groundsWithVisits: { ground: Ground; visits: number }[];
}

export function GroundsMap({ groundsWithVisits }: Props) {
  if (groundsWithVisits.length === 0) {
    return <div className="empty-state">No grounds visited yet.</div>;
  }

  const points: [number, number][] = groundsWithVisits.map((g) => [
    g.ground.latitude,
    g.ground.longitude,
  ]);

  return (
    <div className="map-preview" style={{ height: "320px" }}>
      <MapContainer
        bounds={L.latLngBounds(points)}
        boundsOptions={{ padding: [24, 24] }}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groundsWithVisits.map(({ ground, visits }) => (
          <Marker key={ground.groundId} position={[ground.latitude, ground.longitude]}>
            <Popup>
              <strong>{ground.ground}</strong>
              <br />
              {visits} visit{visits === 1 ? "" : "s"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
