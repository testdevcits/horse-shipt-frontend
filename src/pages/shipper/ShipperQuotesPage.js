import React, { useEffect, useRef, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import PageLoader from "../../components/common/PageLoader";
import NotFound from "../../components/common/NoData";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiTruckLine,
  RiFileTextLine,
  RiRefreshLine,
  RiTimeLine,
} from "react-icons/ri";
import { FiCreditCard, FiSearch } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { LuBoxes } from "react-icons/lu";
import { API_BASE_URL } from "../../config/api";

const hasAssignedVehicle = (quote) => {
  if (!quote?.vehicle) return false;
  if (typeof quote.vehicle === "string") return true;
  return Object.keys(quote.vehicle).length > 0;
};

const isCompletedQuote = (quote) =>
  quote?.tripStatus === "completed" ||
  quote?.shipment?.status === "delivered" ||
  quote?.shipment?.status === "completed";

const getQuoteDocumentUrl = (quoteId, documentType) =>
  `${API_BASE_URL}/shipper/quotes/${quoteId}/documents/${documentType}`;

const getDocumentFileName = (quote, documentType) => {
  const shipmentCode = quote?.shipment?.shipmentCode || quote?._id || "contract";
  if (documentType === "shipper") {
    return quote?.shipperContract?.originalName || `${shipmentCode}-shipper.pdf`;
  }
  return `${shipmentCode}.pdf`;
};

const extractDocumentError = async (response) => {
  let message = "Unable to load contract";

  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.message || message;
    }

    const text = await response.text();
    return (
      text
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() || message
    );
  } catch (error) {
    return message;
  }
};

