import axios from 'axios';

export type POICategory = 'restaurant' | 'attraction' | 'hospital' | 'atm' | 'shopping' | 'park';

export interface POI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  category: POICategory;
  distance?: number;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const getQueryForCategory = (lat: number, lon: number, radius: number, category: POICategory): string => {
  let tags = '';
  switch (category) {
    case 'restaurant':
      tags = `["amenity"~"restaurant|cafe|fast_food"]`;
      break;
    case 'attraction':
      tags = `["tourism"~"attraction|museum|gallery|viewpoint"]`;
      break;
    case 'hospital':
      tags = `["amenity"="hospital"]`;
      break;
    case 'atm':
      tags = `["amenity"~"atm|bank"]`;
      break;
    case 'shopping':
      tags = `["shop"~"mall|supermarket|clothes|department_store"]`;
      break;
    case 'park':
      tags = `["leisure"="park"]`;
      break;
  }

  return `
    [out:json][timeout:25];
    (
      node${tags}(around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;
};

export const fetchNearbyPOIs = async (lat: number, lon: number, category: POICategory, radius = 2000): Promise<POI[]> => {
  try {
    const query = getQueryForCategory(lat, lon, radius, category);
    
    // We use a POST request with the query as form data, which is standard for Overpass
    const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const elements = response.data?.elements || [];
    
    return elements
      .filter((el: any) => el.type === 'node' && el.tags && el.tags.name)
      .map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name,
        category: category
      }));
  } catch (error) {
    console.error(`Error fetching ${category} POIs:`, error);
    return [];
  }
};
