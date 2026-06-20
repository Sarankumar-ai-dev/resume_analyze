import { useState, useRef, useEffect } from "react";

const BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const [messages,setMessages]=useState([
    {
      role: "bot",
      text: "👋 Vanakkam! Upload your resume and ask me anything about it.",
    },
  ]);
  const [question,setQuestion]=useState("");
  const [resumeUploaded,setResumeUploaded]=useState(false);
  const [fileName,setFileName]=useState("");
  const [loading,setLoading]=useState(false);
  const fileInputRef=useRef(null);
  const messagesEndRef=useRef(null);
  const textareaRef=useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const addMsg = (role,text) => {
    setMessages((prev) => [...prev, { role,text }]);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const formData = new FormData();
    formData.append("resume", file);
    addMsg("bot", "⏳ Uploading your resume...");
    try {
      const res = await fetch(`${BASE}/upload/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => prev.filter((m) => m.text !== "⏳ Uploading your resume..."));
      if (res.ok) {
        setResumeUploaded(true);
        addMsg("bot", `✅ Resume uploaded! ${data.pages} page(s), ${data.characters_extracted} characters extracted. Now ask me anything!`);
      } else {
        addMsg("bot", `❌ ${data.error}`);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.text !== "⏳ Uploading your resume..."));
      addMsg("bot", "❌ Server connect ஆகல. Django running ஆ இருக்கா check பண்ணுங்க.");
    }
  };

  const sendMessage = async () => {
    const q = question.trim();
    if (!q || !resumeUploaded || loading) return;
    addMsg("user", q);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      addMsg("bot", data.answer || data.error);
    } catch {
      addMsg("bot", "❌ Server error. Try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fillQ = (text) => {
    setQuestion(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 flex flex-col overflow-hidden shadow-2xl" style={{ height: "90vh" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div className="w-9 h-9 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 text-lg">
            📄
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">HireWise Resume Chat</h1>
            <p className="text-xs text-gray-400">English · Tamil · Thanglish</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {resumeUploaded && (
              <span className="text-xs text-emerald-400 bg-emerald-900/40 px-2 py-1 rounded-full border border-emerald-800">
                ✓ Resume Ready
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Upload Bar */}
        <div className="px-4 py-2 bg-gray-950 border-b border-gray-800 flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-all duration-200"
          >
            ⬆️ Upload PDF
          </button>
          {fileName && (
            <span className="text-xs text-gray-500 truncate max-w-xs">{fileName}</span>
          )}
          {!fileName && (
            <span className="text-xs text-gray-600">No file chosen</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 items-end animate-fade-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mb-1 ${msg.role === "bot" ? "bg-purple-900 text-purple-300" : "bg-emerald-900 text-emerald-300"}`}>
                {msg.role === "bot" ? "AI" : "Me"}
              </div>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "bot"
                  ? "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
                  : "bg-purple-700 text-white rounded-br-sm"
              }`}>
                {msg.text}
                {i === 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {["What are the skills?", "இவரின் திறன்கள் என்ன?", "Ivan skills enna iruku?"].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => fillQ(chip)}
                        className="text-xs px-3 py-1 rounded-full bg-gray-700 hover:bg-purple-800 text-gray-300 hover:text-white border border-gray-600 hover:border-purple-500 transition-all duration-200"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center text-xs font-semibold">AI</div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-900 flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder={resumeUploaded ? "Ask about the resume..." : "Upload a resume first..."}
            disabled={!resumeUploaded}
            rows={1}
            className="flex-1 resize-none bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:border-purple-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed max-h-28 overflow-y-auto"
            style={{ fieldSizing: "content" }}
          />
          <button
            onClick={sendMessage}
            disabled={!question.trim() || !resumeUploaded || loading}
            className="w-10 h-10 rounded-full bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <span className="text-white text-sm">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}