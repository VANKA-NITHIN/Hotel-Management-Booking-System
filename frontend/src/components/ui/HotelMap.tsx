import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Hotel } from '../../types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

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

// Custom animated marker using standard Leaflet DivIcon
const customMarkerHtml = `
  <div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-50 animate-ping"></div>
    <div class="relative flex items-center justify-center w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  </div>
`;

const CustomDivIcon = L.divIcon({
  html: customMarkerHtml,
  className: 'custom-hotel-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface HotelMapProps {
  hotels: Hotel[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Helper component to recenter map when bounds change
function MapUpdater({ hotels, center }: { hotels: Hotel[], center?: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    } else if (hotels.length > 0) {
      // Find bounds of all hotels
      const lats = hotels.map(h => h.latitude).filter(Boolean) as number[];
      const lngs = hotels.map(h => h.longitude).filter(Boolean) as number[];
      
      if (lats.length > 0 && lngs.length > 0) {
        const bounds = L.latLngBounds(
          L.latLng(Math.min(...lats), Math.min(...lngs)),
          L.latLng(Math.max(...lats), Math.max(...lngs))
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [hotels, center, map]);

  return null;
}

export function HotelMap({ hotels, center = [20, 0], zoom = 2, className = "h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200" }: HotelMapProps) {
  const navigate = useNavigate();

  // Filter out hotels without coordinates
  const validHotels = hotels.filter(h => h.latitude && h.longitude);

  return (
    <div className={className}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater hotels={validHotels} center={validHotels.length === 0 ? center : undefined} />
        
        {validHotels.map(hotel => (
          <Marker 
            key={hotel.id} 
            position={[hotel.latitude!, hotel.longitude!]}
            icon={CustomDivIcon}
          >
            <Popup className="hotel-popup">
              <div className="w-48 overflow-hidden rounded-lg pb-1">
                <img 
                  src={hotel.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop'} 
                  alt={hotel.name}
                  className="w-full h-24 object-cover rounded-t-lg"
                />
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{hotel.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{hotel.city}, {hotel.country}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium ml-1">{hotel.rating}</span>
                      <span className="text-xs text-gray-400 ml-1">({hotel.totalReviews})</span>
                    </div>
                    <div className="font-bold text-blue-600 text-sm">
                      ${hotel.startingPrice.toFixed(0)}<span className="text-xs text-gray-400 font-normal">/nt</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