const fetchQuoteDocument = async ({ quote, quoteId, documentType, token }) => {
  const response = await fetch(getQuoteDocumentUrl(quoteId, documentType), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(await extractDocumentError(response));

  const blob = await response.blob();
  const contentType = response.headers.get("content-type") || blob.type || "";
  const header = await blob.slice(0, 4).text();
  const isPdf = contentType.toLowerCase().includes("pdf") || header === "%PDF";
  const isImage = contentType.toLowerCase().startsWith("image/");

  if (!isPdf && !isImage) {
    throw new Error("Contract is not available as a supported document");
  }

  const type = isPdf ? "application/pdf" : contentType;
  return {
    url: URL.createObjectURL(
      new File([blob], getDocumentFileName(quote, documentType), {
        type,
      })
    ),
    type,
  };
};

const fetchQuoteDocumentUrl = async (args) => {
  const document = await fetchQuoteDocument(args);
  return document.url;
};

const openQuoteDocument = async (args) => {
  const openedWindow = window.open("", "_blank");

  if (openedWindow) {
    openedWindow.opener = null;
    openedWindow.document.write(
      "<!doctype html><title>Loading document</title><body style=\"margin:0;font-family:Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;color:#4b5563\">Loading document...</body>"
    );
    openedWindow.document.close();
  }

  try {
    const document = await fetchQuoteDocument(args);

    if (openedWindow) {
      openedWindow.location.href = document.url;
    } else {
      window.open(document.url, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => URL.revokeObjectURL(document.url), 60000);
  } catch (error) {
    if (openedWindow) {
      openedWindow.close();
    }
    throw error;
  }
};

const showDocumentToastError = (error) => {
  toast.error(error.message || "Unable to open contract");
};

const getHorseImages = (quote) =>
  (quote?.shipment?.horses || [])
    .map((horse) => ({
      id: horse._id || horse.name,
      url: horse.photo?.url,
      name: horse.registeredName || horse.name || horse.barnName || "Horse",
      breed: horse.breed || horse.breedName || "",
    }))
    .filter((horse) => horse.url);

const HorseImageStrip = ({ quote }) => {
  const horses = getHorseImages(quote);
  const firstHorse = horses[0];

  return firstHorse ? (
      <figure className="relative h-[242px] w-full self-start overflow-hidden rounded-[8px] bg-slate-100 lg:w-[223px]">
      <img
        src={firstHorse.url}
        alt={firstHorse.name}
        className="h-full w-full object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-3 pt-12">
        <p className="truncate text-[13px] font-bold leading-4 text-white">
          {firstHorse.name}
        </p>
        <p className="truncate text-[11px] font-semibold leading-4 text-white">
          {firstHorse.breed || `${horses.length} horse${horses.length > 1 ? "s" : ""}`}
        </p>
      </figcaption>
    </figure>
  ) : (
    <div className="flex h-[242px] w-full self-start items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:w-[223px]">
      No horse image
    </div>
  );
};

const formatTitleCase = (value = "") =>
  value
    .toString()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCurrency = (quote) => {
  const symbol = quote.currency && quote.currency !== "USD" ? quote.currency : "$";
  return `${symbol}${quote.totalPrice || 0}`;
};

const StatusBadge = ({ quote }) => {
  const isCancelled = quote.isCancelled || quote.status === "cancelled";
  const label = isCancelled ? "Cancelled" : formatTitleCase(quote.status || "Pending");

  return (
    <span
      className={`inline-flex h-[32px] items-center gap-1 rounded-[4px] border px-3 text-[11px] font-bold uppercase ${isCancelled
        ? "border-red-400 bg-red-50 text-red-600"
        : quote.status === "accepted"
          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
          : "border-[#BF9B53] bg-[#FBF9F4] text-[#735D32]"
        }`}
    >
      <RiCheckboxCircleLine size={13} />
      {label}
    </span>
  );
};

const QuoteFact = ({ icon, label, value }) => (
  <div className="flex w-[136px] min-w-0 items-center gap-3 py-1 pr-6 sm:w-[145px]">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-gray-100 bg-[#FBFAF8] text-[#735D32]">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="font-montserrat text-[10px] font-medium leading-[16px] tracking-[0%] text-[#4B5563]">
        {label}
      </p>
      <p className="truncate font-montserrat text-[12px] font-semibold leading-[20px] tracking-[0%] text-[#4B5563]">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const tabIcons = {
  all: <RiCheckboxCircleLine size={14} />,
  in_transit: <RiTruckLine size={14} />,
  upcoming: <RiTimeLine size={14} />,
  cancelled: <RiCloseCircleLine size={14} />,
  pending: <RiRefreshLine size={14} />,
};

const ContractPreview = ({ quote, token }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const contractUrl = quote?.contract?.url;
  const quoteId = quote?._id;
  const shipmentCode = quote?.shipment?.shipmentCode;
  const shipperContractName = quote?.shipperContract?.originalName;

  useEffect(() => {
    let objectUrl = "";
    let active = true;

    const loadContract = async () => {
      try {
        setError("");
        const nextUrl = await fetchQuoteDocumentUrl({
          quote: {
            _id: quoteId,
            shipment: { shipmentCode },
            shipperContract: { originalName: shipperContractName },
          },
          quoteId,
          documentType: "generated",
          token,
        });
        objectUrl = nextUrl;
        if (active) setPreviewUrl(nextUrl);
      } catch (err) {
        if (active) setError(err.message || "Unable to load contract");
      }
    };

    if (contractUrl && token && quoteId) loadContract();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contractUrl, quoteId, shipmentCode, shipperContractName, token]);

  if (!contractUrl) return null;

  return (
    <div className="mt-4 border overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white">
        <span className="text-sm font-semibold text-gray-700">
          Contract Preview
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await openQuoteDocument({
                quote,
                quoteId: quote._id,
                documentType: "generated",
                token,
              });
            } catch (err) {
              showDocumentToastError(err);
            }
          }}
          className="text-sm font-semibold text-[#BF9B53] hover:underline"
        >
          Open full contract
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm font-semibold text-red-600">{error}</div>
      )}

      {!error && !previewUrl && (
        <div className="flex h-[220px] items-center justify-center text-sm font-semibold text-slate-600">
          Loading contract...
        </div>
      )}

      {previewUrl && (
        <iframe
          src={previewUrl}
          title={`Contract ${quote._id}`}
          className="w-full h-[520px] bg-white"
        />
      )}
    </div>
  );
};

