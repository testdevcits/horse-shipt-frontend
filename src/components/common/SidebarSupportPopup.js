import React from "react";
import { CiCircleQuestion } from "react-icons/ci";
import { MdClose, MdOutlineEmail } from "react-icons/md";

const DEFAULT_SUPPORT_EMAIL = "noreply.horseshipt2026@gmail.com";

const SidebarSupportPopup = ({
  isOpen,
  onClose,
  role = "customer",
  sidebarOpen = false,
  mobileOpen = false,
  supportEmail = DEFAULT_SUPPORT_EMAIL,
}) => {
  if (!isOpen) return null;

  const roleLabel = role === "shipper" ? "Shipper" : "Customer";

  return (
    <div
      className={`fixed inset-x-3 bottom-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto border border-[#E7D7B7] bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-full sm:mb-3 sm:max-h-[calc(100vh-8rem)] ${
        sidebarOpen || mobileOpen ? "sm:left-3 sm:right-3" : "sm:left-2 sm:w-[260px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#FBFAF7] text-[#BF9B53]">
            <CiCircleQuestion size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-[#111827]">
              {roleLabel} Help
            </h2>
            <p className="truncate text-[11px] font-medium text-[#6B7280]">
              Contact our support team
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#6B7280] transition hover:bg-gray-100 hover:text-[#111827]"
          aria-label="Close help popup"
        >
          <MdClose size={18} />
        </button>
      </div>

      <div className="px-4 py-4">
        <p className="text-[12px] leading-5 text-[#4B5563]">
          Need help with your {roleLabel.toLowerCase()} dashboard? Send us an
          email and we will get back to you.
        </p>

        <a
          href={`mailto:${supportEmail}`}
          className="mt-4 flex min-w-0 items-center gap-3 border border-[#BF9B53]/40 bg-[#FBFAF7] px-3 py-3 text-[#111827] transition hover:border-[#BF9B53]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-[#BF9B53] shadow-sm">
            <MdOutlineEmail size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BF9B53]">
              Help Email
            </span>
            <span className="block truncate text-xs font-bold">
              {supportEmail}
            </span>
          </span>
        </a>
      </div>
    </div>
  );
};

export default SidebarSupportPopup;
