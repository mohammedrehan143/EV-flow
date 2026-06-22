import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShieldCheck, RefreshCcw, Power, Activity, Layout, Lock, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import Magnetic from '../components/Magnetic';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EmployeeDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authorizedStationId, setAuthorizedStationId] = useState<number | 'ALL' | null>(null);
  const [authKey, setAuthKey] = useState('');

  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPasskeys, setNewPasskeys] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState('');

  const authContainerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      gsap.fromTo(".auth-animate", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" }
      );
    } else {
      fetchStations();
      gsap.fromTo(".employee-animate", 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "expo.out" }
      );
    }
  }, [isAuthenticated]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authKey.trim()) {
      setAuthError('ENTER ACCESS KEY');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/auth`, {
        passkey: authKey.trim()
      });
      setAuthorizedStationId(res.data.authorizedStationId);
      setIsAuthenticated(true);
      setStatusMessage('ACCESS GRANTED');
      
      gsap.to(authContainerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {}
      });
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'AUTHENTICATION FAILED');
      gsap.fromTo(".auth-input", 
        { x: -10 }, 
        { x: 10, duration: 0.1, yoyo: true, repeat: 3, ease: "sine.inOut", clearProps: "x" }
      );
    }
  };

  const fetchStations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/stations`);
      let data = res.data;
      if (authorizedStationId !== 'ALL' && authorizedStationId !== null) {
        data = data.filter((s: any) => s.id === authorizedStationId);
      }
      setStations(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stations", err);
      setLoading(false);
    }
  };

  const handlePasskeyUpdate = async (stationId: number) => {
    const newPasskey = newPasskeys[stationId]?.trim();
    if (!newPasskey) {
      setStatusMessage('ENTER A NEW PASSKEY');
      return;
    }

    if (!authKey.trim()) {
      setStatusMessage('AUTH KEY IS REQUIRED');
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/stations/${stationId}/passkey`, {
        newPasskey,
        authKey: authKey.trim()
      });
      setStatusMessage('PASSKEY UPDATED');
      setNewPasskeys((prev) => ({ ...prev, [stationId]: '' }));
      fetchStations();
    } catch (err: any) {
      setStatusMessage(err.response?.data?.error || 'UPDATE FAILED');
    }
  };

  const toggleStatus = async (stationId: number, slotId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'empty' ? 'full' : 'empty';
    try {
      await axios.put(`${API_BASE}/api/stations/${stationId}/slots/${slotId}`, {
        status: newStatus
      });
      fetchStations();
    } catch (err) {
      alert("System Override Failed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
        <div ref={authContainerRef} className="w-full max-w-md glass rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="auth-animate w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/10">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          
          <h2 className="auth-animate font-display text-3xl sm:text-4xl font-black tracking-tighter mb-2 italic">RESTRICTED</h2>
          <p className="auth-animate text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-8 sm:mb-10">
            Authorized Personnel Only
          </p>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="auth-animate relative">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2 block">Clearance Passkey</label>
              <input 
                type="password" 
                placeholder="ENTER ACCESS KEY OR ADMIN KEY" 
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                className="auth-input w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-4 sm:px-6 sm:py-5 text-center text-xs sm:text-sm font-black tracking-[0.2em] uppercase focus:outline-none focus:border-primary/50 transition-colors"
              />
              {authError && (
                <p className="absolute -bottom-5 left-0 w-full text-center text-red-500 text-[9px] font-black tracking-widest">
                  {authError}
                </p>
              )}
            </div>

            <div className="auth-animate pt-2">
              <Magnetic strength={0.2}>
                <button type="submit" className="w-full py-4 sm:py-5 bg-primary text-dark font-black text-xs uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-white transition-colors flex items-center justify-center gap-3 group">
                  Authenticate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Magnetic>
            </div>
          </form>

          <div className="auth-animate mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-white/10 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] space-y-2 text-left max-h-44 overflow-y-auto pr-2">
            <p>Enter your station's unique clearance passkey, or the master admin key for global access.</p>
            <p className="text-white/50">Admin key: <span className="text-primary">ADMIN123</span></p>
            <p className="text-white/40 mt-2 font-bold">Station Passkeys for Testing:</p>
            <ul className="list-disc pl-4 space-y-1 text-white/50">
              <li>Taj West End Charging Hub: <span className="text-secondary font-bold">TAJ123</span></li>
              <li>BESCOM KR Circle Station: <span className="text-secondary font-bold">BESCOM456</span></li>
              <li>UB City Charging Point: <span className="text-secondary font-bold">UBCITY789</span></li>
              <li>Croma Koramangala Station: <span className="text-secondary font-bold">CROMA000</span></li>
              <li>Phoenix Marketcity Station: <span className="text-secondary font-bold">PHOENIX555</span></li>
              <li>Electronic City EZ Charge: <span className="text-secondary font-bold">ECITY888</span></li>
              <li>Jayanagar 4th Block Node: <span className="text-secondary font-bold">JAYANAGAR222</span></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 md:pt-32 md:pb-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 md:mb-16 gap-6 md:gap-8 employee-animate">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Layout className="text-primary w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Infrastructure Management</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter italic">COMMAND CENTER</h2>
          {authorizedStationId !== 'ALL' && (
            <p className="text-primary mt-2 text-xs font-black uppercase tracking-widest">
              Limited Clearance: Station {authorizedStationId} Only
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Status</p>
            <p className="text-primary font-bold flex items-center gap-2 justify-start md:justify-end">
              <Activity className="w-3 h-3" /> STABLE
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Magnetic strength={0.2}>
              <button 
                onClick={fetchStations}
                className="p-4 sm:p-5 glass rounded-xl sm:rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <RefreshCcw className={`w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin text-primary' : ''}`} />
              </button>
            </Magnetic>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="p-4 sm:p-5 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
              title="Lock Terminal"
            >
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {statusMessage && (
          <div className="text-center py-4 employee-animate">
            <p className="text-sm font-black uppercase tracking-widest text-primary">{statusMessage}</p>
          </div>
        )}
        {stations.length === 0 ? (
          <div className="text-center py-20 employee-animate">
             <p className="text-white/40 font-black uppercase tracking-widest">NO STATIONS FOUND FOR THIS CLEARANCE.</p>
          </div>
        ) : (
          stations.map(station => (
            <div key={station.id} className="employee-animate group">
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl font-black text-white/5 font-display select-none">0{station.id}</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{station.name}</h3>
                </div>
                <div className="h-[1px] flex-1 bg-white/5 mx-4 sm:mx-10 hidden md:block" />
                <ShieldCheck className="text-white/20 w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {station.slots.map((slot: any) => (
                  <div 
                    key={slot.id}
                    className={`p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-700 relative overflow-hidden ${
                      slot.status === 'empty' 
                        ? 'glass border-primary/20 hover:border-primary/50' 
                        : 'bg-white/2 border-white/5 grayscale opacity-60'
                    }`}
                  >
                    {slot.status === 'empty' && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10" />
                    )}
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                          slot.status === 'empty' ? 'bg-primary text-dark' : 'bg-white/10 text-white/20'
                        }`}>
                          <Power className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <p className="font-black text-lg sm:text-xl tracking-tight">NODE {slot.id}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{slot.type} • {slot.power}</p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-4 pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                          slot.status === 'empty' ? 'text-primary' : 'text-red-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${slot.status === 'empty' ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
                          {slot.status}
                        </div>
                        <Magnetic strength={0.2}>
                          <button
                            onClick={() => toggleStatus(station.id, slot.id, slot.status)}
                            className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                              slot.status === 'empty'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
                                : 'bg-primary text-dark hover:bg-white hover:text-dark'
                            }`}
                          >
                            {slot.status === 'empty' ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </Magnetic>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-[1.5rem] glass border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">Update station passkey</p>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
                  <input
                    type="text"
                    placeholder="New station passkey"
                    value={newPasskeys[station.id] || ''}
                    onChange={(e) => setNewPasskeys((prev) => ({ ...prev, [station.id]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={() => handlePasskeyUpdate(station.id)}
                    className="px-6 py-4 rounded-xl bg-secondary text-dark font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    Save passkey
                  </button>
                </div>
                <p className="text-[9px] text-white/40 mt-3">Use your current station passkey or the admin key to confirm changes.</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
