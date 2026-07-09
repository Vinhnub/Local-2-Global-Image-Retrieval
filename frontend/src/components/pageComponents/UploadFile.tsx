"use client";

import api from "@/lib/axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { CircleOff, CircleX, Trophy, Star, Send, CheckCircle2, XCircle, UploadCloud, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";

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
      toast.success("Query indexed successfully");

      localStorage.setItem("cached_query_id", query_id);
      localStorage.setItem("cached_mini", "true");
      localStorage.setItem("cached_retrieval_results", JSON.stringify(results));

      setTimeout(() => {
        setShowUploadModal(false);
      }, 800);

      } catch (err: any) {
        console.error(err);
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

      setFeedbackStatus({ type: "success", message: res.data.message || "Feedback recorded." });
      setComment("");
      setRating(0);

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
    <div className={`w-full flex flex-col md:flex-row justify-center items-center ${mini ? "items-center" : "items-start"} gap-8 relative p-4`}>
      
      {/* Upload Box (Soft Structuralism Double-Bezel) */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleAddImage}
        className={`group cursor-pointer p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] active:scale-[0.98]
          ${mini ? "w-[300px] h-[300px]" : "w-full max-w-[500px] h-[350px] sm:h-[450px]"}`}
      >
        <div className="w-full h-full rounded-[1.5rem] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {queryImage ? (
            <>
              <img
                src={queryImage}
                alt="Query Preview"
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-black text-sm font-medium gap-3 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                  <RefreshCw className="w-5 h-5 text-black" />
                </div>
                Replace Input
              </div>
              
              <button 
                onClick={handleClearCache}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white backdrop-blur-md text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-black/5"
                title="Clear Cache"
              >
                <CircleX className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 text-center opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-black/5 border border-black/5 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base font-medium text-black tracking-wide">
                  Select visual query
                </p>
                <p className="text-xs text-black/40 mt-1">
                  JPG, PNG up to 10MB
                </p>
              </div>
              {error && <p className="text-red-500 text-xs font-medium mt-2">{error}</p>}
            </div>
          )}
        </div>
      </motion.div>

      {/* Feedback Section (Soft Structuralism) */}
      <AnimatePresence>
        {mini && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 w-[320px]"
          >
            <div className="bg-white rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 h-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-medium text-lg text-black">
                  Result Evaluation
                </h2>
                <p className="text-xs text-black/40">Help refine the retrieval model.</p>
              </div>
              
              <div className="flex justify-between items-center bg-black/5 p-2 rounded-xl border border-black/5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`p-2 rounded-full transition-all duration-300 transform active:scale-90 focus:outline-none
                      ${rating >= num 
                        ? "text-black drop-shadow-sm" 
                        : "text-black/20 hover:text-black/40"}`}
                  >
                    <Star className="w-5 h-5 fill-current" strokeWidth={1.5} />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Diagnostic notes..."
                className="bg-black/5 text-sm text-black rounded-xl p-3 w-full h-24 resize-none focus:outline-none focus:ring-1 focus:ring-black/10 placeholder-black/30 transition-all border border-black/5"
              />

              <button
                className="group flex items-center justify-center gap-2 bg-black text-white rounded-full px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm hover:shadow-md"
                onClick={handleFeedback}
                disabled={submitting}
              >
                {submitting ? "Transmitting..." : "Submit Feedback"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP UPLOAD PROGRESS (Soft Structuralism Modal) */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-center"
          >
            <div className="p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 w-[320px] shadow-2xl">
              <div className="bg-white rounded-[1.5rem] p-8 flex flex-col items-center">
                <h3 className="font-medium text-black text-base mb-6">Processing Query</h3>
                <div className="w-full bg-black/5 rounded-full h-1 overflow-hidden">
                  <motion.div 
                    className="bg-black h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-black/40 mt-6">
                  {uploadProgress < 100 ? "Indexing..." : "Ready."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP LOGIN REQUIRED */}
      <AnimatePresence>
        {showNeedLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-center"
          >
            <div className="p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 w-[360px] shadow-2xl">
              <div className="bg-white rounded-[1.5rem] p-8 flex flex-col items-center text-center">
                <h3 className="font-medium text-black text-lg mb-2">Authentication Needed</h3>
                <p className="text-sm text-black/50 mb-8">
                  You must be logged in to access the retrieval engine.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowNeedLogin(false)}
                    className="flex-1 bg-black/5 border border-black/5 text-black py-2.5 rounded-full text-sm font-medium hover:bg-black/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="flex-1 bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-black/90 transition-colors shadow-sm"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP FEEDBACK STATUS */}
      <AnimatePresence>
        {feedbackStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex items-center justify-center" 
            onClick={() => setFeedbackStatus(null)}
          >
            <div 
              className="p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 w-[320px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-[1.5rem] p-8 flex flex-col items-center text-center">
                {feedbackStatus.type === 'success' ? (
                  <CheckCircle2 className="h-8 w-8 text-black mb-4" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-8 w-8 text-black mb-4" strokeWidth={1.5} />
                )}
                
                <h3 className="font-medium text-black text-lg">
                  {feedbackStatus.type === 'success' ? 'Acknowledged' : 'Failed'}
                </h3>
                
                <p className="text-xs text-black/50 mt-2 mb-8">
                  {feedbackStatus.message}
                </p>

                <button 
                  onClick={() => setFeedbackStatus(null)}
                  className="w-full bg-black/5 hover:bg-black/10 border border-black/5 text-black py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadFile;