import { FiHome, FiMessageSquare, FiTruck } from "react-icons/fi";
import { LuFilePenLine } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";

// Default color & size
const DEFAULT_COLOR = "text-[#BF9B53]";
const DEFAULT_SIZE = "text-lg";

export const DashboardIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiHome className={`${color} ${size} ${className}`} />;

export const OrdersIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <LuFilePenLine className={`${color} ${size} ${className}`} />;

export const ProfileIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiTruck className={`${color} ${size} ${className}`} />;

export const ChatIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <FiMessageSquare className={`${color} ${size} ${className}`} />;

export const SettingsIcon = ({
  className = "",
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}) => <IoSettingsOutline className={`${color} ${size} ${className}`} />;
