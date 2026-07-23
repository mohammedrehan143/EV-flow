import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Zap, Battery, Globe, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Magnetic from '../components/Magnetic';
import { API_BASE } from '../config';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featureRef = useRef(null);
  const [hitsToday, setHitsToday] = useState<number>(184);
  const [totalHits, setTotalHits] = useState<number>(14280);

  useEffect(() => {
    // Record page access hit
    axios.post(`${API_BASE}/api/hits/increment`)
      .then(res => {
        if (res.data) {
          setHitsToday(res.data.hitsToday || 184);
          setTotalHits(res.data.totalHits || 14280);
        }
      })
      .catch(() => {
        // Fallback hit increment if offline
        setHitsToday(prev => prev + 1);
        setTotalHits(prev => prev + 1);
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const tl = gsap.timeline();
      tl.from(".hero-title .char", {
        y: 100,
        rotate: 10,
        opacity: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "expo.out"
      })
      .from(".hero-sub", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      }, "-=1")
      .from(".hero-cta", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
      }, "-=0.8");

      // Floating ambient elements
      gsap.to(".floating-node", {
        y: -30,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5
      });

      // Section Reveals
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section, {
          y: 100,
          opacity: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });
      });

      // Feature Cards Parallax
      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: featureRef.current,
          start: "top 75%"
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Split text helper
  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block whitespace-pre">
        {char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="relative z-10 overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="mesh-bg opacity-30 scale-150 -z-10" />
        
        {/* Ambient Floating Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl floating-node" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl floating-node" />
        
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-bright text-[10px] font-black uppercase tracking-[0.3em] mb-8 hero-sub">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            The Evolution of Infrastructure
          </div>
          
          <h1 className="hero-title font-display text-5xl sm:text-7xl md:text-[10vw] font-black leading-[0.85] tracking-tighter mb-6 sm:mb-10 overflow-hidden">
            {splitText("EMPOWER")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              {splitText("THE DRIVE")}
            </span>
          </h1>
          
          <p className="hero-sub text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-8 sm:mb-12 leading-relaxed">
            Architecting the global charging grid with hyper-intelligence and cinematic design. Experience the future of mobility.
          </p>
          
          <div className="hero-cta flex flex-wrap justify-center gap-6">
            <Magnetic strength={0.3}>
              <Link 
                to="/user-dashboard"
                className="group relative px-10 py-5 bg-primary text-dark font-black rounded-full overflow-hidden flex items-center gap-3 transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 uppercase tracking-widest text-xs">Begin Exploration</span>
                <ArrowUpRight className="relative z-10 w-5 h-5 group-hover:rotate-45 transition-transform" />
              </Link>
            </Magnetic>
            
            <Magnetic strength={0.3}>
              <Link 
                to="/employee-dashboard"
                className="px-10 py-5 glass hover:bg-white/5 font-black rounded-full text-xs uppercase tracking-widest transition-all"
              >
                Control Center
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-[1px] h-20 bg-gradient-to-b from-primary to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr]">Scroll</span>
        </div>
      </section>

      {/* Stats / Numbers Section */}
      <section className="py-10 md:py-16 relative reveal-section">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StatBox number="20" label="Active Stations" />
          <StatBox number="99.9%" label="Uptime Grid" />
          <StatBox number={hitsToday.toLocaleString()} label="Page Hits Today" />
          <StatBox number={totalHits.toLocaleString()} label="Total Page Hits" />
        </div>
      </section>

      {/* Features Section */}
      <section ref={featureRef} className="pt-10 pb-2 md:pt-16 md:pb-4 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
                INTELLIGENT<br /><span className="text-white/20 italic">INFRASTRUCTURE.</span>
              </h2>
              <p className="text-white/40 text-base leading-relaxed">
                We've combined deep learning with electrical engineering to create a grid that thinks ahead.
              </p>
            </div>
            <div className="w-20 h-[1px] bg-primary hidden md:block mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Cpu className="text-primary w-8 h-8" />}
              title="Neural Grid"
              description="Predictive load balancing that ensures peak performance during high-demand windows."
              tag="AI DRIVEN"
            />
            <FeatureCard 
              icon={<Globe className="text-secondary w-8 h-8" />}
              title="Global Reach"
              description="A borderless network of charging points connected through our high-speed satellite relay."
              tag="NETWORK"
            />
            <FeatureCard 
              icon={<Zap className="text-accent w-8 h-8" />}
              title="HyperVolt"
              description="Next-generation liquid-cooled cabling delivering charge at the speed of thought."
              tag="HARDWARE"
            />
          </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="pt-2 pb-12 md:pt-4 md:pb-20 relative reveal-section">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="font-display text-3xl md:text-5xl font-black mb-10 leading-tight tracking-tight">
            "THE FUTURE OF MOBILITY IS NOT JUST ELECTRIC. <span className="text-primary">IT'S CONNECTED.</span>"
          </h3>
          <div className="flex justify-center">
            <Magnetic>
              <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group hover:border-primary/50 transition-colors">
                <Battery className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors animate-pulse" />
              </div>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatBox = ({ number, label }: { number: string, label: string }) => (
  <div className="text-center group">
    <div className="font-display text-4xl md:text-6xl font-black mb-2 group-hover:text-primary transition-colors duration-500">{number}</div>
    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description, tag }: { icon: any, title: string, description: string, tag: string }) => (
  <div className="feature-card group p-6 sm:p-10 glass rounded-[1.5rem] sm:rounded-[2.5rem] hover:bg-white/5 transition-all duration-700 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    
    <div className="mb-8 relative">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
        {icon}
      </div>
      <span className="absolute -top-2 -right-2 text-[8px] font-black tracking-widest text-primary/40 glass-bright px-2 py-1 rounded">
        {tag}
      </span>
    </div>
    
    <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">{description}</p>
    
    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-500">
      Learn Technicals <ArrowUpRight className="w-3 h-3" />
    </div>
  </div>
);

export default Home;
