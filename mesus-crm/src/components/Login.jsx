import React from 'react';

export default function Login({ email, setEmail, password, setPassword, handleLogin, error }) {
    return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
            <div className="bg-[#161b22] p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-[#30363d] relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Mesus Media</h1>
                <p className="text-slate-500 mb-10 font-bold text-[10px] uppercase tracking-[0.3em]">Powered by Supabase</p>
                <input
  type="email"
  placeholder="Email"
  className="w-full p-6 bg-[#0d1117] border border-[#30363d] rounded-2xl text-white font-bold outline-none mb-4"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<input
  type="password"
  placeholder="Senha"
  className="w-full p-6 bg-[#0d1117] border border-[#30363d] rounded-2xl text-white font-bold outline-none"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
/>
                <button 
                    onClick={handleLogin} 
                    className="w-full bg-indigo-600 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl"
                >
                    Entrar no Hub
                </button>
                {error && <p className="mt-6 text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
            </div>
        </div>
    );
}