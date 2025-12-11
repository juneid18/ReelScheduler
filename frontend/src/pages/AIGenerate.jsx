import React, { useState } from "react";
import { generateScript } from "../services/generateScript";

const AIChat = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("agent");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateScript(input, selectedOption);
      setResponse((prev) => [
        { type: "user", text: input },
        { type: "ai", text: res },
        ...prev,
      ]);
      setInput("");
    } catch (err) {
      console.error("Error:", err);
      setError("⚠️ AI could not generate a response. Try again later.");
    }
    setLoading(false);
  };

  const placeholderText =
    selectedOption === "agent"
      ? "Type your video topic here... AI Agent will suggest title, description & best posting time."
      : "Type your video topic here... AI will suggest best thumbnails & ideas.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center py-4 border-b border-gray-800 bg-gray-950 shadow-md">
        🎬 AI Video Suggestion Chat
      </h1>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse">
        {error && (
          <div className="bg-red-800/60 p-3 rounded-lg border border-red-600 text-red-300 max-w-lg self-center shadow">
            {error}
          </div>
        )}
        {response.map((msg, i) => (
          <div
            key={i}
            className={`max-w-lg px-4 py-2 rounded-2xl shadow ${
              msg.type === "ai"
                ? "bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 self-start text-green-300"
                : "bg-gradient-to-r from-purple-600 to-pink-600 self-end text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-950 p-4">
        <div className="relative w-full max-w-3xl mx-auto">
          {/* Textarea */}
          <textarea
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none pr-28"
            rows="3"
            placeholder={placeholderText}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="absolute bottom-3 left-3 flex gap-3 items-center">
            {/* Agent Button */}
            <button
              onClick={() => setSelectedOption("agent")}
              className={`
      px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-sm
      backdrop-blur 
      ${
        selectedOption === "agent"
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
          : "bg-gray-800 text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
      }
    `}
            >
              Agent
            </button>

            {/* Thumbnail Button with badge */}
            <div className="relative flex items-center">
              <button
                disabled
                onClick={() => setSelectedOption("thumbnail")}
                className={`
        px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all
        cursor-not-allowed opacity-50
        ${
          selectedOption === "thumbnail"
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105 shadow-lg"
            : "bg-gray-800 text-gray-300"
        }
      `}
              >
                Thumbnail
              </button>

              {/* Coming Soon Badge */}
              <span
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-600 text-yellow-100 
      text-[10px] px-2 py-0.5 rounded-full shadow-sm border border-yellow-500"
              >
                Soon
              </span>
            </div>
          </div>

          {/* Ask AI Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 rounded-full hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 text-sm shadow-lg"
          >
            {loading ? "..." : "Ask AI"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
