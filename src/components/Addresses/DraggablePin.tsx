import { Marker, useMapEvents } from "react-leaflet";

interface Props {
  position: [number, number];
  onMove: (pos: [number, number]) => void;
}

export function DraggablePin({ position, onMove }: Props) {
  useMapEvents({
    click(e) {
      onMove([e.latlng.lat, e.latlng.lng]);
    },
  });
  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onMove([pos.lat, pos.lng]);
        },
      }}
    />
  );
}
