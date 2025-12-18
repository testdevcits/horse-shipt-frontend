import { FiHome, FiMessageSquare, FiTruck } from "react-icons/fi";
import { LuFilePenLine } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";

const ICON_COLOR = "text-[#BF9B53]";
const ICON_SIZE = "text-lg";

const iconClass = `${ICON_COLOR} ${ICON_SIZE}`;

export const DashboardIcon = () => <FiHome className={iconClass} />;
export const OrdersIcon = () => <LuFilePenLine className={iconClass} />;
export const ProfileIcon = () => <FiTruck className={iconClass} />;
export const ChatIcon = () => <FiMessageSquare className={iconClass} />;
export const SettingsIcon = () => <IoSettingsOutline className={iconClass} />;
