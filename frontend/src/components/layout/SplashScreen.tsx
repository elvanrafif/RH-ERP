import { motion } from "framer-motion"
import Logo from "@/assets/rh-studio-transparent.png"

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* 1. BACKGROUND LAYER (Ini yang boleh Fade Out) */}
      <motion.div 
        className="absolute inset-0 bg-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }} // Background hilang pelan-pelan
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* 2. CONTENT LAYER (Logo DILARANG Fade Out di sini) */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* LOGO: layoutId="rh-logo" */}
        {/* Kita hapus properti 'exit' di sini agar dia tetap solid saat transisi */}
        <motion.img
          layoutId="rh-logo" 
          src={Logo}
          alt="RH Studio"
          className="w-40 md:w-56 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }}
          // PENTING: Jangan ada exit={{ opacity: 0 }} di sini!
        />

        {/* LOADING BAR: Ini boleh hilang */}
        <motion.div 
          className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-slate-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }} // Bar hilang duluan biar bersih
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      </div>
    </div>
  )
}