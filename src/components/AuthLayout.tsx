import React from 'react';
import snackHero from '../assets/snacks.jpg';
import { Outlet } from 'react-router-dom'; // Corrected: Import as a component, not just a type

const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white font-inter">
      
      {/* Left Side: Image Section (Stays mounted during navigation) */}
      <div className="relative w-[55%] h-full hidden md:block">
        <img 
          src={snackHero} 
          alt="Binu Products" 
          className="w-full h-full object-cover"
        />
        
        {/* IMPROVED OVERLAY: Darker behind the text */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent"></div>

        <div className="absolute bottom-24 left-20 z-10 text-white">
          <h1 className="text-8xl font-black leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            BINU <br /> PRODUCTS
          </h1>
          
          <div className="w-16 h-2 bg-[#ff5722] mt-6 mb-6 shadow-[0_0_15px_rgba(255,87,34,0.8)]"></div>
          
          <p className="text-xl font-medium text-white/90 max-w-sm leading-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
            Quality bites and mixtures, delivered fresh daily.
          </p>
        </div>
      </div>

      {/* Right Side: Enhanced Dynamic Background */}
      <div className="flex-1 h-full bg-[#fafafa] relative md:-ml-24 rounded-l-[80px] z-20 flex items-center justify-center overflow-hidden">
        
        {/* --- DECORATIVE ELEMENTS (These will not flicker) --- */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-100 rounded-full blur-[80px] opacity-50"></div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ff5722 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.02]">
          <h1 className="text-[250px] font-black italic">BINU</h1>
        </div>

        {/* --- THE CONTENT CARD --- */}
        <div className="w-full max-w-lg px-10 relative z-10">
          {/* 
            If children is passed, use it. 
            Otherwise, use <Outlet /> which allows the Router to swap Login/Signup inside this spot.
          */}
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;