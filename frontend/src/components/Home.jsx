import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import home from "../assets/home.png";
import ats from "../assets/ats.png";
import resume from "../assets/resume.png";
import chatbot from "../assets/chatbot.png";


const useScrollAnimation = () => {
  const ref=useRef(null);
  const[visible,setVisible]=useState(false);
  useEffect(() => {
    const observer=new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); },{ threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  },[]);
  return [ref,visible];
};

const AnimatedSection=({children,className="",direction="up"}) => {
  const [ref,visible]=useScrollAnimation();
  const cls = { up: visible ? "opacity-100 translate-y-0":"opacity-0 translate-y-16", left: visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16", right: visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16" };
  return <div ref={ref} className={`transition-all duration-700 ease-out ${cls[direction]} ${className}`}>{children}</div>;
};

const NavLink=({href,label,active=false}) => (
  <a href={href} className="relative px-4 py-5 text-base font-mono text-gray-700 hover:text-blue-900 transition-colors duration-300 group">
    {label}
    <span className={`absolute bottom-3 left-4 h-0.5 bg-blue-900 transition-all duration-300 ease-out ${active ? "w-[calc(100%-2rem)]" : "w-0 group-hover:w-[calc(100%-2rem)]"}`} />
  </a>
);

const Home = () => {
  const [activeNav,setActiveNav]=useState("home");
  const [menuOpen,setMenuOpen]=useState(false);
  const navigate=useNavigate();

  useEffect(() => {
    const sections = ["home","ats","resume","chatbot"];
    const handleScroll = () => {
      const scrollY = window.scrollY + 100;
      for (const id of sections) {
        const el=document.getElementById(id);
        if (el && scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) { setActiveNav(id); break; }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home", id: "home" },
    { href: "#ats", label: "ATS-Score", id: "ats" },
    { href: "#resume", label: "Resume-Create", id: "resume" },
    { href: "#chatbot", label: "AI-Chatbot", id: "chatbot" },
  ];

  return (
    <div className="min-h-screen font-sans">
      <nav className="sticky top-0 z-50 bg-emerald-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between">
          <span className="py-4 text-2xl font-bold font-mono text-blue-900 tracking-wide select-none">ResumeIQ</span>
          <div className="hidden md:flex items-center">
            {navLinks.map((link) => <NavLink key={link.id} href={link.href} label={link.label} active={activeNav === link.id} />)}
          </div>
          <button className="md:hidden p-2 rounded text-gray-700 hover:bg-emerald-500 transition" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col px-4 pb-4 gap-1">
            {navLinks.map((link) => (
              <a key={link.id} href={link.href} onClick={() => setMenuOpen(false)} className={`py-2 px-3 rounded font-mono text-gray-700 hover:bg-emerald-500 hover:text-blue-900 transition-colors ${activeNav === link.id ? "bg-emerald-300 font-bold text-blue-900" : ""}`}>{link.label}</a>
            ))}
          </div>
        </div>
      </nav>
      <section id="home" className="flex flex-col md:flex-row justify-between items-center px-6 md:px-16 py-30 gap-10">
        <AnimatedSection direction="left" className="w-full md:w-1/2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight">ResumeIQ - Build Smarter Resumes with AI</h1>
          <p className="mt-10 text-xl md:text-3xl font-serif text-gray-700">Get AI-powered resume analysis, improve your ATS score,</p>
          <p className="mt-5 text-xl md:text-3xl font-serif text-gray-700">personalized career insights.</p>
          <a href="#ats"><button className="mt-10 px-8 py-4 bg-emerald-500 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200">Get Started</button></a>
        </AnimatedSection>
        <AnimatedSection direction="right" className="w-full md:w-1/2 flex justify-center hidden lg:block">
          <img src={home} alt="Career Building" className="relative z-10 w-full max-w-[700px] rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-500 ease-out animate-float" />
        </AnimatedSection>
      </section>
      <section id="ats" className="flex flex-col md:flex-row items-center px-6 md:px-16 py-35 bg-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl gap-10">
        <AnimatedSection direction="left" className="w-full md:w-1/2 flex justify-center">
          <img src={ats} alt="ATS Score" className="relative z-10 w-full max-w-[700px] rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-500 ease-out" />
        </AnimatedSection>
        <AnimatedSection direction="right" className="w-full md:w-1/2">
          <h3 className="text-3xl md:text-4xl font-extrabold text-blue-900 leading-tight">Know ATS Score</h3>
          <p className="mt-10 text-xl md:text-3xl font-serif text-gray-700 italic">See how well your resume performs against Application Tracking System</p>
          <a href="#ats"><button className="mt-10 px-8 py-4 bg-emerald-500 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200" onClick={()=> navigate("/ats")}>ATS Score</button></a>
        </AnimatedSection>
      </section>
      <section id="resume" className="px-6 md:px-16 py-35">
        <AnimatedSection direction="up" className="flex flex-col items-center text-center gap-8">
          <div className="flex justify-center relative">
            <img src={resume} alt="Resume Create" className="relative z-10 w-full max-w-[700px] rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-500 ease-out" />
          </div>
          <h3 className="text-3xl md:text-4xl mt-10 pl-5 font-serif text-blue-900 leading-tight">Create a Professional Resume With AI</h3>
          <a href="#resume"><button className="mt-10 px-8 py-4 bg-emerald-500 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200" onClick={()=> navigate("/build")}>Create Resume</button></a>
        </AnimatedSection>
      </section>
      <section id="chatbot" className="flex flex-col md:flex-row items-center px-6 md:px-16 py-35 bg-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl gap-10">
        <AnimatedSection direction="left" className="w-full md:w-1/2 flex justify-center">
          <img src={chatbot} alt="AI Chatbot" className="relative z-10 w-full max-w-[700px] rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-500 ease-out" />
        </AnimatedSection>
        <AnimatedSection direction="right" className="w-full md:w-1/2">
          <h3 className="text-3xl md:text-4xl font-extrabold text-blue-900 leading-tight">AI Resume Assistant</h3>
          <p className="mt-10 text-xl md:text-3xl font-serif text-gray-700 italic">Ask question about your resume and</p>
          <p className="mt-10 text-xl md:text-3xl font-serif text-gray-700 italic">receive personalized career guidance in seconds</p>
          <a href="#chatbot"><button className="mt-10 px-8 py-4 bg-emerald-500 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200" onClick={()=> navigate("/chat")}>Chat with AI</button></a>
        </AnimatedSection>
      </section>
      <footer className="bg-emerald-400  pt-12 pb-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h2 className="text-2xl font-bold font-mono text-blue-700 mb-3">ResumeIQ</h2>
            <p className="text-sm  leading-relaxed">AI-powered career platform to help you build, optimize, and land your dream job.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-emerald-500 pb-1">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.id}><a href={link.href} className="hover:text-emerald-400 transition-colors duration-200">{link.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-4 border-t border-blue-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs ">
          <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

    </div>
  );
};

export default Home;