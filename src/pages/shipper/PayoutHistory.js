import React, { useEffect, useState } from "react";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import PageLoader from "../../components/common/PageLoader";

const PayoutHistory = () => {
  const { payoutHistory, getPayoutHistory, loading, hasMore, nextCursor } =
    useShipperDelivery();

  const [visibleIds, setVisibleIds] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getPayoutHistory();
  }, [getPayoutHistory]);

  const toggleId = (id) => {
    setVisibleIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maskId = (id) => {
    if (!id) return "";
    return id.slice(0, 4) + "********" + id.slice(-4);
  };

  const handleLoadMore = async () => {
    if (!hasMore) return;

    setLoadingMore(true);
    await getPayoutHistory(5, nextCursor);
    setLoadingMore(false);
  };

  return (
    <div className="font-[Montserrat]">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Payout History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View all payments received after successful shipment deliveries on
            the Horseshipt platform.
          </p>
        </div>

        {/* Loading */}
        {loading && payoutHistory.length === 0 && (
          <PageLoader text="" fullScreen={false} size={28} color="#BF9B53" />
        )}

        {/* Empty State */}
        {!loading && payoutHistory?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg font-medium">
              No payouts available yet
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Once shipments are completed and payments are processed, they will
              appear here.
            </p>
          </div>
        )}

        {/* Table */}
        {payoutHistory?.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <thead className="bg-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="p-3 text-left">Payout Reference</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Currency</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Transfer Type</th>
                    <th className="p-3 text-left">Arrival Date</th>
                    <th className="p-3 text-left">Processed Date</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {payoutHistory.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      {/* Payout ID */}
                      <td className="p-3 text-sm text-gray-700 flex items-center gap-2">
                        {visibleIds[payout.id] ? payout.id : maskId(payout.id)}

                        <button
                          onClick={() => toggleId(payout.id)}
                          className="text-blue-600 text-xs font-medium hover:underline"
                        >
                          {visibleIds[payout.id] ? "Hide" : "View"}
                        </button>
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-semibold text-gray-900">
                        $
                        {Number(payout.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Currency */}
                      <td className="p-3 uppercase text-gray-600">
                        {payout.currency}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            payout.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="p-3 capitalize text-gray-600">
                        {payout.method?.replace("_", " ")}
                      </td>

                      {/* Arrival */}
                      <td className="p-3 text-gray-600">
                        {new Date(payout.arrivalDate).toLocaleDateString()}
                      </td>

                      {/* Created */}
                      <td className="p-3 text-gray-600">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 bg-[#BF9B53] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PayoutHistory;
