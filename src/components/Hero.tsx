import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/5 text-primary border border-primary/10 mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Next-Gen Multi-Fuel Optimization
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            AI-Powered Route Optimization for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-300 drop-shadow-md">
              EV & CNG Vehicles
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/90 mb-10 drop-shadow-md font-medium">
            Find the best charging and fueling stations along your route, predict wait times with AI, and monitor your vehicle's performance in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/#features"
              className="w-full sm:w-auto px-8 py-4 bg-white text-app-text border border-primary/10 rounded-full font-bold text-lg hover:bg-app-bg transition-all"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
