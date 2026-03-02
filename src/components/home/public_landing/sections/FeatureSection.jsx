'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Layers, Zap, Shield, Cpu, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const FeatureSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Layers,
      title: 'Distributed Tracing',
      description: 'Visualize the complete journey of requests across Kafka, Redis, PostgreSQL, and microservices in real-time.',
      color: 'var(--brand-primary)',
      benefits: ['12-hop deep traces', 'Sub-millisecond accuracy', 'Zero code changes'],
      metric: { value: '99.9%', label: 'Capture rate' }
    },
    {
      icon: Zap,
      title: 'AI-Powered Analysis',
      description: 'Local LLM automatically detects bottlenecks, predicts failures, and suggests optimizations.',
      color: '#0069D9',
      benefits: ['Real-time anomaly detection', 'Predictive alerts', 'Auto-remediation suggestions'],
      metric: { value: '98.3%', label: 'Accuracy' }
    },
    {
      icon: Shield,
      title: 'Time-Travel Debugging',
      description: 'Replay any request with exact state, headers, and payload. Debug production issues locally.',
      color: '#10B981',
      benefits: ['Perfect replay fidelity', 'State reconstruction', 'Local reproduction'],
      metric: { value: '100%', label: 'Replay success' }
    },
    {
      icon: Cpu,
      title: 'Universal Protocol Support',
      description: 'One interface for REST, GraphQL, gRPC, WebSocket, MQTT, and custom protocols.',
      color: '#8B5CF6',
      benefits: ['12+ protocols', 'Auto-detection', 'Custom extensions'],
      metric: { value: '12+', label: 'Protocols' }
    }
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-8">
        
        {/* Section Header */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              className="h-px bg-brand-primary"
              initial={{ width: 0 }}
              animate={isInView ? { width: 64 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            <span className="text-xs font-mono text-brand-primary uppercase tracking-widest">Features</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight text-white mb-6 font-mono">
            COMPLETE OBSERVABILITY
          </h2>
          <p className="text-xl text-white/50 max-w-2xl font-light">
            Move beyond status codes. Understand the complete narrative of your data across distributed systems.
          </p>
        </motion.div>

        {/* Features Grid - Innovative Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full p-8 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                  
                  {/* Gradient background */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top right, ${feature.color}, transparent 70%)`
                    }}
                  />

                  {/* Icon */}
                  <motion.div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative"
                    style={{ 
                      backgroundColor: `${feature.color}15`,
                      border: `1px solid ${feature.color}30`
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon size={28} style={{ color: feature.color }} />
                    <motion.div 
                      className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
                      style={{ backgroundColor: feature.color }}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed mb-6">{feature.description}</p>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-white/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4 + (i * 0.1) + (idx * 0.05) }}
                      >
                        <CheckCircle2 size={14} style={{ color: feature.color }} />
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Metric */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold font-mono" style={{ color: feature.color }}>
                          {feature.metric.value}
                        </div>
                        <div className="text-xs text-white/40 uppercase tracking-wider font-mono mt-1">
                          {feature.metric.label}
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 5, y: -5 }}
                        className="text-white/20 group-hover:text-white/60 transition-colors"
                      >
                        <ArrowUpRight size={24} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
