import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zap, CheckCircle2, XCircle, ArrowLeft, ChevronRight, MapPin, Clock, Car, User, X } from 'lucide-react';
import { gsap } from 'gsap';
import Magnetic from '../components/Magnetic';
import { API_BASE } from '../config';

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
    <div class="ev-marker-wrapper">
      <div class="ev-marker-ping"></div>
      <div class="ev-marker-core">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    <div class="user-marker-wrapper">
      <div class="user-marker-ping"></div>
      <div class="user-marker-core"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const center: [number, number] = [12.9716, 77.5946];

interface ActiveBooking {
  stationId: number;
  slotId: number;
  stationName: string;
  userName: string;
  vehicleNumber: string;
  remainingSeconds: number;
  bookingId: string;
}

const UserDashboard = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // Booking modal and vehicle details states
  const [bookingModalSlot, setBookingModalSlot] = useState<{ stationId: number; slotId: number } | null>(null);
  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [inputError, setInputError] = useState("");

  // Active reservation with 10-min countdown timer
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStations();
    getUserLocation();
    
    gsap.from(".dashboard-animate", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "all"
    });
  }, []);

  // Countdown timer effect for 10-minute hold
  useEffect(() => {
    if (!activeBooking || activeBooking.remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setActiveBooking(prev => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          // Timer expired -> auto cancel booking
          handleCancelBooking(prev.stationId, prev.slotId, true);
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBooking]);

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

  const deployTestStation = async () => {
    if (!userLocation) {
      alert("Enable location first to deploy a test node at your position.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/stations/debug`, {
        lat: userLocation.lat,
        lng: userLocation.lng,
        name: "DEBUG: Local Node"
      });
      await fetchStations();
      if (res.data?.station) {
        handleSelectStation(res.data.station);
      }
      setBookingMessage("SUCCESS: Test node deployed at your location.");
    } catch (err) {
      console.error("Debug deployment failed", err);
    }
  };

  const handleSelectStation = (station: any) => {
    setSelectedStation(station);
    setBookingMessage("");
    if (mapInstance && station) {
      mapInstance.setView([station.lat, station.lng], 15, { animate: true });
    }
    if (sidebarRef.current) {
      sidebarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openBookingModal = (stationId: number, slotId: number) => {
    if (!userLocation) {
      setBookingMessage("ERROR: Please enable location to book.");
      return;
    }

    const station = stations.find(s => s.id === stationId);
    const distance = calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng);

    // Strict 2km distance check
    if (distance > 2) {
      setBookingMessage(`RESTRICTED: You are too far (${distance.toFixed(1)}km). Booking is only allowed within 2km.`);
      return;
    }

    setBookingModalSlot({ stationId, slotId });
    setDriverName("");
    setVehicleNumber("");
    setInputError("");
  };

  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalSlot) return;

    if (!driverName.trim()) {
      setInputError("Please enter your name.");
      return;
    }
    if (!vehicleNumber.trim()) {
      setInputError("Please enter your vehicle number.");
      return;
    }

    const { stationId, slotId } = bookingModalSlot;
    const station = stations.find(s => s.id === stationId);

    try {
      const res = await axios.post(`${API_BASE}/api/bookings`, {
        stationId,
        slotId,
        userName: driverName.trim(),
        vehicleNumber: vehicleNumber.trim()
      });

      // Activate 10-minute (600 seconds) reservation countdown
      setActiveBooking({
        stationId,
        slotId,
        stationName: station?.name || "Charging Station",
        userName: driverName.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        remainingSeconds: 600,
        bookingId: res.data.bookingId
      });

      setBookingModalSlot(null);
      setBookingMessage("SUCCESS: Slot reserved! 10-minute hold activated.");
      fetchStations();
    } catch (err: any) {
      setInputError(err.response?.data?.error || "Failed to confirm reservation.");
    }
  };

  const handleCancelBooking = async (stationId: number, slotId: number, isExpired: boolean = false) => {
    try {
      await axios.post(`${API_BASE}/api/bookings/cancel`, { stationId, slotId });
      setActiveBooking(null);
      fetchStations();
      if (isExpired) {
        setBookingMessage("RESERVATION EXPIRED: 10-minute hold elapsed. Slot released.");
      } else {
        setBookingMessage("SUCCESS: Booking cancelled and slot released.");
      }
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!mapInstance || stations.length === 0 || selectedStation) return;

    const bounds = L.latLngBounds(stations.map((station) => [station.lat, station.lng]));
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    mapInstance.fitBounds(bounds, { padding: [60, 60] });
  }, [mapInstance, stations, userLocation, selectedStation]);

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-20 max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Booking Form Modal Overlay */}
      {bookingModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md glass rounded-[2rem] p-6 sm:p-8 space-y-6 relative border border-primary/30 shadow-[0_0_50px_rgba(0,255,136,0.15)] animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setBookingModalSlot(null)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-black italic uppercase">Initiate Reservation</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                  10-Minute Hold Period Active
                </p>
              </div>
            </div>

            <form onSubmit={confirmBooking} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Your Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 block flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-secondary" /> Vehicle Registration Number
                </label>
                <input 
                  type="text"
                  placeholder="e.g. KA 04 EV 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-black tracking-widest uppercase text-white outline-none focus:border-secondary transition-colors"
                  required
                />
              </div>

              {inputError && (
                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {inputError}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setBookingModalSlot(null)}
                  className="flex-1 py-4 glass rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-primary text-dark font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 md:gap-10">
        {/* Sidebar */}
        <div ref={sidebarRef} className="w-full xl:w-[480px] space-y-6 sm:space-y-8 order-2 xl:order-1 scroll-mt-28">
          <div className="dashboard-animate">
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter mb-2 italic">GRID INTERFACE</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Distance-Locked Booking System (2km Limit)</p>
          </div>

          {/* Active Booking Live 10-Min Timer Card */}
          {activeBooking && (
            <div className="dashboard-animate glass rounded-[1.5rem] p-6 space-y-4 border-2 border-primary/50 relative overflow-hidden bg-primary/5 shadow-[0_0_30px_rgba(0,255,136,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Active Slot Hold (10-Min Limit)
                </div>
                <span className="text-[10px] font-mono font-bold text-white/50">ID: {activeBooking.bookingId}</span>
              </div>

              <div>
                <h4 className="font-black text-lg text-white">{activeBooking.stationName}</h4>
                <p className="text-white/50 text-xs font-medium">
                  Driver: <span className="text-white font-bold">{activeBooking.userName}</span> • Vehicle: <span className="text-primary font-black uppercase">{activeBooking.vehicleNumber}</span>
                </p>
              </div>

              {/* Large Timer Display */}
              <div className="flex flex-col items-center justify-center p-4 bg-dark/60 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 text-4xl sm:text-5xl font-mono font-black text-primary tracking-wider">
                  <Clock className="w-8 h-8 animate-pulse text-primary" />
                  {formatTimer(activeBooking.remainingSeconds)}
                </div>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-2">
                  Remaining until automatic slot cancellation
                </p>
              </div>

              {/* Cancel Booking Button under the Timer */}
              <button 
                onClick={() => handleCancelBooking(activeBooking.stationId, activeBooking.slotId, false)}
                className="w-full py-3.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Cancel Booking
              </button>
            </div>
          )}

          {selectedStation ? (
            <div className="dashboard-animate glass rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 space-y-6 sm:space-y-8 relative overflow-hidden">
              <button 
                onClick={() => setSelectedStation(null)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to station grid
              </button>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-2">{selectedStation.name}</h3>
                  {userLocation ? (
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Distance: {calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng).toFixed(2)} km
                    </p>
                  ) : (
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Enable location to check range</p>
                  )}
                </div>
                <div className={`p-4 rounded-2xl shrink-0 ${
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
                    slot.status === 'empty' ? 'bg-white/5 border-white/10 hover:border-primary/40' : 'bg-red-500/5 border-transparent opacity-40 grayscale'
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
                          onClick={() => openBookingModal(selectedStation.id, slot.id)}
                          disabled={!userLocation || calculateDistance(userLocation.lat, userLocation.lng, selectedStation.lat, selectedStation.lng) > 2}
                          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer ${
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
                  bookingMessage.includes("SUCCESS") 
                    ? "bg-primary/10 border-primary/20 text-primary" 
                    : bookingMessage.includes("EXPIRED") 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {bookingMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="dashboard-animate space-y-4">
              <div className="px-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Nodes ({stations.length})</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Click any station to view</span>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {stations.map(station => {
                  const freeCount = station.slots ? station.slots.filter((s: any) => s.status === 'empty').length : 0;
                  const totalCount = station.slots ? station.slots.length : 0;
                  const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng) : null;
                  const inRange = distance !== null && distance <= 2;

                  return (
                    <div 
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className="p-5 glass rounded-2xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer group flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{station.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-white/50 font-bold uppercase tracking-widest">
                          <span className="text-primary">{freeCount} / {totalCount} Slots Free</span>
                          {distance !== null && (
                            <span className={inRange ? "text-primary" : "text-white/30"}>
                              • {distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-dark flex items-center justify-center transition-colors shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  eventHandlers={{ click: () => handleSelectStation(station) }}
                >
                  <Popup>
                    <div className="p-2 text-center">
                      <h3 className="font-black text-sm uppercase mb-1">{station.name}</h3>
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.15em] mb-3">
                        {station.slots.filter((s: any) => s.status === 'empty').length} / {station.slots.length} Slots Free
                      </p>
                      <button 
                        onClick={() => handleSelectStation(station)}
                        className="bg-primary text-dark font-black text-[9px] px-4 py-2 rounded-full uppercase tracking-widest cursor-pointer"
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
                className="group flex items-center gap-3 p-4 glass rounded-2xl border-white/10 hover:border-primary/50 transition-all cursor-pointer"
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
