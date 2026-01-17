// src/App.tsx

function App() {
  return (
    // 1. Container utama: Full screen & background abu-abu muda
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      
      {/* 2. Kartu: Putih, rounded, dengan bayangan halus */}
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Kartu */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">System Status</h1>
          <p className="text-blue-100 text-sm mt-1">RH Studio Management</p>
        </div>

        {/* Isi Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-medium">Tailwind CSS</span>
            {/* Badge Status */}
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
              Active ●
            </span>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Jika kamu melihat kartu ini dengan layout rapi, bayangan (shadow), 
            dan warna biru di atas, selamat! Setup Tailwind v4 kamu berhasil. 🚀
          </p>

          {/* Grid Statistik Sederhana */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-800">12</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Pending</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-800">5</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Completed</div>
            </div>
          </div>

          {/* Tombol Interaktif */}
          <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer">
            Lanjut ke Setup Shadcn UI &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export default App