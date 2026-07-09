"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Clock, User, Calendar, ArrowLeft, Crown, X, Image as ImageIcon, ChevronLeft, ChevronRight, Hash, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import MainHeader from "@/src/components/mainHeader";
import { motion, AnimatePresence } from "motion/react";

interface HistoryItem {
  _id: string;
  search_term: string;
  date: string;
  id?: string;
  created_at?: string;
}

interface ResultImageItem {
  id?: string | number;
  image_base64: string;
  score?: number;
}

interface HistoryDetail {
  id: number;
  image_path: string;
  top_k_requested: number;
  created_at: string;
  results: ResultImageItem[];
  feedback_rating: number;
  feedback_comment: string;
}

export default function UserProfilePage() {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDetail, setSelectedDetail] = useState<HistoryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyList.length / itemsPerPage);

  const [userInfo, setUserInfo] = useState({
    id: "None",
    username: "Undefined",
    is_pro: "False",
    pro_expire_date: "Undefined",
    created_at: "Undefined",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserInfo({
        id: localStorage.getItem("id") || "None",
        username: localStorage.getItem("username") || "Undefined",
        is_pro: localStorage.getItem("is_pro") || "False",
        pro_expire_date: localStorage.getItem("pro_expire_date") || "Undefined",
        created_at: localStorage.getItem("created_at") || "Undefined",
      });
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/v1/history/");
        if (res.data) {
          setHistoryList(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewDetail = async (queryId: number) => {
    setIsModalOpen(true);
    setIsDetailLoading(true);
    setSelectedDetail(null);
    setActiveLightboxIdx(null);

    try {
      const res = await api.get(`/api/v1/history/${queryId}`);
      if (res.data) {
        setSelectedDetail(res.data);
      }
    } catch (error) {
      console.error("Error fetching history detail:", error);
      alert("Failed to load search results detail.");
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDetail?.results && activeLightboxIdx !== null) {
      setActiveLightboxIdx((prev) =>
        prev !== null && prev > 0 ? prev - 1 : selectedDetail.results.length - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDetail?.results && activeLightboxIdx !== null) {
      setActiveLightboxIdx((prev) =>
        prev !== null && prev < selectedDetail.results.length - 1 ? prev + 1 : 0
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] selection:bg-black/10 selection:text-black font-sans relative overflow-x-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 pointer-events-none"></div>
      
      <div className="w-full z-50">
        <MainHeader />
      </div>

      <div className="max-w-5xl mx-auto pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-black/40 hover:text-black font-semibold text-sm mb-8 transition-colors group cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm border border-black/5 w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE CARD */}
          <div className="lg:col-span-1 bg-white border border-black/5 rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] h-fit">
            <div className="flex flex-col items-center text-center border-b border-black/5 pb-8 mb-8">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-3xl font-extrabold mb-4 shadow-md uppercase border-4 border-white">
                {userInfo.username.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-black flex items-center gap-1.5">
                {userInfo.is_pro === "true" || userInfo.is_pro === "True" ? (
                  <>
                    Premium User <Crown size={16} className="text-yellow-600 fill-yellow-500" />
                  </>
                ) : (
                  "Standard User"
                )}
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3 text-black/60 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black">
                  <User size={16} />
                </div>
                <span>Full Name: <strong className="text-black ml-1">{userInfo.username}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-black/60 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black">
                  <Calendar size={16} />
                </div>
                <span>Joined: <strong className="text-black ml-1">{formatDate(userInfo.created_at || "None")}</strong></span>
              </div>
            </div>
          </div>

          {/* HISTORY LIST */}
          <div className="lg:col-span-2 bg-white border border-black/5 rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[500px]">
            <div>
              <h3 className="text-xl font-bold text-black mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black border border-black/5">
                  <Clock size={18} />
                </div>
                Search History
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-black/10 border-t-black"></div>
                </div>
              ) : historyList.length === 0 ? (
                <div className="bg-[#F5F5F7] rounded-2xl p-8 text-center text-black/40 font-medium">
                  No search history found.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {currentItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="p-4 flex items-center justify-between bg-white border border-black/5 hover:border-black/10 rounded-[1.25rem] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                      onClick={() => handleViewDetail(Number(item.id || item._id))}
                    >
                      <div>
                        <p className="font-bold text-black group-hover:text-black/70 transition-colors text-sm">
                          {item.search_term || "Visual Query Search"}
                        </p>
                        <p className="text-xs text-black/40 mt-1 font-medium">
                          {formatDate(item.date ?? item.created_at ?? "")}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-black bg-[#F5F5F7] px-4 py-2 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                        View Results
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && historyList.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-8">
                <span className="text-xs font-medium text-black/40 uppercase tracking-widest">
                  Page <strong className="text-black">{currentPage}</strong> / <strong className="text-black">{totalPages}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-xs font-bold text-black bg-[#F5F5F7] rounded-full hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-xs font-bold text-white bg-black rounded-full hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- HISTORY DETAIL MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] border border-black/5 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col text-black shadow-2xl"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#F5F5F7]/80 backdrop-blur-md">
                <h3 className="text-lg font-bold text-black">Session Detail</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-black/40 hover:bg-black/10 hover:text-black transition-colors cursor-pointer bg-white shadow-sm border border-black/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-white">
                {isDetailLoading ? (
                  <div className="flex flex-col justify-center items-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-black"></div>
                    <p className="text-black/40 text-sm font-medium">Fetching details...</p>
                  </div>
                ) : selectedDetail ? (
                  <>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-[#F5F5F7] border border-black/5 p-5 rounded-[1.5rem]">
                        <span className="font-bold text-black/40 text-xs uppercase tracking-widest block mb-1">Top-K</span>
                        <span className="font-bold text-black text-xl">{selectedDetail.top_k_requested}</span>
                      </div>
                      <div className="flex-1 bg-[#F5F5F7] border border-black/5 p-5 rounded-[1.5rem]">
                        <span className="font-bold text-black/40 text-xs uppercase tracking-widest block mb-1">Date</span>
                        <span className="font-bold text-black text-lg">{formatDate(selectedDetail.created_at)} </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Results</h4>
                      {!selectedDetail.results || selectedDetail.results.length === 0 ? (
                        <div className="bg-[#F5F5F7] p-8 rounded-[1.5rem] text-center text-sm font-medium text-black/40">
                          No matching image metrics returned.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          {selectedDetail.results.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="relative group overflow-hidden rounded-2xl bg-black/5 cursor-pointer hover:shadow-lg transition-all border border-black/5"
                              onClick={() => setActiveLightboxIdx(index)}
                            >
                              <img
                                src={item.image_base64}
                                alt={`Result view ${index}`}
                                className="w-full h-32 object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 text-black backdrop-blur-sm">
                                <ImageIcon size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Zoom</span>
                              </div>
                              {item.score !== undefined && (
                                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md text-[10px] font-bold text-black px-2 py-0.5 rounded shadow-sm border border-black/5 font-mono">
                                  {(item.score * 100).toFixed(1)}%
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {(selectedDetail.feedback_rating > 0 || selectedDetail.feedback_comment) && (
                      <div className="border-t border-black/5 pt-8">
                        <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Feedback</h4>
                        <div className="bg-[#F5F5F7] rounded-[1.5rem] p-6 border border-black/5">
                          <p className="text-sm font-bold text-yellow-600 mb-2">
                            Rating: {"⭐".repeat(selectedDetail.feedback_rating)}
                          </p>
                          {selectedDetail.feedback_comment && (
                            <p className="text-sm text-black/70 font-medium italic">
                              "{selectedDetail.feedback_comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-black/40 font-medium">Failed to render detail metadata.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LIGHTBOX OVERLAY --- */}
      <AnimatePresence>
        {activeLightboxIdx !== null && selectedDetail?.results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl select-none"
            onClick={() => setActiveLightboxIdx(null)}
          >
            <button
              className="absolute top-6 right-6 text-black/40 hover:text-black bg-black/5 hover:bg-black/10 p-3 rounded-full transition-colors cursor-pointer z-50 border border-black/5"
              onClick={() => setActiveLightboxIdx(null)}
            >
              <X size={20} />
            </button>

            <button
              className="absolute left-6 p-4 rounded-full bg-black/5 hover:bg-black/10 text-black transition-all cursor-pointer hover:scale-105 active:scale-95 border border-black/5"
              onClick={handlePrevImage}
            >
              <ChevronLeft size={24} />
            </button>

            <div
              className="max-w-[85vw] max-h-[85vh] flex flex-col items-center justify-center gap-4 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-[2rem] bg-black/5 ring-1 ring-black/5 shadow-2xl">
                <img
                  src={selectedDetail.results[activeLightboxIdx].image_base64}
                  alt={`Zoomed item view ${activeLightboxIdx}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-[1.5rem] bg-white transition-all duration-300"
                />
              </div>

              <div className="text-black text-xs font-bold uppercase tracking-widest flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-black/5 shadow-sm">
                <span>
                  {activeLightboxIdx + 1} / {selectedDetail.results.length}
                </span>
                {selectedDetail.results[activeLightboxIdx].score !== undefined && (
                  <span className="text-black/40">|</span>
                )}
                {selectedDetail.results[activeLightboxIdx].score !== undefined && (
                  <span className="font-mono bg-black/5 px-2 py-1 rounded">
                    {(selectedDetail.results[activeLightboxIdx].score! * 100).toFixed(1)}% Match
                  </span>
                )}
              </div>
            </div>

            <button
              className="absolute right-6 p-4 rounded-full bg-black/5 hover:bg-black/10 text-black transition-all cursor-pointer hover:scale-105 active:scale-95 border border-black/5"
              onClick={handleNextImage}
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}