const ShipperQuotesPage = () => {
  const { token } = useAuth();
  const {
    quotes,
    loading,
    getMyQuotes,
    cancelQuote,
    deleteQuote,
    assignVehicleToQuote,
  } = useShipperQuote();

  const navigate = useNavigate();

  const [visibleContractId, setVisibleContractId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const tabsContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");

  const isInTransitQuote = (quote) => {
    if (!quote || quote.isCancelled || quote.status === "cancelled") return false;
    if (isCompletedQuote(quote)) return false;

    return hasAssignedVehicle(quote);
  };

  const showToast = (message, type = "info") => {
    toast[type](message);
  };

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/shipper/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data.vehicles || []);
      } catch (err) {
        showToast("Failed to fetch vehicles", "error");
      }
    };
    fetchVehicles();
  }, [token]);

  if (loading) return <PageLoader />;

  const filteredQuotes = quotes
    .filter((quote) => {
      const code = quote.shipment?.shipmentCode || "";
      return code.slice(-6).toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((quote) => {
      switch (activeTab) {
        case "in_transit":
          return isInTransitQuote(quote);
        case "upcoming":
          return (
            quote.status === "accepted" &&
            !quote.isCancelled &&
            !isInTransitQuote(quote)
          );
        case "cancelled":
          return quote.isCancelled;
        case "pending":
          return quote.status === "pending";
        default:
          return true;
      }
    });

  const openModal = (quote, type) => {
    setSelectedQuote(quote);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
  };

  const handleAction = async () => {
    if (!selectedQuote) return;
    setActionLoading(true);

    let res;
    if (modalType === "cancel") res = await cancelQuote(selectedQuote._id);
    else if (modalType === "delete") res = await deleteQuote(selectedQuote._id);

    if (res?.success) {
      showToast(
        modalType === "cancel"
          ? "Shipment cancelled"
          : "Quote deleted successfully",
        "success"
      );
      getMyQuotes();
    } else {
      showToast("Action failed", "error");
    }

    setActionLoading(false);
    closeModal();
  };

  const tabData = [
    { key: "all", label: "All Quotes", count: quotes.length },
    {
      key: "in_transit",
      label: "In Transit",
      count: quotes.filter((q) => isInTransitQuote(q)).length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: quotes.filter(
        (q) => q.status === "accepted" && !q.isCancelled && !isInTransitQuote(q)
      ).length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: quotes.filter((q) => q.isCancelled).length,
    },
    {
      key: "pending",
      label: "Pending",
      count: quotes.filter((q) => q.status === "pending").length,
    },
  ];

  return (
    <div className="w-full mx-auto font-[Montserrat]">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-montserrat text-[28px] font-semibold leading-[38px] text-[#111827] sm:text-[32px] sm:leading-[44px] lg:text-[36px] lg:leading-[50px]">
            My Quotes
          </h2>
          <p className="mt-3 font-montserrat text-[14px] font-medium leading-[24px] tracking-[0%] text-[#4B5563]">
            Review shipment offers, contracts, vehicles, and payment status.
          </p>
        </div>
        <div className="relative w-full md:w-[56%]">
          <input
            type="text"
            placeholder="Search by last 6 characters of shipment ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[38px] w-full border border-gray-100 bg-white px-4 pl-10 text-[12px] font-medium text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/15"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch size={16} />
          </span>
        </div>{" "}
        <button
          onClick={() => navigate(-1)}
          className="fixed bottom-6 right-6 z-30 bg-gray-600 p-3 text-white shadow-lg transition hover:bg-[#BF9B53]"
          title="Back"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
      </div>

      {/* TABS */}
      <div
        ref={tabsContainerRef}
        className="mb-6 flex h-auto gap-8 overflow-x-auto bg-white px-5 pt-3 scrollbar-hide sm:h-[47px]"
      >
        {tabData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              const tabButton = document.getElementById(`tab-${tab.key}`);
              tabButton?.scrollIntoView({
                behavior: "smooth",
                inline: "start",
              });
            }}
            id={`tab-${tab.key}`}
            className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 font-montserrat text-[14px] font-semibold leading-[20px] tracking-[0%] transition whitespace-nowrap ${activeTab === tab.key
              ? "border-[#BF9B53] text-[#BF9B53]"
              : "border-transparent text-[#4B5563] hover:text-[#BF9B53]"
              }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">{tabIcons[tab.key]}</span>
            <span>{tab.label}</span>
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-[2px] px-1 font-montserrat text-[11px] font-bold leading-none transition ${activeTab === tab.key
                ? "bg-[#FFF1D5] text-[#BF9B53]"
                : "bg-gray-200 text-gray-500"
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* QUOTES LIST */}
      {filteredQuotes.length === 0 ? (
        <NotFound />
      ) : (
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => {
            const isExpired =
              quote.cancellationLastDate &&
              new Date() > new Date(quote.cancellationLastDate);
            const canDelete = !quote.contractAccepted;
            const isCompleted = isCompletedQuote(quote);
            const shipment = quote.shipment || {};
            const vehicle = quote.vehicle || {};
            const tripStatus = formatTitleCase(quote.tripStatus || "notStarted");

            return (
              <div
                key={quote._id}
                className="bg-white p-3 shadow-sm transition hover:shadow-md sm:p-4"
              >
                <div className="grid gap-5 lg:grid-cols-[223px_minmax(0,1fr)] lg:gap-6">
                  <HorseImageStrip quote={quote} />

                  <div className="min-w-0">
                    <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h2 className="flex min-w-0 items-center gap-2 text-[16px] font-bold leading-6 text-gray-700 sm:text-[17px]">
                          <RiFileTextLine className="shrink-0 text-[#735D32]" size={20} />
                          <span className="min-w-0 break-words">
                            {shipment.shipmentCode || "Shipment"}
                          </span>
                        </h2>
                        <p className="mt-1 break-words font-montserrat text-[12px] font-medium leading-[20px] tracking-[0%] text-[#735D32]">
                          {shipment.pickupLocation || "Pickup N/A"} TO{" "}
                          {shipment.deliveryLocation || "Delivery N/A"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-row items-center justify-between gap-3 lg:flex-col lg:items-end">
                        <StatusBadge quote={quote} />
                        <span className="text-[22px] font-bold leading-7 text-[#BF9B53]">
                          {formatCurrency(quote)}
                        </span>
                      </div>
                    </header>

                    <div className="mt-5 flex w-fit max-w-full flex-wrap items-center gap-x-7 gap-y-4 overflow-hidden [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-gray-200">
                      <QuoteFact
                        icon={<RiTruckLine size={16} />}
                        label="Transport"
                        value={quote.transportType || "Trucking"}
                      />
                      <QuoteFact
                        icon={<FiCreditCard size={15} />}
                        label="Payment"
                        value={`${quote.paymentMethod || "card"} / ${quote.paymentStatus || "pending"
                          }`}
                      />
                      <QuoteFact
                        icon={<LuBoxes size={15} />}
                        label="Stalls"
                        value={quote.stallsRequired || "01"}
                      />
                      <QuoteFact
                        icon={<RiRefreshLine size={16} />}
                        label="Refund"
                        value={quote.refundStatus || "Pending"}
                      />
                    </div>

                    {quote.vehicle && (
                      <p className="mt-5 flex items-start gap-2 bg-[#F3F4F6] px-3 py-3 text-[13px] font-semibold leading-5 text-gray-700 ">
                        <RiTruckLine
                          className="shrink-0 text-[#735D32]"
                          size={18}
                        />
                        <span className="flex flex-wrap items-center gap-3 font-montserrat text-[13px] font-semibold leading-[22px] text-[#374151] sm:text-[14px] sm:leading-[24px]">
                          <span>Vehicle: {vehicle.vehicleNumber || "N/A"}</span>
                          <span className="text-[#9CA3AF]">|</span>
                          <span>{vehicle.vehicleType || "N/A"}</span>
                          <span className="text-[#9CA3AF]">|</span>
                          <span>{vehicle.numberOfStalls || 0} stalls</span>
                          <span className="text-[#9CA3AF]">|</span>
                          <span>Trip: {tripStatus}</span>
                          <span className="text-[#9CA3AF]">|</span>
                          <span>Driver: {vehicle?.driver?.name || "N/A"}</span>
                        </span>
                      </p>
                    )}

                    {!quote.vehicle &&
                      quote.status === "accepted" &&
                      !quote.isCancelled &&
                      !isCompleted && (
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setVehicleModalOpen(true);
                          }}
                          className="mt-5 bg-[#BF9B53] px-4 py-2 text-[12px] font-bold uppercase text-white transition hover:bg-[#a6813f]"
                        >
                          Assign Vehicle
                        </button>
                      )}

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <p className="flex items-start gap-2 border border-[#D9AF57] bg-[#FFF9EC] px-3 py-3 text-[14px] leading-5 text-gray-700 sm:px-4">
                        <RiFileTextLine className="shrink-0 text-[#735D32]" size={17} />
                        <span className="min-w-0 break-words font-montserrat leading-[24px] tracking-[0%]">
                          <span className="font-semibold text-[#BF9B53]">Notes:</span>{" "}
                          <span className="font-medium text-[#4B5563]">
                            {quote.notes
                              ? quote.notes.length > 80
                                ? `${quote.notes.slice(0, 150).split(" ").slice(0, -1).join(" ")}...`
                                : quote.notes
                              : "N/A"}
                          </span>
                        </span>
                      </p>

                      {quote.isCancelled ? (
                        <p className="flex items-start gap-2 border border-red-300 bg-red-50 px-3 py-3 text-[12px] font-semibold leading-5 text-[#BF5353] sm:px-4">
                          <RiCloseCircleLine className="shrink-0" size={17} />
                          <span className="min-w-0 break-words">
                            Cancelled{" "}
                            {quote.cancelledAt
                              ? new Date(quote.cancelledAt).toLocaleString()
                              : ""}
                            {quote.cancelReason
                              ? ` | Reason: ${quote.cancelReason}`
                              : ""}
                          </span>
                        </p>
                      ) : quote.cancellationLastDate ? (
                        <p className="flex items-start gap-2 border border-red-300 bg-red-50 px-3 py-3 text-[12px] font-semibold leading-5 text-[#BF5353] sm:px-4">
                          <RiCalendarEventLine className="shrink-0" size={17} />
                          <span className="min-w-0 break-words">
                            {isExpired
                              ? "Cancellation expired"
                              : `Cancel before: ${new Date(
                                quote.cancellationLastDate
                              ).toLocaleString()}`}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <footer className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {quote.contract?.url && (
                        <button
                          onClick={() =>
                            setVisibleContractId(
                              visibleContractId === quote._id ? null : quote._id
                            )
                          }
                          className="h-[38px] w-full bg-[#BF9B53] px-5 text-[12px] font-bold uppercase text-white transition hover:bg-[#a6813f] sm:h-[34px] sm:w-auto"
                        >
                          {visibleContractId === quote._id
                            ? "Hide Contract"
                            : "View Contract"}
                        </button>
                      )}

                      {quote.shipperContract?.url && (
                        <button
                          onClick={async () => {
                            try {
                              await openQuoteDocument({
                                quote,
                                quoteId: quote._id,
                                documentType: "shipper",
                                token,
                              });
                            } catch (err) {
                              showDocumentToastError(err);
                            }
                          }}
                          className="h-[38px] w-full border border-[#BF9B53] px-4 text-[12px] font-bold uppercase text-[#735D32] transition hover:bg-[#BF9B53]/10 sm:h-[34px] sm:w-auto"
                        >
                          View Shipper Contract
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => openModal(quote, "delete")}
                          className="flex h-[38px] w-full items-center justify-center gap-1 border border-slate-300 px-4 text-[12px] font-bold uppercase text-slate-700 transition hover:bg-slate-50 sm:h-[34px] sm:w-auto"
                        >
                          <RiDeleteBinLine /> Delete
                        </button>
                      )}

                      {activeTab !== "pending" &&
                        quote.status !== "pending" &&
                        !isExpired &&
                        !quote.isCancelled &&
                        !isCompleted && (
                          <button
                            onClick={() => openModal(quote, "cancel")}
                            className="flex h-[38px] w-full items-center justify-center gap-1 border border-red-500 px-4 text-[12px] font-bold uppercase text-red-600 transition hover:bg-red-50 sm:h-[34px] sm:w-auto lg:ml-auto"
                          >
                            <RiCloseCircleLine /> Cancel Quote
                          </button>
                        )}
                    </footer>

                    {visibleContractId === quote._id && (
                      <ContractPreview quote={quote} token={token} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL / DELETE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-xl shadow-xl p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {modalType === "cancel" ? "Cancel Shipment" : "Delete Quote"}
              </h3>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* MESSAGE */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {modalType === "cancel"
                ? "Are you sure you want to cancel this shipment?"
                : "This quote is not accepted. Are you sure you want to delete it?"}
            </p>

            {modalType === "cancel" &&
              selectedQuote?.paymentStatus === "paid" && (
                <div className=" border border-red-200 p-4 mb-5 space-y-3">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    Cancellation Charges Will Apply
                  </p>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    The customer has already completed the payment for this
                    shipment. If you cancel now, the customer will receive a{" "}
                    <b>100% refund</b>.
                  </p>

                  <div className="bg-white border p-3 text-xs text-gray-700 space-y-1">
                    <p>You (Shipper) will be charged:</p>
                    <p className="ml-2">- Platform service fee</p>
                    <p className="ml-2">- Payment processing fee</p>
                  </div>

                  <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] text-xs p-4">
                    These charges will be automatically deducted from your saved
                    payment method (card).
                  </div>
                </div>
              )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3">
              {/* NO BUTTON */}
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>

              {/* YES BUTTON */}
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white transition flex items-center justify-center min-w-[120px] ${actionLoading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {actionLoading ? "Processing..." : "Yes, Cancel Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE ASSIGN MODAL */}
      {vehicleModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-3">Assign Vehicle</h3>
            <select
              value={selectedVehicleId || ""}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full p-2 border mb-4"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} - {v.vehicleType} ({v.numberOfStalls}{" "}
                  stalls)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="px-4 py-2 bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedVehicleId)
                    return showToast("Select a vehicle", "error");
                  const res = await assignVehicleToQuote(
                    selectedQuote._id,
                    selectedVehicleId
                  );
                  if (res?.success) {
                    showToast("Vehicle assigned", "success");
                    setVehicleModalOpen(false);
                    setSelectedVehicleId(null);
                    setActiveTab("in_transit");
                    getMyQuotes();
                  } else showToast("Failed to assign vehicle", "error");
                }}
                className="px-4 py-2 bg-[#997C42] text-white"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShipperQuotesPage;
