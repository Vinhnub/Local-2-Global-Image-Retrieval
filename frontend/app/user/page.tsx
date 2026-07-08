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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full top-0 left-0 sticky">
        <MainHeader />
      </div>

      <div className="max-w-5xl mx-auto pt-32">
        {/* Back Button */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROFILE CARD */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
            <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4 uppercase">
                {userInfo.username.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-1.5">
                {userInfo.is_pro === "true" || userInfo.is_pro === "True" ? (
                  <>
                    Premium User <Crown size={16} className="text-amber-500 fill-amber-500" />
                  </>
                ) : (
                  "Normal User"
                )}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <User size={16} className="text-gray-400" />
                <span>Full Name: {userInfo.username}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>Joined: {formatDate(userInfo.created_at || "None")}</span>
              </div>
            </div>
          </div>

          {/* HISTORY LIST */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" /> Search History
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : historyList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No search history found.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {currentItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="py-4 flex items-center justify-between hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                      onClick={() => handleViewDetail(Number(item.id || item._id))}
                    >
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {item.search_term || "Visual Query Search"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(item.date ?? item.created_at ?? "")}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-100 transition-colors">
                        View Results
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && historyList.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                <span className="text-sm text-gray-500">
                  Page <strong className="text-gray-700">{currentPage}</strong> on <strong className="text-gray-700">{totalPages}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200"
                  >
                    pre
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">Search Session Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1">
              {isDetailLoading ? (
                <div className="flex flex-col justify-center items-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-gray-400 text-sm">Fetching search results...</p>
                </div>
              ) : selectedDetail ? (
                <>
                  {/* Query Info Meta */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-400 block mb-0.5">Top-K Requested:</span>
                      <span className="font-semibold text-gray-800">{selectedDetail.top_k_requested}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-400 block mb-0.5">Executed At:</span>
                      <span className="font-semibold text-gray-800 text-xs">{formatDate(selectedDetail.created_at)} </span>
                    </div>
                  </div>

                  {/* Image Grid Area */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Returned Images</h4>
                    {!selectedDetail.results || selectedDetail.results.length === 0 ? (
                      <p className="text-sm text-gray-400">No matching image metrics returned.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {selectedDetail.results.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="relative group overflow-hidden rounded-xl border border-gray-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => setActiveLightboxIdx(index)}
                          >
                            <img
                              src={item.image_base64}
                              alt={`Result view ${index}`}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
                              <ImageIcon size={20} />
                              <span className="text-xs font-medium">Click to Zoom</span>
                            </div>
                            {item.score !== undefined && (
                              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-mono">
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
                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Your Feedback</h4>
                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-50">
                        <p className="text-sm font-semibold text-blue-800">
                          Rating: {"⭐".repeat(selectedDetail.feedback_rating)}
                        </p>
                        {selectedDetail.feedback_comment && (
                          <p className="text-sm text-gray-600 mt-1.5 italic">
                            "{selectedDetail.feedback_comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500">Failed to render detail metadata.</p>
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