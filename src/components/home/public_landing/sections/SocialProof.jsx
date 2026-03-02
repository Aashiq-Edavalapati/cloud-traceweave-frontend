'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const SocialProof = () => {
  const testimonials = [
    {
      quote: "Trace-weave cut our debugging time by 70%. We can now replay production failures in dev with perfect accuracy.",
      author: "Sarah Chen",
      role: "Staff Engineer",
      company: "Stripe",
      metric: { value: "70%", label: "Faster debugging" }
    },
    {
      quote: "The AI analysis is genuinely useful. It caught a Redis connection leak we'd been chasing for weeks.",
      author: "Marcus Rodriguez",
      role: "VP Engineering",
      company: "Databricks",
      metric: { value: "98%", label: "Issue detection" }
    },
    {
      quote: "Setup took 45 seconds. No SDK changes, no redeployments. Just works.",
      author: "Aisha Patel",
      role: "DevOps Lead",
      company: "Coinbase",
      metric: { value: "<1min", label: "Deployment" }
    }
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <section className="py-24 bg-[#0A0A0A]/50 backdrop-blur-xl" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-8">
        
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="text-xs font-mono text-brand-primary uppercase tracking-widest">Trusted By</span>
          <h3 className="text-3xl font-bold text-white mt-2">Engineering Teams at Top Companies</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + (i * 0.1) }}
              whileHover={{ y: -8 }}
              className="group p-8 bg-[#0D0D0D]/60 backdrop-blur-2xl border border-white/10 hover:border-brand-primary/30 rounded-xl transition-all duration-300"
            >
              {/* Metric */}
              <div className="mb-6">
                <div className="text-5xl font-black text-brand-primary/30 font-mono group-hover:text-brand-primary/60 transition-colors">
                  {testimonial.metric.value}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-1 font-mono">
                  {testimonial.metric.label}
                </div>
              </div>

              {/* Quote */}
              <p className="text-white/70 leading-relaxed mb-6 italic">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="pt-6 border-t border-white/10">
                <div className="font-semibold text-white">{testimonial.author}</div>
                <div className="text-sm text-white/50 mt-1">
                  {testimonial.role} • <span className="text-brand-primary">{testimonial.company}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
