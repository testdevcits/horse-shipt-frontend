import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuCircleChevronRight } from "react-icons/lu";
import {
  MdCheckCircle,
  MdAccessTime,
  MdHourglassEmpty,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { BsChatLeftQuote } from "react-icons/bs";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";

const QUOTES_PER_PAGE = 5;

const STATUS_CONFIG = {
  accepted: {
    label: "Accepted",
    icon: MdCheckCircle,
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  pending: {
    label: "Pending",
    icon: MdAccessTime,
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  rejected: {
    label: "Rejected",
    icon: MdHourglassEmpty,
    bg: "bg-red-100",
    text: "text-red-600",
  },
};

const ShipmentQuotes = ({
  quotes = [],
  loading = false,
  onSelectQuote,
  shipment,
  shipmentId,
  totalQuotes = 0,
  currentPage = 1,
  totalPages = 1,
}) => {
  const navigate = useNavigate();
  const { getQuotesByShipment, loading: fetchLoading } = useCustomerQuote();

  const [page, setPage] = useState(currentPage);

  // ---- Per-quote review navigation ----
  const handleReviewNavigate = (quote) => {
    const shipperId =
      quote?.shipper?._id || shipment?.shipperId || shipment?.shipper?._id;

    if (!shipperId) {
      alert("Shipper ID not found");
      return;
    }
    navigate(`/customer/reviews/${shipperId}`);
  };

  // ---- Pagination handler ----
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    getQuotesByShipment(shipmentId, true, newPage, QUOTES_PER_PAGE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = loading || fetchLoading;

  // Show pagination only when totalQuotes > 5
  const showPagination = totalQuotes > QUOTES_PER_PAGE;

  return (
    <div className="space-y-6">
      {/* ===================== HEADER ===================== */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BsChatLeftQuote className="w-6 h-6 text-[#BF9B53]" />
          <h2 className="text-2xl font-bold text-slate-900">Shipment Quotes</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#BF9B53] text-white rounded-full text-sm font-semibold">
            {totalQuotes} {totalQuotes === 1 ? "Quote" : "Quotes"}
          </div>
          <span className="text-[#BF9B53]">-</span>
          {totalQuotes > 0 && (
            <span className="text-sm text-slate-500">
              {quotes.filter((q) => q.status === "accepted").length} accepted
            </span>
          )}
        </div>
      </div>

      {/* ===================== LOADING STATE ===================== */}
      {isLoading ? (
        <div className="py-12">
          <PageLoader text="Loading quotes..." size={24} color="#BF9B53" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="py-8">
          <NoData
            title="No Quotes Yet"
            description="No shippers have submitted quotes for this shipment yet."
            showGoBack={false}
            showReload={false}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {quotes.map((quote) => {
              const statusKey = quote.status?.toLowerCase();
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const shipperName =
                quote.shipper?.companyName ||
                quote.shipper?.name ||
                "Unknown Shipper";

              return (
                <div
                  key={quote._id}
                  className="bg-white rounded-md border-2 border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#BF9B53]"
                >
                  {/* ---- QUOTE HEADER ---- */}
                  <div className="bg-gray-100 px-6 py-5 border-b-2 border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold text-black uppercase tracking-wider">
                          Quote from Shipper
                        </p>
                        <p className="text-lg font-bold text-slate-900 leading-relaxed">
                          {shipperName}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ${status.bg} ${status.text}`}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* ---- QUOTE BODY ---- */}
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 font-medium">
                        Total Price
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${quote.totalPrice}{" "}
                        <span className="text-sm font-medium text-slate-500">
                          USD
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => onSelectQuote(quote)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F2EBDD] border border-[#BF9B53] text-[#BF9B53] rounded-lg font-semibold text-sm hover:bg-[#BF9B53] hover:text-white transition-all duration-200"
                    >
                      View Details
                      <LuCircleChevronRight size={18} />
                    </button>
                  </div>

                  {/* ---- VIEW SHIPPER REVIEWS — per quote ---- */}
                  {quote.shipper && (
                    <div className="px-6 pb-4">
                      <button
                        onClick={() => handleReviewNavigate(quote)}
                        className="text-system-primary hover:opacity-80 transition text-sm font-medium bg-transparent border-none p-0 cursor-pointer underline underline-offset-2"
                      >
                        View Shipper Reviews
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ===================== PAGINATION ===================== */}
          {showPagination && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {/* Info */}
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(page - 1) * QUOTES_PER_PAGE + 1}–
                  {Math.min(page * QUOTES_PER_PAGE, totalQuotes)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalQuotes}
                </span>{" "}
                quotes
              </p>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:border-[#BF9B53] hover:text-[#BF9B53] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <MdChevronLeft size={20} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    // Show first, last, current ± 1, and ellipsis
                    const showPage =
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1;

                    const showEllipsisBefore = p === page - 2 && page - 2 > 1;
                    const showEllipsisAfter =
                      p === page + 2 && page + 2 < totalPages;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span
                          key={`ellipsis-${p}`}
                          className="px-2 text-slate-400 text-sm"
                        >
                          …
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all border ${
                          p === page
                            ? "bg-[#BF9B53] text-white border-[#BF9B53]"
                            : "border-slate-200 text-slate-600 hover:border-[#BF9B53] hover:text-[#BF9B53]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                )}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:border-[#BF9B53] hover:text-[#BF9B53] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <MdChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShipmentQuotes;
