import React, { useState } from "react";
import { useSubscription } from "../../contexts/shipperContext/SubscriptionContext";

const BillingHistory = () => {
  const { billingHistory, billingLoading } = useSubscription();

  const [filter, setFilter] = useState("all"); // all | invoice | transaction
  const [previewUrl, setPreviewUrl] = useState(null);

  if (billingLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading billing history...
      </div>
    );
  }

  if (!billingHistory || billingHistory.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No billing history found
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === "paid" || status === "succeeded")
      return "bg-green-100 text-green-700";
    if (status === "failed" || status === "open")
      return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const filteredData =
    filter === "all"
      ? billingHistory
      : billingHistory.filter((item) => item.type === filter);

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-4">Billing History</h2>

      <div className="flex gap-2 mb-4">
        {["all", "invoice", "transaction"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm capitalize border 
              ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            {/* LEFT */}
            <div>
              <p className="font-medium">
                {item.type === "invoice" ? "Invoice" : "Transaction (Payment)"}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>

              {item.periodStart && item.periodEnd && (
                <p className="text-xs text-gray-400">
                  {new Date(item.periodStart).toLocaleDateString()} →{" "}
                  {new Date(item.periodEnd).toLocaleDateString()}
                </p>
              )}

              {item.type === "transaction" && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.cardBrand?.toUpperCase()} •••• {item.last4}
                </p>
              )}
            </div>

            {/* CENTER */}
            <div className="text-left sm:text-center">
              <p className="font-semibold">
                ${item.amount} {item.currency?.toUpperCase()}
              </p>

              <span
                className={`px-2 py-1 text-xs rounded ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </div>

            {/* RIGHT */}
            <div className="flex gap-3">
              {item.hostedInvoiceUrl && (
                <button
                  onClick={() => window.open(item.hostedInvoiceUrl, "_blank")}
                  className="text-blue-600 text-sm underline"
                >
                  View
                </button>
              )}

              {item.invoicePdf && (
                <a
                  href={item.invoicePdf}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 text-sm underline"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] h-[90%] rounded-xl overflow-hidden shadow-lg relative">
            {/* CLOSE */}
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 bg-gray-200 px-3 py-1 rounded"
            >
              Close
            </button>

            {/* IFRAME */}
            <iframe
              src={previewUrl}
              title="Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
