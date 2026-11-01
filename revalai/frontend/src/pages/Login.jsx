import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Briefcase, Hash, LogIn, UserPlus, Eye, EyeOff, Sparkles } from "lucide-react";
import { api, setToken } from "../api";

export default function Login({ onLoggedIn }) {
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  
  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up state
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [rollNumber, setRollNumber] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      setToken(data.access_token);
      localStorage.setItem("revalai_role", data.role);
      localStorage.setItem("revalai_name", data.name);
      onLoggedIn(data.role);
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  const [successMsg, setSuccessMsg] = useState("");

  async function handleRegister(e) {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await api.register({
        name: name.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role,
        department,
        roll_number: role === "student" ? rollNumber.trim() : null,
      });
      setEmail(regEmail.trim());
      setPassword(regPassword);
      setSuccessMsg("Account successfully created! You can now sign in.");
      setTab("signin");
      setName("");
      setRegEmail("");
      setRegPassword("");
      setRollNumber("");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTab("signin");
  };

  return (
    <div className="min-h-screen bg-[#121417] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden bg-charcoal-grid font-sans">
      {/* Background Animated Orange & Fiery Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#FF4500]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#FF6B00]/20 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4500] via-[#FF6B00] to-[#FFAA00] flex items-center justify-center mx-auto mb-4 shadow-[0_0_35px_rgba(255,107,0,0.65)] ring-2 ring-[#FF6B00]/40 animate-flame-pulse">
            <GraduationCap size={32} className="text-black stroke-[3]" />
          </div>
          <h1 className="text-4xl font-black text-white font-display tracking-tight flex items-center justify-center gap-1.5">
            Reval<span className="fiery-text text-4xl font-black">AI</span>
          </h1>
          <p className="text-xs text-[#FFAA00] font-mono tracking-widest mt-1 uppercase font-extrabold">
            Examination Revaluation Platform
          </p>
        </div>

        {/* Charcoal Glassmorphic Card with Animated Fiery Glow Border */}
        <div className="fiery-border-box">
          <div className="bg-charcoal-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 border border-charcoal-700">
            {/* Tab Selector */}
            <div className="flex bg-[#121417] p-1.5 rounded-2xl mb-6 border border-charcoal-700">
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(""); }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  tab === "signin" 
                    ? "bg-gradient-to-r from-[#FF4500] via-[#FF6B00] to-[#FFAA00] text-black shadow-[0_0_18px_rgba(255,107,0,0.5)]" 
                    : "text-charcoal-300 hover:text-white"
                }`}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("signup"); setError(""); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  tab === "signup" 
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UserPlus size={15} /> Create Account
              </button>
            </div>

            {successMsg && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-[#1E251F] text-emerald-400 border border-emerald-500/40 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <Sparkles size={14} /> {successMsg}
              </div>
            )}

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-500/40 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {tab === "signin" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-[#FF8533]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@revalai.demo"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block tracking-wide">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-[#FF8533]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-[#FF6B00] focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#EA580C] text-white text-sm font-extrabold tracking-wide hover:shadow-[0_0_25px_rgba(255,107,0,0.6)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {loading ? "Authenticating…" : "Access Secure Portal →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-[#FF8533]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kishore S"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3 text-[#FF8533]" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-[#FF8533]" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white placeholder-gray-600 focus:border-[#FF6B00] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-2.5 text-gray-500 hover:text-[#FF6B00] focus:outline-none"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="evaluator">Evaluator</option>
                      <option value="officer">Exam Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="CSE, ECE, Math..."
                      className="w-full px-3 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                {role === "student" && (
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Roll Number</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3.5 top-3 text-[#FF8533]" />
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 22CS102"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#121417] border border-[#2D3542] text-sm text-white focus:border-[#FF6B00] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#EA580C] text-white text-sm font-extrabold tracking-wide hover:shadow-[0_0_20px_rgba(255,107,0,0.5)] active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {loading ? "Registering…" : "Complete Registration →"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Interactive Quick Demo Login Pills */}
        <div className="mt-6 text-center">
          <p className="text-xs font-mono text-[#FF8533] mb-2 font-bold tracking-wider">QUICK DEMO ONE-CLICK FILL</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button 
              type="button" 
              onClick={() => fillDemo("student@revalai.demo", "demo1234")}
              className="px-2 py-1.5 rounded-xl bg-[#181B20] border border-[#2E3642] hover:border-[#FF6B00] text-[11px] font-semibold text-gray-300 hover:text-[#FF6B00] transition-colors"
            >
              🎓 Student
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo("evaluator@revalai.demo", "demo1234")}
              className="px-2 py-1.5 rounded-xl bg-[#181B20] border border-[#2E3642] hover:border-[#FF6B00] text-[11px] font-semibold text-gray-300 hover:text-[#FF6B00] transition-colors"
            >
              📝 Dr. Venkatesh
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo("evaluator2@revalai.demo", "demo1234")}
              className="px-2 py-1.5 rounded-xl bg-[#181B20] border border-[#2E3642] hover:border-[#FF6B00] text-[11px] font-semibold text-gray-300 hover:text-[#FF6B00] transition-colors"
            >
              📝 Dr. Meera
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo("officer@revalai.demo", "demo1234")}
              className="px-2 py-1.5 rounded-xl bg-[#181B20] border border-[#2E3642] hover:border-[#FF6B00] text-[11px] font-semibold text-gray-300 hover:text-[#FF6B00] transition-colors"
            >
              ⚖️ Officer
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo("admin@revalai.demo", "demo1234")}
              className="px-2 py-1.5 rounded-xl bg-[#181B20] border border-[#2E3642] hover:border-[#FF6B00] text-[11px] font-semibold text-gray-300 hover:text-[#FF6B00] transition-colors"
            >
              ⚡ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
