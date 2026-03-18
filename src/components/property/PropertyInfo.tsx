import { BedDouble, Bath, Maximize2, MapPin, Calendar, Building, Car, Droplets, UtensilsCrossed, Navigation } from 'lucide-react';
import type { Property } from '@/types';

const AMENITY_LABELS: Record<string, string> = {
  parking: '🚗 Parking', wifi: '📶 WiFi', generator: '⚡ Generator',
  water_tank: '💧 Water Tank', security: '💂 Security', cctv: '📹 CCTV',
  gym: '🏋️ Gym', pool: '🏊 Pool', elevator: '🛗 Elevator',
  furnished: '🛋️ Furnished', ac: '❄️ A/C', solar: '☀️ Solar',
  garden: '🌿 Garden', balcony: '🏠 Balcony',
};

export function PropertyInfo({ property }: { property: Property }) {
  return (
    <div style={{display:"grid",gap:"1.5rem"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.75rem"}}>
        {property.bedrooms && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <BedDouble style={{width:16,height:16,color:"#6b7280"}} />{property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}
          </div>
        )}
        {property.bathrooms && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Bath style={{width:16,height:16,color:"#6b7280"}} />{property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}
            {property.bathroom_type && <span style={{fontSize:"0.75rem",color:"#9ca3af"}}>({property.bathroom_type})</span>}
          </div>
        )}
        {property.area_sqm && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Maximize2 style={{width:16,height:16,color:"#6b7280"}} />{property.area_sqm} m² house
          </div>
        )}
        {property.plot_area_sqm && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Maximize2 style={{width:16,height:16,color:"#6b7280"}} />{property.plot_area_sqm} m² plot
          </div>
        )}
        {property.floor && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Building style={{width:16,height:16,color:"#6b7280"}} />Floor {property.floor}{property.total_floors ? ` of ${property.total_floors}` : ''}
          </div>
        )}
        {property.year_built && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Calendar style={{width:16,height:16,color:"#6b7280"}} />Built {property.year_built}
          </div>
        )}
        {property.parking_spaces ? (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Car style={{width:16,height:16,color:"#6b7280"}} />{property.parking_spaces} Parking space{property.parking_spaces > 1 ? 's' : ''}
          </div>
        ) : null}
        {property.distance_to_road_m && (
          <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
            <Navigation style={{width:16,height:16,color:"#6b7280"}} />{property.distance_to_road_m}m from main road
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0",fontSize:"0.875rem",color:"#374151"}}>
          <MapPin style={{width:16,height:16,color:"#6b7280"}} />{property.location_name}
        </div>
      </div>

      {(property.ground_water || property.water_tanker) && (
        <div>
          <h3 style={{fontWeight:"700",fontSize:"1.1rem",color:"#111827",marginBottom:"0.75rem"}}>💧 Water Supply</h3>
          <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
            {property.ground_water && (
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"12px 18px",background:"#ecfdf5",borderRadius:"10px",border:"1px solid #6ee7b7"}}>
                <Droplets style={{width:18,height:18,color:"#059669"}} />
                <div>
                  <div style={{fontWeight:"700",fontSize:"0.875rem",color:"#065f46"}}>Ground Water Available</div>
                  <div style={{fontSize:"0.75rem",color:"#047857"}}>Borehole/well on site ⭐ Desirable</div>
                </div>
              </div>
            )}
            {property.water_tanker && (
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"12px 18px",background:"#eff6ff",borderRadius:"10px",border:"1px solid #93c5fd"}}>
                <Droplets style={{width:18,height:18,color:"#2563eb"}} />
                <div>
                  <div style={{fontWeight:"700",fontSize:"0.875rem",color:"#1e40af"}}>Water Tanker Access</div>
                  <div style={{fontSize:"0.75rem",color:"#1d4ed8"}}>Tanker delivery available ⭐ Desirable</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(property.kitchen_type || property.bathroom_type) && property.type === 'long_rent' && (
        <div>
          <h3 style={{fontWeight:"700",fontSize:"1.1rem",color:"#111827",marginBottom:"0.75rem"}}>🏠 Room Details</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",maxWidth:"400px"}}>
            {property.kitchen_type && property.kitchen_type !== 'none' && (
              <div style={{padding:"12px 16px",background:"#fafafa",borderRadius:"10px",border:"1px solid #e5e7eb"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
                  <UtensilsCrossed style={{width:15,height:15,color:"#6b7280"}} />
                  <span style={{fontSize:"0.75rem",fontWeight:"600",color:"#6b7280",textTransform:"uppercase"}}>Kitchen</span>
                </div>
                <div style={{fontSize:"0.95rem",fontWeight:"700",color:"#111827",textTransform:"capitalize"}}>{property.kitchen_type}</div>
              </div>
            )}
            {property.bathroom_type && (
              <div style={{padding:"12px 16px",background:"#fafafa",borderRadius:"10px",border:"1px solid #e5e7eb"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px"}}>
                  <Bath style={{width:15,height:15,color:"#6b7280"}} />
                  <span style={{fontSize:"0.75rem",fontWeight:"600",color:"#6b7280",textTransform:"uppercase"}}>Bathroom</span>
                </div>
                <div style={{fontSize:"0.95rem",fontWeight:"700",color:"#111827",textTransform:"capitalize"}}>{property.bathroom_type}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {property.description && (
        <div>
          <h3 style={{fontWeight:"700",fontSize:"1.1rem",color:"#111827",marginBottom:"0.5rem"}}>Description</h3>
          <p style={{color:"#4b5563",lineHeight:"1.7",fontSize:"0.95rem"}}>{property.description}</p>
        </div>
      )}

      {property.amenities?.length > 0 && (
        <div>
          <h3 style={{fontWeight:"700",fontSize:"1.1rem",color:"#111827",marginBottom:"0.75rem"}}>Amenities</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
            {property.amenities.map(a => (
              <span key={a} style={{padding:"6px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"8px",fontSize:"0.875rem",color:"#374151"}}>
                {AMENITY_LABELS[a] ?? a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
