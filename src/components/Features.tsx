import React from 'react';
import { motion } from 'motion/react';
import { Clock, Navigation, Activity, Bell, Zap, Fuel } from 'lucide-react';

const features = [
  {
    title: "Route-Based Discovery",
    description: "Find EV and CNG stations specifically along your planned route, not just nearby, ensuring you never go out of your way.",
    icon: Navigation,
    color: "primary"
  },
  {
    title: "AI Queue Prediction",
    description: "Our proprietary AI models predict station wait times based on real-time traffic, historical data, and current usage.",
    icon: Clock,
    color: "secondary"
  },
  {
    title: "SmartCharge Doctor",
    description: "Real-time analysis of your charging performance. Get alerts if your charging speed drops or efficiency fluctuates.",
    icon: Activity,
    color: "accent"
  },
  {
    title: "Real-Time Alerts",
    description: "Receive instant notifications for high queue warnings, slow charger alerts, and low battery emergencies.",
    icon: Bell,
    color: "primary"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-bold text-primary tracking-wide uppercase bg-white/10 inline-block px-3 py-1 rounded-full border border-primary/30 backdrop-blur-sm shadow-lg">Features</h2>
          <p className="mt-4 text-3xl font-extrabold text-white sm:text-4xl drop-shadow-md">
            Everything you need for a smooth journey
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white/80 font-medium drop-shadow-sm">
            FuelFlow AI combines infrastructure data with advanced machine learning to optimize every mile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm ${
                feature.color === 'primary' ? 'bg-primary/20 text-primary' :
                feature.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                'bg-accent/20 text-accent'
              } group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
