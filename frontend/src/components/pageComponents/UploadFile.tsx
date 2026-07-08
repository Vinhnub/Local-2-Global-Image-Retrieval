"use client";

import api from "@/lib/axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { CircleOff, CircleX } from "lucide-react";

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
      toast.error("Query ID not found.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/api/v1/feedback/submit", {
        query_id: queryId,
        rating,
        comment,
      });

      toast.success(res.data.message || "Feedback submitted successfully!");
      setComment("");
      setRating(0);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail ?? "An error occurred.");
      } else {
        toast.error("Undefined error.");
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
        className={`group rounded-2xl border-2 border-dashed border-gray-300 hover:border-black transition-all duration-700 cursor-pointer flex flex-col items-center justify-center bg-white/40 hover:bg-white overflow-hidden relative
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
            <svg
              className="w-14 h-14 text-white group-hover:text-black transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
            <p className="text-lg font-semibold text-white group-hover:text-black transition-colors">
              Click to upload image
            </p>
            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className={`flex flex-col gap-4 text-black transition-all duration-500 bg-white p-5 rounded-2xl ${mini ? "w-[25%] opacity-100" : "w-0 opacity-0 pointer-events-none hidden"} `}>
        <h2 className="font-semibold text-lg">Feedback</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`w-8 h-8 rounded-full border transition font-medium
                ${rating === num ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:bg-gray-100"}`}
            >
              {num}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          className="border rounded-lg p-3 w-full h-24 resize-none focus:outline-none focus:border-black"
        />

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition disabled:bg-gray-400"
          onClick={handleFeedback}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>

      {/* POPUP UPLOAD PROGRESS */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-[350px] flex flex-col items-center shadow-2xl border border-gray-100">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Retrieving Images...</h3>
            <div className="relative flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
              <div className="absolute h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <span className="absolute text-sm font-semibold text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {uploadProgress < 100 ? "Uploading and processing image..." : "Finalizing results..."}
            </p>
          </div>
        </div>
      )}

      {showNeedLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-[350px] flex flex-col items-center shadow-2xl border border-gray-100 relative gap-3">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Login now!</h3>
            
            <div className="relative flex items-center justify-center mb-4 text-red">
              <CircleX className="animate-bounce w-20 h-20" color="red"/>
            </div>
            
            <p className="text-sm text-gray-500 text-center mb-4">
              You need to log in to execute image retrieval.
            </p>

            <button 
              onClick={() => setShowNeedLogin(false)}
              className="mt-2 w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadFile;