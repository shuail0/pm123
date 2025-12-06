'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function ArbitragePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-polyBlue rounded-full mb-6">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">跨市场套利</h1>
        <p className="text-xl text-gray-600">即将上线...</p>
      </motion.div>
    </main>
  );
}
