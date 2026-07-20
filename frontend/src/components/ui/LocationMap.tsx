import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Hotel } from '../../types';
import type { POI, POICategory } from '../../api/overpass';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom animated marker for the Hotel
const hotelMarkerHtml = `
  <div class="relative flex items-center justify-center w-10 h-10">
    <div class="absolute w-full h-full bg-primary rounded-full opacity-40 animate-ping"></div>
    <div class="relative flex items-center justify-center w-8 h-8 bg-primary border-2 border-white rounded-full shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>
  </div>
`;

const HotelDivIcon = L.divIcon({
  html: hotelMarkerHtml,
  className: 'hotel-primary-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Helper for POI icons
const getPOIIconHTML = (category: POICategory) => {
  let emoji = '📍';
  let color = 'bg-gray-500';
  
  switch (category) {
    case 'restaurant': emoji = '🍽️'; color = 'bg-orange-500'; break;
    case 'attraction': emoji = '📸'; color = 'bg-purple-500'; break;
    case 'hospital': emoji = '🏥'; color = 'bg-red-500'; break;
    case 'atm': emoji = '🏧'; color = 'bg-green-500'; break;
    case 'shopping': emoji = '🛍️'; color = 'bg-pink-500'; break;
    case 'park': emoji = '🌳'; color = 'bg-emerald-500'; break;
  }

  return `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="relative flex items-center justify-center w-8 h-8 ${color} border-2 border-white rounded-full shadow-md text-sm">
        ${emoji}
      </div>
    </div>
  `;
};

const getPOIDivIcon = (category: POICategory) => L.divIcon({
  html: getPOIIconHTML(category),
  className: `poi-marker-${category}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationMapProps {
  hotel: Hotel;
  pois: POI[];
  zoom?: number;
  className?: string;
}

// Helper to recenter map and fit all markers
function MapBoundsUpdater({ hotel, pois }: { hotel: Hotel, pois: POI[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (hotel.latitude && hotel.longitude) {
      if (pois.length > 0) {
        const lats = [hotel.latitude, ...pois.map(p => p.lat)];
        const lngs = [hotel.longitude, ...pois.map(p => p.lon)];
        
        const bounds = L.latLngBounds(
          L.latLng(Math.min(...lats), Math.min(...lngs)),
          L.latLng(Math.max(...lats), Math.max(...lngs))
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView([hotel.latitude, hotel.longitude], 15);
      }
    }
  }, [hotel, pois, map]);

  return null;
}

export function LocationMap({ hotel, pois, zoom = 15, className = "h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-border-base" }: LocationMapProps) {
  if (!hotel.latitude || !hotel.longitude) {
    return (
      <div className={`${className} bg-bg-surface-hover flex items-center justify-center`}>
        <p className="text-text-muted">Map coordinates not available for this property.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer 
        center={[hotel.latitude, hotel.longitude]} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater hotel={hotel} pois={pois} />
        
        {/* The Hotel Marker */}
        <Marker 
          position={[hotel.latitude, hotel.longitude]}
          icon={HotelDivIcon}
          zIndexOffset={1000}
        >
          <Popup className="hotel-popup">
            <div className="font-bold text-base mb-1">{hotel.name}</div>
            <div className="text-sm text-text-muted">Your destination</div>
          </Popup>
        </Marker>

        {/* POI Markers */}
        {pois.map(poi => (
          <Marker 
            key={poi.id}
            position={[poi.lat, poi.lon]}
            icon={getPOIDivIcon(poi.category)}
          >
            <Popup>
              <div className="font-semibold">{poi.name}</div>
              <div className="text-xs text-text-muted capitalize mt-1">{poi.category}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
