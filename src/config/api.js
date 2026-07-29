const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const trimApiSuffix = (value = "") => value.replace(/\/api\/?$/, "");

const backendEnv = (
  process.env.REACT_APP_BACKEND_ENV || "production"
).toLowerCase();

const productionBackendUrl =
  process.env.REACT_APP_PRODUCTION_BACKEND_URL || "http://52.14.251.189:5000";

const developmentBackendUrl =
  process.env.REACT_APP_DEVELOPMENT_BACKEND_URL ||
  "https://horse-shipt.vercel.app";

const selectedBackendUrl =
  backendEnv === "development" ? developmentBackendUrl : productionBackendUrl;

export const BACKEND_BASE_URL = trimTrailingSlash(
  trimApiSuffix(selectedBackendUrl)
);

export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
export const SHIPPER_API_BASE_URL = `${API_BASE_URL}/shipper`;
export const CUSTOMER_API_BASE_URL = `${API_BASE_URL}/customer`;

