
'use client';
import { motion } from 'framer-motion';
import { BrainCircuit, Notebook, Timer, TestTube } from 'lucide-react';
import Logo from './logo';

const floatingIcons = [
  { icon: <Notebook className="h-6 w-6 text-slate-500" />, x: '-10vw', y: '20vh', rotate: -15, duration: 15 },
  { icon: <Timer className="h-8 w-8 text-slate-600" />, x: '15vw', y: '-10vh', rotate: 20, duration: 18 },
  { icon: <TestTube className="h-7 w-7 text-slate-500" />, x: '-20vw', y: '-15vh', rotate: -25, duration: 20 },
  { icon: <BrainCircuit className="h-10 w-10 text-slate-600" />, x: '25vw', y: '15vh', rotate: 10, duration: 12 },
];

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        {/* Floating background icons */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, x: item.x, y: item.y, rotate: item.rotate }}
            transition={{
              duration: item.duration,
              ease: "linear",
              repeat: Infinity,
              repeatType: "mirror",
              delay: index * 2,
            }}
            className="absolute"
          >
            {item.icon}
          </motion.div>
        ))}
        
        {/* Main Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Logo textClassName="text-4xl" />
        </motion.div>
      </div>
       <motion.p 
        className="mt-6 text-muted-foreground"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.5, duration: 1}}
       >
        Loading your StudyVerse...
       </motion.p>
    </div>
  );
};

export default Preloader;
