"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Clock, User, Calendar, ArrowLeft, Crown, X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import MainHeader from "@/src/components/mainHeader";

// --- INTERFACES ---

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
      
      // Format: 08/07/2026 - 02:42 
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
  // History List States
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal States
  const [selectedDetail, setSelectedDetail] = useState<HistoryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyList.length / itemsPerPage);

  // User LocalStorage Data (Sửa lỗi chính tả "Undifine")
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

  // Handle viewing specific history details
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

  // Lightbox navigation hooks
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 relative text-white selection:bg-fuchsia-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent opacity-60"></div>
      
      <div className="w-full z-50">
        <MainHeader />
      </div>

      <div className="max-w-5xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-fuchsia-200 hover:text-white font-medium mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE CARD */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-md border border-fuchsia-400/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(217,70,239,0.15)] h-fit">
            <div className="flex flex-col items-center text-center border-b border-fuchsia-400/30 pb-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_15px_rgba(217,70,239,0.5)] mb-4 uppercase border-2 border-white/20">
                {userInfo.username.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5 drop-shadow-md">
                {userInfo.is_pro === "true" || userInfo.is_pro === "True" ? (
                  <>
                    Premium User <Crown size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                  </>
                ) : (
                  "Normal User"
                )}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-fuchsia-100 text-sm">
                <User size={16} className="text-fuchsia-300" />
                <span>Full Name: <strong className="text-white">{userInfo.username}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-fuchsia-100 text-sm">
                <Calendar size={16} className="text-fuchsia-300" />
                <span>Joined: <strong className="text-white">{formatDate(userInfo.created_at || "None")}</strong></span>
              </div>
            </div>
          </div>

          {/* HISTORY LIST */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-fuchsia-400/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(217,70,239,0.15)] flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 drop-shadow-md">
                <Clock size={18} className="text-fuchsia-400" /> Search History
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-400"></div>
                </div>
              ) : historyList.length === 0 ? (
                <p className="text-fuchsia-200 text-center py-8">No search history found.</p>
              ) : (
                <div className="divide-y divide-fuchsia-400/20">
                  {currentItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="py-4 flex items-center justify-between hover:bg-white/10 px-3 rounded-xl transition-colors cursor-pointer group"
                      onClick={() => handleViewDetail(Number(item.id || item._id))}
                    >
                      <div>
                        <p className="font-semibold text-white group-hover:text-fuchsia-300 transition-colors drop-shadow-sm">
                          {item.search_term || "Visual Query Search"}
                        </p>
                        <p className="text-xs text-fuchsia-200 mt-1">
                          {formatDate(item.date ?? item.created_at ?? "")}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-white bg-fuchsia-600/50 border border-fuchsia-400/50 px-3 py-1.5 rounded-full group-hover:bg-fuchsia-500/80 group-hover:shadow-[0_0_10px_rgba(217,70,239,0.5)] transition-all">
                        View Results
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && historyList.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-fuchsia-400/30 pt-4 mt-6">
                <span className="text-sm text-fuchsia-200">
                  Page <strong className="text-white">{currentPage}</strong> on <strong className="text-white">{totalPages}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-white/20"
                  >
                    pre
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-lg hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- HISTORY DETAIL MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#1e1b4b]/90 rounded-2xl border border-fuchsia-400/30 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-[0_0_30px_rgba(217,70,239,0.3)] flex flex-col text-white backdrop-blur-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-fuchsia-400/30 flex items-center justify-between sticky top-0 bg-[#1e1b4b]/95 z-10 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white drop-shadow-md">Search Session Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-fuchsia-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1">
              {isDetailLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-400"></div>
                  <p className="text-fuchsia-200 text-sm">Fetching search results...</p>
                </div>
              ) : selectedDetail ? (
                <>
                  {/* Query Info Meta */}
                  <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-fuchsia-100">
                    <div>
                      <span className="font-medium text-fuchsia-300 block mb-0.5">Top-K Requested:</span>
                      <span className="font-semibold text-white">{selectedDetail.top_k_requested}</span>
                    </div>
                    <div>
                      <span className="font-medium text-fuchsia-300 block mb-0.5">Executed At:</span>
                      <span className="font-semibold text-white text-xs">{formatDate(selectedDetail.created_at)} </span>
                    </div>
                  </div>

                  {/* Image Grid Area */}
                  <div>
                    <h4 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-3">Returned Images</h4>
                    {!selectedDetail.results || selectedDetail.results.length === 0 ? (
                      <p className="text-sm text-fuchsia-200/70">No matching image metrics returned.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {selectedDetail.results.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/40 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:border-fuchsia-400/50 transition-all"
                            onClick={() => setActiveLightboxIdx(index)}
                          >
                            <img
                              src={item.image_base64}
                              alt={`Result view ${index}`}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
                              <ImageIcon size={20} />
                              <span className="text-xs font-medium">Click to Zoom</span>
                            </div>
                            {item.score !== undefined && (
                              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-[10px] text-fuchsia-200 px-2 py-0.5 rounded border border-white/10 font-mono">
                                Score: {item.score.toFixed(4)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  {(selectedDetail.feedback_rating > 0 || selectedDetail.feedback_comment) && (
                    <div className="border-t border-fuchsia-400/30 pt-6">
                      <h4 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-3">Your Feedback</h4>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-fuchsia-400/20">
                        <p className="text-sm font-semibold text-yellow-400 drop-shadow-sm">
                          Rating: {"⭐".repeat(selectedDetail.feedback_rating)}
                        </p>
                        {selectedDetail.feedback_comment && (
                          <p className="text-sm text-fuchsia-100 mt-1.5 italic">
                            "{selectedDetail.feedback_comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-fuchsia-300/70">Failed to render detail metadata.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX OVERLAY --- */}
      {activeLightboxIdx !== null && selectedDetail?.results && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xs select-none"
          onClick={() => setActiveLightboxIdx(null)}
        >
          {/* Close Trigger Button */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2.5 rounded-full transition-colors cursor-pointer z-50"
            onClick={() => setActiveLightboxIdx(null)}
          >
            <X size={24} />
          </button>

          {/* Previous Selection Action */}
          <button
            className="absolute left-6 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            onClick={handlePrevImage}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Display Dynamic Main Image Wrapper */}
          <div
            className="max-w-[85vw] max-h-[85vh] flex flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedDetail.results[activeLightboxIdx].image_base64}
              alt={`Zoomed item view ${activeLightboxIdx}`}
              className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
            />

            {/* Context Meta Subtext */}
            <div className="text-white/80 text-sm flex items-center gap-4 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
              <span className="font-medium">
                {activeLightboxIdx + 1} / {selectedDetail.results.length}
              </span>
              {selectedDetail.results[activeLightboxIdx].score !== undefined && (
                <span className="bg-blue-600 px-2.5 py-0.5 rounded text-xs font-mono">
                  Score: {selectedDetail.results[activeLightboxIdx].score?.toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Next Selection Action */}
          <button
            className="absolute right-6 p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            onClick={handleNextImage}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}