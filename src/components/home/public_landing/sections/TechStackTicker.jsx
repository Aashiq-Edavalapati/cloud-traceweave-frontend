'use client';

import { motion } from 'framer-motion';
import { Database, Globe, Code2, Terminal, Activity, GitBranch, Sparkles } from 'lucide-react';

const TechLogos = {
  kafka: () => <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.937 11.003l-2.653 2.653c-.397.397-1.041.397-1.438 0l-2.653-2.653c-.397-.397-.397-1.041 0-1.438l2.653-2.653c.397-.397 1.041-.397 1.438 0l2.653 2.653c.397.397.397 1.041 0 1.438z"/></svg>,
  redis: () => <Database className="w-full h-full" />,
  postgres: () => <Database className="w-full h-full" />,
  mongo: () => <Database className="w-full h-full" />,
  grpc: () => <Globe className="w-full h-full" />,
  graphql: () => <Code2 className="w-full h-full" />,
  rest: () => <Terminal className="w-full h-full" />,
  websocket: () => <Activity className="w-full h-full" />,
  rabbitmq: () => <GitBranch className="w-full h-full" />,
  elastic: () => <Sparkles className="w-full h-full" />,
  cassandra: () => <Database className="w-full h-full" />,
  mysql: () => <Database className="w-full h-full" />
};

export const TechStackTicker = () => {
  const technologies = [
    { name: 'Kafka', icon: 'kafka', color: '#231F20' },
    { name: 'Redis', icon: 'redis', color: '#DC382D' },
    { name: 'PostgreSQL', icon: 'postgres', color: '#336791' },
    { name: 'MongoDB', icon: 'mongo', color: '#47A248' },
    { name: 'gRPC', icon: 'grpc', color: '#244c5a' },
    { name: 'GraphQL', icon: 'graphql', color: '#E10098' },
    { name: 'REST', icon: 'rest', color: '#61DAFB' },
    { name: 'WebSocket', icon: 'websocket', color: '#010101' },
    { name: 'RabbitMQ', icon: 'rabbitmq', color: '#FF6600' },
    { name: 'Elasticsearch', icon: 'elastic', color: '#005571' },
    { name: 'Cassandra', icon: 'cassandra', color: '#1287B1' },
    { name: 'MySQL', icon: 'mysql', color: '#4479A1' }
  ];

  const TechCard = ({ tech }) => {
    const IconComponent = TechLogos[tech.icon];
    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:border-brand-primary/40 hover:bg-white/10 transition-all cursor-default group"
      >
        <div className="w-5 h-5 text-white/60 group-hover:text-brand-primary transition-colors">
          {IconComponent && <IconComponent />}
        </div>
        <span className="text-white/70 font-medium text-sm group-hover:text-white transition-colors">
          {tech.name}
        </span>
      </motion.div>
    );
  };

  return (
    <section className="py-24 border-y border-white/10 bg-[#0A0A0A]/50 backdrop-blur-xl overflow-hidden">
      <div className="mb-12 text-center">
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Integrates With Everything</span>
        <h3 className="text-2xl font-bold text-white mt-2">12+ Protocols. Zero Config.</h3>
      </div>
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />
        
        <div className="flex gap-6 animate-scroll-left">
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <TechCard key={i} tech={tech} />
          ))}
        </div>
      </div>
    </section>
  );
};
