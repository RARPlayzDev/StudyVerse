
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full flex-col items-center justify-center bg-black overflow-hidden">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Blue pulse */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 0.8, 1], opacity: [0.5, 1, 0.8, 0] }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
          className="absolute w-32 h-32 bg-blue-500/50 rounded-full blur-3xl"
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
          className="relative z-10 flex items-center gap-3 text-white"
        >
          <BrainCircuit className="h-12 w-12 text-blue-400" style={{ filter: 'drop-shadow(0 0 10px hsl(217 91% 60%))' }} />
          <span className="text-4xl font-bold tracking-wider" style={{ textShadow: '0 0 10px hsl(217 91% 60% / 0.7)' }}>
            StudyVerse
          </span>
        </motion.div>

        {/* Energy Ring */}
        <motion.div
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1, delay: 2.5, ease: 'easeOut' }}
            className="absolute w-48 h-48 border-2 border-blue-400 rounded-full"
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 400 - 200,
              y: 150,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ y: -150, opacity: [0, 0.6, 0] }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: 1.5 + Math.random(),
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-1 h-1 bg-blue-300 rounded-full"
            style={{ filter: 'blur(1px)' }}
          />
        ))}
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-20 text-center"
      >
        <div className="relative py-2">
            <span className="text-lg tracking-wider text-blue-200/80">
                Where focus meets flow.
            </span>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 3.2, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 h-0.5 bg-blue-400"
                style={{boxShadow: '0 0 8px hsl(217 91% 60%)'}}
            />
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;
