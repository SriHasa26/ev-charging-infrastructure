import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Chatbot from '../components/Chatbot';
import { Fuel, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-app-text">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1] opacity-90 pointer-events-none"
      >
        <source src="/videos/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay to ensure text readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 z-[-1] pointer-events-none" />

      <Navbar />
      <Hero />
      <Features />

      {/* Problem Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6 drop-shadow-md">
            The Infrastructure Gap
          </h2>
          <p className="text-xl text-white/80 mb-12 font-medium drop-shadow-sm">
            As adoption of EV and CNG vehicles grows, infrastructure remains the biggest bottleneck. Range anxiety, unpredictable queue times, and unreliable chargers frustrate users every day.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              "Unpredictable wait times at stations",
              "Chargers that don't deliver promised speeds",
              "Difficulty finding stations on long routes",
              "Lack of real-time infrastructure status"
            ].map((item) => (
              <div key={item} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-white/10 group">
                <div className="bg-red-500/10 p-2 rounded-full shrink-0 shadow-sm group-hover:bg-red-500/20 transition-colors">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white/90 font-semibold">{item}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 inline-flex flex-col items-center justify-center bg-white/5 p-6 rounded-2xl border border-primary/30 backdrop-blur-md shadow-lg">
            <p className="text-4xl font-black text-primary mb-2 drop-shadow-sm">45%</p>
            <p className="text-sm font-bold text-white/90">Reduction in journey time with AI-optimized routing.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 relative z-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold mb-4 drop-shadow-md">How FuelFlow AI Works</h2>
            <p className="text-xl text-white/80">Three simple steps to a smarter journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Plan Your Route", desc: "Enter your destination and vehicle details. We analyze the entire path." },
              { step: "02", title: "AI Optimization", desc: "Our AI predicts queue times and selects the most efficient stations for you." },
              { step: "03", title: "Drive with Confidence", desc: "Get real-time alerts and performance analysis while you drive." }
            ].map((item) => (
              <div key={item.step} className="relative bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors hover:border-white/20">
                <span className="text-8xl font-black text-white/5 absolute -top-4 -left-4">{item.step}</span>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{item.title}</h3>
                <p className="text-white/70 leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">Trusted by thousands of drivers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Alex Rivera", role: "EV Owner", text: "The queue prediction is a lifesaver. I've saved hours of waiting time on my weekly commutes." },
              { name: "Sarah Chen", role: "CNG Fleet Manager", text: "SmartCharge Doctor helped us identify faulty chargers at our regular stops. Incredible tool." },
              { name: "James Wilson", role: "Long-distance Traveler", text: "Finally, an app that understands I need stations ALONG my route, not just nearby." }
            ].map((t) => (
              <div key={t.name} className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all hover:-translate-y-1 hover:bg-white/10">
                <p className="text-white/80 italic mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold border border-primary/30">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-sm text-white/60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Fuel className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-white">FuelFlow AI</span>
          </div>
          <p className="text-white/60 font-medium text-sm">© 2026 FuelFlow AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-medium">
            <a href="#" className="text-white/50 hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="text-white/50 hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="text-white/50 hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
