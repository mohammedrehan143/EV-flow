import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BatteryCharging, X } from 'lucide-react';
import Lenis from 'lenis';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomCursor from './components/CustomCursor';
import Magnetic from './components/Magnetic';
import AmbientBackground from './components/AmbientBackground';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-dark text-white selection:bg-primary selection:text-dark">
        <CustomCursor />
        <AmbientBackground />
        
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <BatteryCharging className="w-9 h-9 text-primary group-hover:rotate-12 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                </div>
                <span className="font-display font-black text-2xl tracking-tighter uppercase">
                  EV<span className="text-primary italic">FLOW</span>
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-10">
                <Link to="/user-dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Find Stations
                </Link>
                <Link to="/employee-dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-secondary transition-colors flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" /> Portal
                </Link>
                <Magnetic>
                  <Link to="/" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors inline-block">
                    <div className="w-5 h-5 bg-white/20 rounded-full" />
                  </Link>
                </Magnetic>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors relative z-50 active:scale-95 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-6 h-3.5 flex flex-col justify-between">
                    <div className="w-full h-0.5 bg-white rounded-full" />
                    <div className="w-3/4 h-0.5 bg-white rounded-full ml-auto" />
                    <div className="w-full h-0.5 bg-white rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu Overlay */}
        <div className={`fixed inset-0 z-40 bg-dark/95 backdrop-blur-2xl transition-all duration-500 md:hidden flex flex-col justify-center px-10 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="mesh-bg opacity-20" />
          <div className="space-y-8 text-left relative z-10">
            <Link 
              to="/user-dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-3xl font-display font-black tracking-tighter hover:text-primary transition-colors italic flex items-center gap-4 group"
            >
              <span className="text-primary text-xl font-medium">01 //</span> FIND STATIONS
            </Link>
            <Link 
              to="/employee-dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-3xl font-display font-black tracking-tighter hover:text-secondary transition-colors italic flex items-center gap-4 group"
            >
              <span className="text-secondary text-xl font-medium">02 //</span> PORTAL CLEARANCE
            </Link>
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-3xl font-display font-black tracking-tighter hover:text-accent transition-colors italic flex items-center gap-4 group"
            >
              <span className="text-accent text-xl font-medium">03 //</span> HOME EXPERIENCE
            </Link>
          </div>
          
          <div className="absolute bottom-10 left-10 right-10 flex justify-between border-t border-white/5 pt-6 text-[10px] font-black uppercase tracking-widest text-white/30 relative z-10">
            <span>EVFLOW v1.0</span>
            <span>© 2026</span>
          </div>
        </div>

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          </Routes>
        </main>

        <footer className="py-10 border-t border-white/5 relative overflow-hidden z-10">
          <div className="mesh-bg opacity-30" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="font-display text-[10vw] font-black tracking-tighter opacity-5 leading-none mb-6 select-none">
              EVFLOW
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
              <p className="text-white/40 text-sm tracking-widest">© 2026 EVFLOW DIGITAL EXPERIENCE</p>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Terms</a>
                <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
