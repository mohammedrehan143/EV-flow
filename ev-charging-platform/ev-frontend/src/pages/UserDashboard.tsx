import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zap, Navigation, Search, CheckCircle2, XCircle } from 'lucide-react';
import { gsap } from 'gsap';
import Magnetic from '../components/Magnetic';

// Sub-component to safely access and expose Leaflet map instance
const MapController = ({ setMapInstance }: { setMapInstance: (map: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
};

// High-visibility Custom Icon for EV Centers with Pulse Effect
const evIcon = L.divIcon({
  className: 'custom-ev-icon',
  html: `
    <div class="w-12 h-12 relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-primary/40 rounded-full animate-ping"></div>
      <div class="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_#00ff88] border-2 border-dark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="14" height="12" rx="2" ry="2" />
          <line x1="21" y1="11" x2="21" y2="13" />
          <path d="m11 8-3 4h4l-3 4" fill="#050505" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Custom User Location Icon (Pulsing Blue Dot)
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="w-8 h-8 relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-secondary/30 rounded-full animate-ping"></div>
      <div class="relative w-4 h-4 bg-secondary rounded-full border-2 border-white shadow-[0_0_10px_#00bfff]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const center: [number, number] = [12.9716, 77.5946];
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserDashboard = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    fetchStations();
    getUserLocation();
    
    // Simpler animation to avoid visibility lock
    gsap.from(".dashboard-animate", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "all" // Ensures GSAP doesn't leave elements hidden
    });
  }, []);

  const fetchStations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/stations`);
      setStations(res.data);
    } catch (err) {
      console.error("Error fetching stations", err);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (err) => {
        console.warn("Location access denied", err);
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleBook = async (stationId: number, slotId: number) => {
    if (!userLocation) {
      setBookingMessage("ERROR: Please enable location to book.");
      return;
    }

    const station = stations.find(s => s.id === stationId);
    const distance = calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng);

    // Strict 2km check
    if (distance > 2) {
      setBookingMessage(`RESTRICTED: You are too far (${distance.toFixed(1)}km). Booking only allowed within 2km.`);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/bookings`, { stationId, slotId, userId: 'user123' });
      setBookingMessage("SUCCESS: Reservation confirmed!");
      fetchStations();
      setSelectedStation(null);
    } catch (err: any) {
      setBookingMessage("FAILED: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const deployTestStation = async () => {
    if (!userLocation) {
      alert("Enable location first to deploy a test node at your position.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/stations/debug`, {
        lat: userLocation.lat,
        lng: userLocation.lng,
        name: "DEBUG: Local Node"
      });
      fetchStations();
      setBookingMessage("SUCCESS: Test node deployed at your location.");
    } catch (err) {
      console.error("Debug deployment failed", err);
    }
  };

  useEffect(() => {
    if (!mapInstance || stations.length === 0) return;

    if (stations.length === 1) {
      mapInstance.setView([stations[0].lat, stations[0].lng], 13);
      return;
    }

    const bounds = L.latLngBounds(stations.map((station) => [station.lat, station.lng]));
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    mapInstance.fitBounds(bounds, { padding: [60, 60] });
  }, [mapInstance, stations, userLocation]);

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-20 max-w-[1600px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col xl:flex-row gap-6 md:gap-10">
        {/* Sidebar */}
        <div className="w-full xl:w-[450px] space-y-6 sm:space-y-8 order-2 xl:order-1">
          <div className="dashboard-animate">
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter mb-2 italic">GRID INTERFACE</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Distance-Locked Booking System (2km Limit)</p>
          </div>

          <div className="dashboard-animate relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition" />
            <form className="relative flex glass rounded-2xl overflow-hidden">
              <input 
                type="text" 
                placeholder="Search EV Centers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-6 py-4 outline-none text-sm font-medium"
              />
              <button className="px-6 bg-white/5 hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5 text-primary" />
              </button>
            </form>
          </div>

          {selectedStation ? (
            <div className="dashboard-animate glass rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 space-y-6 sm:space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2">{selectedStation.name}</h3>
                  {userLocation && (
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest">
                      Distance: {calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng).toFixed(2)} km
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${
                  userLocation && calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) <= 2 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-red-500/20 text-red-500'
                }`}>
                  {userLocation && calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) <= 2 
                    ? <CheckCircle2 className="w-6 h-6" /> 
                    : <XCircle className="w-6 h-6" />
                  }
                </div>
              </div>

              <div className="space-y-4">
                {selectedStation.slots.map((slot: any) => (
                  <div key={slot.id} className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
                    slot.status === 'empty' ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-transparent opacity-40 grayscale'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Zap className={`w-5 h-5 ${slot.status === 'empty' ? 'text-primary' : 'text-white/20'}`} />
                        <span className="font-black text-xs uppercase tracking-[0.2em]">{slot.type} • {slot.power}</span>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                        slot.status === 'empty' ? 'bg-primary text-dark' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    {slot.status === 'empty' && (
                      <Magnetic>
                        <button 
                          onClick={() => handleBook(selectedStation.id, slot.id)}
                          disabled={!userLocation || calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) > 2}
                          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                            userLocation && calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) <= 2
                            ? 'bg-primary text-dark hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,255,136,0.3)]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          {userLocation && calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) <= 2 
                            ? 'Initiate Booking' 
                            : 'Out of Range (2km Limit)'}
                        </button>
                      </Magnetic>
                    )}
                  </div>
                ))}
              </div>

              {bookingMessage && (
                <div className={`p-5 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] border ${
                  bookingMessage.includes("SUCCESS") ? "bg-primary/10 border-primary/20 text-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {bookingMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="dashboard-animate glass rounded-[1.5rem] sm:rounded-[3rem] p-8 sm:p-16 text-center border-dashed border-white/10">
              <Navigation className="w-12 h-12 text-white/10 mx-auto mb-6 animate-pulse" />
              <h4 className="text-xl font-black tracking-tight mb-2 uppercase">Awaiting Selection</h4>
              <p className="text-white/30 text-[10px] font-black leading-relaxed uppercase tracking-widest">Select an active EV node on the map to view infrastructure details.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 order-1 xl:order-2 dashboard-animate">
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] xl:h-[800px] glass rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden">
            <MapContainer center={center} zoom={13} className="h-full w-full">
              <MapController setMapInstance={setMapInstance} />
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {stations.map(station => (
                <Marker 
                  key={station.id} 
                  position={[station.lat, station.lng]} 
                  icon={evIcon}
                  eventHandlers={{ click: () => setSelectedStation(station) }}
                >
                  <Popup>
                    <div className="p-2 text-center">
                      <h3 className="font-black text-sm uppercase mb-1">{station.name}</h3>
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.15em] mb-3">
                        {station.slots.filter((s: any) => s.status === 'empty').length} / {station.slots.length} Slots Free
                      </p>
                      <button 
                        onClick={() => setSelectedStation(station)}
                        className="bg-primary text-dark font-black text-[9px] px-4 py-2 rounded-full uppercase tracking-widest"
                      >
                        Interface Node
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>User Position</Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Range Overlay Info */}
            <div className="absolute top-4 left-4 sm:top-10 sm:left-10 z-10 space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 glass rounded-xl sm:rounded-2xl border-primary/30 flex items-center gap-3 sm:gap-4">
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_#00ff88]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Grid Scan: 2km Range Active</span>
              </div>
              
              <button 
                onClick={deployTestStation}
                className="group flex items-center gap-3 p-4 glass rounded-2xl border-white/10 hover:border-primary/50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-dark transition-colors">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest">Deploy Test Node</p>
                  <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Instant Local Station</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
