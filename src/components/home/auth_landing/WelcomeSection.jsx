'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const WelcomeSection = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            Welcome back, {user?.fullName || 'Human'}
          </h1>
          <p className="text-text-secondary mt-1">Here is what is happening in your ecosystem today.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-brand-surface px-4 py-2 rounded-md text-sm font-black hover:bg-brand-glow transition-colors shadow-glow-sm"
        >
          <Plus size={16} /> New Workspace
        </button>
      </motion.div>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

