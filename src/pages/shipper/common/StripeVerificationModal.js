import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  DollarSign,
  Lock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const StripeVerificationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    navigate("/shipper/settings?tab=payment");
  };

  const BENEFITS = [
    {
      icon: DollarSign,
      title: "Receive Payments",
      description: "Get paid directly to your bank account",
    },
    {
      icon: Lock,
      title: "Secure Transactions",
      description: "Bank-level security for all payments",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 font-montserrat p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#BF9B53] via-[#BF9B53]/80 to-[#8B7138] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/20">
                <Shield size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                Verification Required
              </span>
            </div>
            <h2 className="text-2xl font-black leading-tight">
              Connect Your Bank Account
            </h2>
            <p className="text-sm opacity-90">
              Unlock payment capabilities with Stripe
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Why Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#BF9B53]" />
              Why is this required?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BENEFITS.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200 hover:border-[#BF9B53]/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#BF9B53]/10 flex items-center justify-center mb-2">
                      <Icon size={16} className="text-[#BF9B53]" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Lock size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Secure & Private:</span> Your
              banking information is encrypted and processed only by Stripe. We
              never store your bank details.
            </p>
          </div>

          {/* Step Info */}
          <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-4">
            <p className="text-xs font-bold text-amber-900">Setup Steps:</p>
            <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
              <li>Click "Connect Bank Account" below</li>
              <li>Enter your business information</li>
              <li>Verify your bank account</li>
              <li>Start receiving payments!</li>
            </ol>
            <p className="text-xs text-amber-700 font-semibold mt-2">
              Takes about 5-10 minutes
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4">
          <button
            onClick={handleNavigate}
            className="w-full py-3 bg-gradient-to-r from-[#BF9B53] to-[#a8863e] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <Shield size={16} />
            Connect Bank Account
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            ✓ Required to receive payments and start earning
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeVerificationModal;
