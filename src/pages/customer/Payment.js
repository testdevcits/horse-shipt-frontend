import React, { useEffect, useState } from "react";
import { useCustomerPayment } from "../../contexts/customerContext/CustomerPaymentContext";
import { useAuth } from "../../contexts/AuthContext";
import { PaymentSkeleton } from "../../components/common/Skeleton";

// ─── Icons ────────────────────────────────────────────────────────────────────
const TruckIcon = ({ size = 20, color = "#BF9B53" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const ArrowRight = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const BackArrow = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.99-.99a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width={13}
    height={13}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10B981"
    strokeWidth={3}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RefreshIcon = ({ spinning }) => (
  <svg
    width={13}
    height={13}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    style={{ animation: spinning ? "spin 0.7s linear infinite" : "none" }}
  >
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  switch (status) {
    case "succeeded":
      return { label: "Paid", classes: "bg-success-50 text-success-700" };
    case "pending":
      return { label: "Pending", classes: "bg-yellow-50 text-yellow-700" };
    default:
      return { label: status, classes: "bg-gray-100 text-gray-600" };
  }
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

// ─── Shipper Avatar ───────────────────────────────────────────────────────────
const ShipperAvatar = ({ src, name, className = "" }) => {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className={`object-cover border-2 border-system-primary ${className}`}
      />
    );
  }
  return (
    <div
      className={`bg-system-primary border-2 border-system-primary flex items-center justify-center font-bold text-white ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-md p-3 shadow-sm text-center">
    <p className="text-[14px] text-black mb-1">{label}</p>
    <p className="text-base font-bold text-dark font-montserrat">{value}</p>
  </div>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-montserrat flex-shrink-0">
      {label}
    </span>
    <span className="text-xs font-semibold text-dark font-montserrat text-right max-w-[58%] break-all ml-2">
      {value || "N/A"}
    </span>
  </div>
);

// ─── Detail Panel Content (used in both mobile full-screen & desktop drawer) ──
const DetailPanel = ({ payment, onClose, mode }) => {
  // mode: "mobile" | "drawer"
  const s = getStatusConfig(payment.status);
  const shipper = payment.shipper || {};
  const isMobile = mode === "mobile";

  return (
    <div className="flex flex-col h-full font-montserrat">
      {/* Sticky top bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-system-primary font-semibold text-sm hover:opacity-70 transition-opacity"
        >
          {isMobile ? <BackArrow /> : <CloseIcon />}
          {isMobile ? "Back" : "Close"}
        </button>
        <p className="text-sm font-bold text-dark">Payment Details</p>
        <div className="w-14" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-light px-1 py-5 space-y-3">
        {/* Shipper Hero */}
        <div className="bg-white rounded-md px-5 py-6 text-center shadow-sm">
          <div className="flex justify-center mb-3">
            <ShipperAvatar
              src={shipper.profileImage}
              name={shipper.name || ""}
              className={`rounded-full ${
                isMobile ? "w-20 h-20 text-xl" : "w-16 h-16 text-base"
              }`}
            />
          </div>
          <p className="font-bold text-dark text-base">
            {shipper.name || payment.shipperName}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <MailIcon />
            <span className="text-xs text-gray-400">
              {shipper.email || payment.customerEmail}
            </span>
          </div>
          {shipper.mobile && (
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <PhoneIcon />
              <span className="text-xs text-gray-400">{shipper.mobile}</span>
            </div>
          )}
          <p
            className={`font-bold text-dark mt-5 ${
              isMobile ? "text-4xl" : "text-3xl"
            }`}
          >
            {payment.currency?.toUpperCase()} {payment.amount?.toFixed(2)}
          </p>
          <div
            className={`inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full font-semibold ${
              s.classes
            } ${isMobile ? "text-sm" : "text-xs"}`}
          >
            {payment.status === "succeeded" && <CheckIcon />}
            {s.label === "Paid" ? "Payment Successful" : s.label}
          </div>
          {payment.cardBrand && (
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-2 py-1 mt-3">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background:
                    payment.cardBrand === "visa"
                      ? "#BF9B53"
                      : payment.cardBrand === "mastercard"
                      ? "#EB001B"
                      : "#007BC1",
                }}
              />
              <span className="text-xs font-semibold text-gray-500 capitalize">
                {payment.cardBrand} ···· {payment.last4}
              </span>
            </div>
          )}
        </div>

        {/* Route */}
        <div className="bg-white rounded-md px-4 py-4 shadow-sm">
          <p className="text-[10px] text-[#BF9B53] uppercase tracking-widest font-semibold mb-3">
            Route
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-light rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Pickup</p>
              <p className="text-xs font-bold text-dark">
                {payment.pickupLocation}
              </p>
            </div>
            <span className="text-gray-300">
              <ArrowRight size={14} />
            </span>
            <div className="flex-1 bg-light rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Delivery</p>
              <p className="text-xs font-bold text-dark">
                {payment.deliveryLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction info */}
        <div className="bg-white rounded-md px-4 py-1 shadow-sm">
          <p className="text-[10px] text-[#BF9B53] uppercase tracking-widest font-semibold pt-3 mb-1">
            Transaction
          </p>
          <DetailRow label="Date" value={payment.paymentDate} />
          <DetailRow label="Time" value={payment.paymentTime} />
          <DetailRow label="Payment Method" value={payment.paymentMethod} />
          <DetailRow label="Customer Email" value={payment.customerEmail} />
          <DetailRow
            label="Transaction ID"
            value={
              payment.transactionId?.length > 26
                ? payment.transactionId.slice(0, 26) + "…"
                : payment.transactionId
            }
          />
        </div>

        {/* Receipt */}
        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-system-primary text-system-primary text-sm font-bold hover:bg-header transition-colors"
          >
            <ReceiptIcon />
            View Stripe Receipt
          </a>
        )}
        <div className="pb-4" />
      </div>
    </div>
  );
};

// ─── Transaction List Card ────────────────────────────────────────────────────
const TxnCard = ({ item, isActive, onClick }) => {
  const s = getStatusConfig(item.status);
  const shipper = item.shipper || {};
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-md px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200
        ${
          isActive
            ? "ring-2 ring-system-primary shadow-md scale-[0.995]"
            : "shadow-sm hover:shadow-md hover:scale-[0.998] active:scale-[0.995]"
        }`}
    >
      <ShipperAvatar
        src={shipper.profileImage}
        name={shipper.name || item.shipperName || ""}
        className="w-11 h-11 rounded-full text-sm flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-dark truncate">
          {shipper.name || item.shipperName}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-gray-400">
          <span className="text-xs truncate max-w-[100px]">
            {item.pickupLocation}
          </span>
          <span className="flex-shrink-0 text-gray-300">
            <ArrowRight />
          </span>
          <span className="text-xs truncate max-w-[100px]">
            {item.deliveryLocation}
          </span>
        </div>
        <p className="text-[11px] text-gray-300 mt-0.5">
          {item.paymentDateTime}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-dark">
          {item.currency?.toUpperCase()} {item.amount?.toFixed(2)}
        </p>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${s.classes}`}
        >
          {s.label}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Payment = () => {
  const { user } = useAuth();
  const { payments, fetchPayments, loading } = useCustomerPayment();

  const [selected, setSelected] = useState(null); // active payment
  const [drawerOpen, setDrawerOpen] = useState(false); // controls animation
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchPayments();
  }, [user, fetchPayments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setTimeout(() => setRefreshing(false), 800);
  };

  const totalPaid = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "succeeded").length;

  // Open drawer smoothly
  const openDetail = (item) => {
    if (selected?.transactionId === item.transactionId) {
      closeDetail();
      return;
    }
    setSelected(item);
    // small tick so CSS transition fires
    setTimeout(() => setDrawerOpen(true), 10);
  };

  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 320); // wait for slide-out
  };

  // ── Shared list content ──
  const ListContent = ({ compact = false }) => (
    <div className={compact ? "" : "space-y-4"}>
      {/* Stats */}
      {!loading && payments.length > 0 && (
        <div className={`grid grid-cols-3 gap-3 ${compact ? "mb-4" : ""}`}>
          <StatCard label="Total Paid" value={`$${totalPaid.toFixed(2)}`} />
          <StatCard label="Transactions" value={payments.length} />
          <StatCard label="Successful" value={successCount} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <PaymentSkeleton />
      )}

      {/* Empty */}
      {!loading && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <TruckIcon size={32} color="#D1D5DB" />
          </div>
          <p className="text-sm text-gray-400 font-semibold">
            No payments found
          </p>
          <button
            onClick={handleRefresh}
            className="text-xs text-system-primary font-semibold border border-system-primary rounded-xl px-5 py-2 hover:bg-header transition-colors"
          >
            Try Refreshing
          </button>
        </div>
      )}

      {/* List */}
      {!loading && payments.length > 0 && (
        <div>
          <p className="text-[11px] text-[#BF9B53] uppercase tracking-widest font-semibold mb-3 px-1">
            Recent
          </p>
          <div className="space-y-2.5">
            {payments.map((item) => (
              <TxnCard
                key={item.transactionId}
                item={item}
                isActive={
                  selected?.transactionId === item.transactionId && drawerOpen
                }
                onClick={() => openDetail(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Header bar ──
  const Header = () => (
    <div className="bg-white rounded-md shadow-sm px-4 py-3 flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-system-primary flex items-center justify-center flex-shrink-0">
        <TruckIcon size={20} color="#fff" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-dark leading-tight font-montserrat">
          My Payments
        </h1>
        <p className="text-xs text-gray-400 font-montserrat">
          Shipment transactions
        </p>
      </div>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 text-xs font-semibold text-system-primary border border-system-primary rounded-xl px-3 py-1.5 hover:bg-header transition-colors disabled:opacity-50 flex-shrink-0 font-montserrat"
      >
        <RefreshIcon spinning={refreshing} />
        Refresh
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-light font-montserrat w-full">
      {/* ════════════ MOBILE (< md) ════════════ */}
      <div className="md:hidden">
        {/* Mobile — Detail full screen (slide in from right) */}
        <div
          className="fixed inset-0 z-50 bg-light transition-transform duration-300 ease-in-out"
          style={{ transform: selected ? "translateX(0)" : "translateX(100%)" }}
        >
          {selected && (
            <DetailPanel
              payment={selected}
              onClose={closeDetail}
              mode="mobile"
            />
          )}
        </div>

        {/* Mobile — List */}
        <div className="min-w-full">
          <Header />
          <ListContent />
        </div>
      </div>

      {/* ════════════ DESKTOP (≥ md) ════════════ */}
      <div
        className="hidden md:block relative overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* List — shrinks when drawer opens */}
        <div
          className="transition-all duration-300 ease-in-out absolute inset-y-0 left-0 overflow-y-auto hide-scrollbar"
          style={{
            width: drawerOpen ? "45%" : "100%",
            paddingRight: drawerOpen ? "0" : "0",
          }}
        >
          <div
            className="px-6 py-8"
            style={{
              maxWidth: drawerOpen ? "none" : "full",
              margin: drawerOpen ? "0" : "0 auto",
            }}
          >
            <Header />
            <ListContent compact />
          </div>
        </div>

        {/* Drawer — slides in from right */}
        <div
          className="absolute inset-y-0 right-0 bg-white border-l border-gray-100 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: drawerOpen ? "55%" : "0%",
            opacity: drawerOpen ? 1 : 0,
          }}
        >
          {selected && (
            <div
              className="h-full transition-transform duration-300 ease-in-out"
              style={{
                transform: drawerOpen ? "translateX(0)" : "translateX(40px)",
              }}
            >
              <DetailPanel
                payment={selected}
                onClose={closeDetail}
                mode="drawer"
              />
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Payment;
