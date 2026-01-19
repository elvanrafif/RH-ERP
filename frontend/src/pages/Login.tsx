import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { pb } from "@/lib/pocketbase"
import { motion } from "framer-motion"
import Logo from "@/assets/rh-studio-transparent.png"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await pb.collection('users').authWithPassword(email, password);
      if (pb.authStore.isValid) {
        toast.success("Login berhasil! Selamat datang.");
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      const msg = "Email atau password salah.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container background abu-abu
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      
      {/* CARD UTAMA: Tidak boleh ada initial={{opacity: 0}} di sini agar logo tujuan ready */}
      <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary relative z-10 bg-white">
        
        {/* HEADER: Tempat Logo Mendarat */}
        <CardHeader className="space-y-4 flex flex-col items-center pb-2 pt-8">
          <motion.img 
            layoutId="rh-logo"
            src={Logo} 
            alt="RH Studio Logo" 
            className="h-52 w-auto object-contain mb-2"

            // TAMBAHAN PENTING: Paksa opacity 1 sejak awal
            initial={{ opacity: 1 }} 
            
            transition={{ 
              type: "spring",
              stiffness: 130,
              damping: 20,
              mass: 1
            }}
          />
          
        </CardHeader>

        {/* KONTEN FORM: Ini yang kita animasikan muncul setelah logo mendarat */}
        <CardContent>
          <motion.div
            // Animasi container form: Muncul dari bawah dengan stagger
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.3, // Tunggu logo mendarat dulu sebentar
              duration: 0.5,
              ease: "easeOut",
              when: "beforeChildren", // Animasikan container dulu
              staggerChildren: 0.1 // Lalu anak-anaknya berurutan
            }}
            className="space-y-4"
          >
            
            {/* Alert Error */}
            {error && (
              <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
               {/* Input Email */}
               <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                          id="email" type="email" placeholder="admin@rhstudio.com" 
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          required className="bg-slate-50"
                      />
                  </div>
               </motion.div>

               {/* Input Password */}
               <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                          id="password" type="password" 
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          required className="bg-slate-50"
                      />
                  </div>
               </motion.div>

              {/* Button Login */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="pt-2">
                  <Button type="submit" className="w-full font-semibold" disabled={loading} size="lg">
                    {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifikasi...</>
                    ) : ( "Masuk Dashboard" )}
                  </Button>
              </motion.div>
            </form>
          </motion.div>
        </CardContent>
        
        {/* Footer Link */}
        <CardFooter className="flex justify-center pb-6">
          <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground text-center"
          >
            Lupa password? Hubungi Super Admin.
          </motion.p>
        </CardFooter>
      </Card>
    </div>
  )
}