"use client";

import api from "@/lib/axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { CircleOff, CircleX, Trophy, Star, Send, CheckCircle2, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

export interface RetrievalResult {
  image_id: string;
  image_path: string;
  image_base64: string;
  score: number;
}

interface RetrievalImageProps {
  setRetrievalImage: React.Dispatch<
    React.SetStateAction<RetrievalResult[]>
  >;
}

const UploadFile = ({ setRetrievalImage }: RetrievalImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queryImage, setQueryImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mini, setMini] = useState(false);

  const [queryId, setQueryId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [showNeedLogin, setShowNeedLogin] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{type: "success" | "error", message: string} | null>(null);

  // 1. Check and restore cached data from LocalStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem("cached_query_image");
    const savedQueryId = localStorage.getItem("cached_query_id");
    const savedMini = localStorage.getItem("cached_mini");
    const savedResults = localStorage.getItem("cached_retrieval_results");

    if (savedImage) setQueryImage(savedImage);
    if (savedQueryId) setQueryId(savedQueryId);
    if (savedMini === "true") setMini(true);
    if (savedResults) {
      try {
        setRetrievalImage(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse cached retrieval results:", e);
      }
    }
  }, [setRetrievalImage]);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  // Convert File to Base64 for persistent storage in localStorage
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // SỬA TẠI ĐÂY: Lấy token ngay tại thời điểm upload và kiểm tra TRƯỚC KHI bật Loading
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setShowNeedLogin(true);
      e.target.value = ""; 
      return;
    }

    setError("");
    setLoading(true);
    setShowUploadModal(true);
    setUploadProgress(0);

    try {
      const base64Preview = await convertToBase64(file);
      setQueryImage(base64Preview);
      localStorage.setItem("cached_query_image", base64Preview);

      const formData = new FormData();
      formData.append("file", file);
      // formData.append("dataset", "rparis6k");

      const response = await api.post(
        "/api/v1/retrieval/retrieve",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted > 95 ? 95 : percentCompleted);
            }
          }
        }
      );

      const { query_id, results } = response.data;
      
      setUploadProgress(100);
      setQueryId(query_id);
      setRetrievalImage(results);
      setMini(true);
      toast.success("Upload successful!");

      // Trigger WC26 themed confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d946ef', '#facc15', '#22d3ee']
      });

      // 2. Cache successful session results to local storage
      localStorage.setItem("cached_query_id", query_id);
      localStorage.setItem("cached_mini", "true");
      localStorage.setItem("cached_retrieval_results", JSON.stringify(results));

      setTimeout(() => {
        setShowUploadModal(false);
      }, 600);

      } catch (err: any) {
        console.error(err);

        console.log(err.response);
        console.log(err.response.data);  
        console.log(err.response.data.detail); 

        setError(err.response?.data?.detail || "Upload failed.");
        toast.error(err.response?.data?.detail || "Upload failed.");
        setShowUploadModal(false);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleFeedback = async () => {
    if (!queryId) {
      setFeedbackStatus({ type: "error", message: "Query ID not found." });
      return;
    }
    
    if (rating === 0) {
      setFeedbackStatus({ type: "error", message: "Please select a rating before submitting." });
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/api/v1/feedback/submit", {
        query_id: queryId,
        rating,
        comment,
      });

      setFeedbackStatus({ type: "success", message: res.data.message || "Feedback submitted successfully!" });
      setComment("");
      setRating(0);
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#a7f3d0'] // emerald colors
      });

    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          setFeedbackStatus({ type: "error", message: detail[0].msg || "Validation error" });
        } else if (typeof detail === "string") {
          setFeedbackStatus({ type: "error", message: detail });
        } else {
          setFeedbackStatus({ type: "error", message: "An error occurred." });
        }
      } else {
        setFeedbackStatus({ type: "error", message: "Undefined error." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearCache = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    localStorage.removeItem("cached_query_image");
    localStorage.removeItem("cached_query_id");
    localStorage.removeItem("cached_mini");
    localStorage.removeItem("cached_retrieval_results");
    setQueryImage("");
    setQueryId("");
    setMini(false);
    setRetrievalImage([]);
    toast.success("Cache cleared.");
  };

  return (
    <div className={`w-full flex justify-center items-center ${mini ? "items-center" : "items-start"} gap-6 relative p-4`}>
      
      {/* Upload & Preview Box */}
      <div
        onClick={handleAddImage}
        className={`group rounded-2xl border-2 border-dashed border-fuchsia-400/60 hover:border-fuchsia-300 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] overflow-hidden relative
          ${mini ? "w-[350px] h-[280px]" : "w-[40%] h-[400px]"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        {queryImage ? (
          <div className="w-full h-full relative flex items-center justify-center">
            <img
              src={queryImage}
              alt="Query Preview"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0  group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-sm font-medium gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Change Image
            </div>
            
            <button 
              onClick={handleClearCache}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Clear Cache"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 text-center opacity-100 ">
            <Trophy
              className="w-16 h-16 text-fuchsia-300 group-hover:text-fuchsia-200 transition-colors drop-shadow-md"
              strokeWidth={1.5}
            />
            <p className="text-lg font-bold text-fuchsia-100 group-hover:text-white transition-colors tracking-wide">
              Upload Image to Kick Off Search!
            </p>
            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className={`flex flex-col gap-4 text-white transition-all duration-500 bg-[#1e1b4b]/80 backdrop-blur-xl border border-fuchsia-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.15)] ${mini ? "w-[320px] opacity-100" : "w-0 opacity-0 pointer-events-none hidden"} `}>
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-xl flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300 drop-shadow-sm">
            Rate Your Search
          </h2>
          <p className="text-xs text-fuchsia-100/70 font-medium">Help us improve the image retrieval engine.</p>
        </div>
        
        <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`p-1.5 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none
                ${rating >= num 
                  ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" 
                  : "text-white/20 hover:text-white/50"}`}
            >
              <Star className="w-6 h-6 fill-current" strokeWidth={1} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us what you liked or how we can improve..."
          className="border border-white/10 bg-black/40 text-sm text-fuchsia-50 rounded-xl p-3 w-full h-28 resize-none focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 placeholder-fuchsia-200/30 transition-all shadow-inner"
        />

        <button
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white rounded-xl px-4 py-3 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] cursor-pointer"
          onClick={handleFeedback}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send Feedback
            </>
          )}
        </button>
      </div>

      {/* POPUP UPLOAD PROGRESS */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-[#1e1b4b]/90 rounded-2xl p-6 w-[350px] flex flex-col items-center shadow-[0_0_30px_rgba(217,70,239,0.3)] border border-fuchsia-400/30 backdrop-blur-xl">
            <h3 className="font-bold text-white text-lg mb-4 drop-shadow-md">Retrieving Images...</h3>
            <div className="relative flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full border-4 border-white/10"></div>
              <div className="absolute h-16 w-16 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin"></div>
              <span className="absolute text-sm font-semibold text-fuchsia-300">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-fuchsia-600 to-cyan-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(217,70,239,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-xs text-fuchsia-200/70 mt-1">
              {uploadProgress < 100 ? "Uploading and processing image..." : "Finalizing results..."}
            </p>
          </div>
        </div>
      )}

      {/* POPUP LOGIN REQUIRED */}
      {showNeedLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-[#1e1b4b]/90 rounded-2xl p-6 w-[350px] flex flex-col items-center shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-500/30 backdrop-blur-xl relative gap-3">
            <h3 className="font-bold text-white text-lg mb-2 drop-shadow-md">Authentication Required</h3>
            
            <div className="relative flex items-center justify-center mb-2">
              <CircleX className="animate-bounce w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" strokeWidth={1.5} />
            </div>
            
            <p className="text-sm text-fuchsia-100/80 text-center mb-4">
              You need to <strong className="text-white">Log In</strong> to execute image retrieval.
            </p>

            <div className="flex gap-3 w-full mt-2">
              <button 
                onClick={() => setShowNeedLogin(false)}
                className="flex-1 bg-white/10 border border-white/20 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-fuchsia-400/50 text-white py-2.5 rounded-xl text-sm font-medium hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all"
              >
                Log In Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP FEEDBACK STATUS */}
      {feedbackStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center animate-fade-in" onClick={() => setFeedbackStatus(null)}>
          <div 
            className={`rounded-3xl p-8 w-[380px] flex flex-col items-center shadow-2xl border backdrop-blur-xl relative gap-3 animate-fade-in-up
              ${feedbackStatus.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                : 'bg-rose-950/80 border-rose-500/40 shadow-[0_0_40px_rgba(225,29,72,0.3)]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {feedbackStatus.type === 'success' ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-400/50 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">
                <XCircle className="h-10 w-10 text-rose-400" />
              </div>
            )}
            
            <h3 className="font-extrabold text-transparent bg-clip-text text-2xl mt-4 drop-shadow-md text-center"
                style={{ backgroundImage: feedbackStatus.type === 'success' ? 'linear-gradient(to right, #34d399, #10b981)' : 'linear-gradient(to right, #fb7185, #e11d48)' }}>
              {feedbackStatus.type === 'success' ? 'Thank You!' : 'Action Failed'}
            </h3>
            
            <p className="text-sm text-center text-white/90 font-medium leading-relaxed px-4">
              {feedbackStatus.message}
            </p>

            <button 
              onClick={() => setFeedbackStatus(null)}
              className="mt-6 w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all backdrop-blur-md uppercase tracking-wider"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadFile;