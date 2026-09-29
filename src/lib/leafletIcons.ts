import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// L.Icon.Default._getIconUrl always prepends its auto-detected imagePath
// to options.*Url, even when we've already given it fully-resolved bundler
// URLs below — producing a doubled-up path. Deleting the override falls
// back to the base Icon._getIconUrl, which just returns options.*Url as-is.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
