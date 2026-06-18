import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiRefreshCw,
  FiStar,
} from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { HeartHandshake, MessageSquareQuote } from "lucide-react";
import PageLoader from "../components/common/PageLoader";
import PageBanner from "../components/common/PageBanner";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://horse-shipt.vercel.app/api";
const CACHE_TTL = 5 * 60 * 1000;

let happyConsumersCache = {
  data: null,
  timestamp: 0,
};
let happyConsumersPending = null;

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "HC";

const getVisibleCount = () => {
  if (typeof window === "undefined") return 2;
  if (window.innerWidth < 640) return 1;
  return 2;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Stars = ({ rating = 0 }) => (
  <div className="flex items-center gap-1 text-[#BF9B53]">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar
        key={star}
        size={15}
        className={star <= Number(rating) ? "fill-current" : "text-slate-300"}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const customerName = review.customer?.name || "Happy Customer";
  const shipmentCode = review.shipment?.code;

  return (
    <article className="mx-2 flex h-full min-h-[390px] flex-col rounded-[32px] border border-[#E8DDC7] bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:mx-4 sm:min-h-[430px] sm:p-8 lg:min-h-[460px] lg:p-10">
      <div className="mb-6 flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-5">
          {review.customer?.profileImage ? (
            <img
              src={review.customer.profileImage}
              alt={customerName}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-[#F2E6CE] sm:h-20 sm:w-20"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FFF1D5] text-base font-bold text-[#735D32] ring-4 ring-[#F2E6CE] sm:h-20 sm:w-20">
              {getInitials(customerName)}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
              {customerName}
            </h2>
            <p className="mt-1 truncate text-xs font-semibold uppercase text-slate-500">
              Reviewed by {review.shipper?.name || "Horse Shipt Shipper"}
            </p>
          </div>
        </div>

        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF9EC] text-[#BF9B53] shadow-inner sm:h-16 sm:w-16">
          <FaQuoteLeft size={22} />
        </span>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <p className="text-[11px] font-semibold uppercase text-slate-400">
          {formatDate(review.createdAt)}
        </p>
      </div>

      <p className="min-h-[150px] flex-1 text-base font-medium leading-8 text-slate-700 sm:min-h-[170px]">
        {review.reviewText || "A smooth completed shipment."}
      </p>

      <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-[11px] font-bold uppercase text-[#735D32]">
          Shipment {shipmentCode || "Completed"}
        </p>
        {(review.shipment?.pickupLocation ||
          review.shipment?.deliveryLocation) && (
          <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500">
            <FiMapPin className="mt-0.5 shrink-0 text-[#BF9B53]" />
            <span>
              {review.shipment?.pickupLocation || "Pickup N/A"} to{" "}
              {review.shipment?.deliveryLocation || "Delivery N/A"}
            </span>
          </p>
        )}
      </div>
    </article>
  );
};

const HappyConsumers = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const [isPaused, setIsPaused] = useState(false);
  const [animate, setAnimate] = useState(true);
  const resetTimerRef = useRef(null);

  const fetchReviews = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();

    if (
      !force &&
      happyConsumersCache.data &&
      now - happyConsumersCache.timestamp < CACHE_TTL
    ) {
      setReviews(happyConsumersCache.data);
      setLoading(false);
      return;
    }

    if (!happyConsumersPending) {
      happyConsumersPending = axios
        .get(`${API_BASE_URL}/customer/happy-consumers?limit=80`)
        .then((res) => (Array.isArray(res.data?.data) ? res.data.data : []))
        .finally(() => {
          happyConsumersPending = null;
        });
    }

    setLoading(true);
    setError("");

    try {
      const data = await happyConsumersPending;
      happyConsumersCache = {
        data,
        timestamp: Date.now(),
      };
      setReviews(data);
      setActiveIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load happy customers");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canSlide = reviews.length > visibleCount;
  const slides = useMemo(() => {
    if (!canSlide) return reviews;
    return [...reviews, ...reviews.slice(0, visibleCount)];
  }, [canSlide, reviews, visibleCount]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const goToNext = useCallback(() => {
    if (!canSlide) return;
    setAnimate(true);
    setActiveIndex((index) => index + 1);
  }, [canSlide]);

  const goToPrev = useCallback(() => {
    if (!canSlide) return;
    if (activeIndex === 0) {
      setAnimate(false);
      setActiveIndex(reviews.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setAnimate(true);
          setActiveIndex(reviews.length - 1);
        });
      });
      return;
    }
    setAnimate(true);
    setActiveIndex((index) => index - 1);
  }, [activeIndex, canSlide, reviews.length]);

  useEffect(() => {
    if (!canSlide || isPaused) return undefined;
    const intervalId = window.setInterval(goToNext, 4500);
    return () => window.clearInterval(intervalId);
  }, [canSlide, goToNext, isPaused]);

  useEffect(() => {
    if (!canSlide || activeIndex !== reviews.length) return undefined;

    resetTimerRef.current = window.setTimeout(() => {
      setAnimate(false);
      setActiveIndex(0);
      window.requestAnimationFrame(() => setAnimate(true));
    }, 520);

    return () => window.clearTimeout(resetTimerRef.current);
  }, [activeIndex, canSlide, reviews.length]);

  const slideWidth = 100 / visibleCount;
  const trackStyle = {
    transform: `translateX(-${activeIndex * slideWidth}%)`,
    transition: animate ? "transform 520ms ease" : "none",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-montserrat text-slate-900">
      <PageBanner
        title="Happy Customers"
        description="Shipment-based reviews from completed transports across the Horse Shipt network."
        Icon={HeartHandshake}
        bottomIcon={MessageSquareQuote}
      />

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="ml-auto grid max-w-[320px] grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#D9AF57] bg-[#FFF9EC] px-4 py-3">
            <p className="text-[11px] font-bold uppercase text-[#735D32]">
              Average
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {averageRating}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Reviews
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {reviews.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1720px] px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-16">
            <PageLoader text="Loading happy customers..." fullScreen={false} />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => fetchReviews({ force: true })}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold uppercase text-red-700 transition hover:bg-red-100"
            >
              <FiRefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9AF57] bg-white p-10 text-center">
            <p className="text-base font-bold text-slate-900">
              No happy customer reviews yet.
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Completed shipment reviews will appear here once available.
            </p>
          </div>
        ) : (
          <div
            className="relative mx-auto max-w-[1580px] px-10 sm:px-16 lg:px-20"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <button
              type="button"
              onClick={goToPrev}
              disabled={!canSlide}
              aria-label="Previous review"
              className="absolute left-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9AF57] bg-white text-[#735D32] shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition hover:-translate-x-1 hover:bg-[#FFF9EC] disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:w-14"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={!canSlide}
              aria-label="Next review"
              className="absolute right-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D9AF57] bg-white text-[#735D32] shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition hover:translate-x-1 hover:bg-[#FFF9EC] disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:w-14"
            >
              <FiChevronRight size={22} />
            </button>

            <div className=" py-4">
              <div className="flex" style={trackStyle}>
                {slides.map((review, index) => (
                  <div
                    key={`${review._id}-${index}`}
                    className="shrink-0"
                    style={{ flexBasis: `${slideWidth}%` }}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default HappyConsumers;
