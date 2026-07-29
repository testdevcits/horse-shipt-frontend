const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const trimApiSuffix = (value = "") => value.replace(/\/api\/?$/, "");

const backendEnv = (
  process.env.REACT_APP_BACKEND_ENV || "production"
).toLowerCase();

const productionBackendUrl =
  process.env.REACT_APP_PRODUCTION_BACKEND_URL || "http://52.14.251.189:5000";

const productionHttpsBackendUrl =
  process.env.REACT_APP_PRODUCTION_HTTPS_BACKEND_URL || "";

const developmentBackendUrl =
  process.env.REACT_APP_DEVELOPMENT_BACKEND_URL ||
  "https://horse-shipt.vercel.app";

const manualApiBaseUrl = process.env.REACT_APP_API_BASE_URL || "";

const isHttpsPage =
  typeof window !== "undefined" && window.location?.protocol === "https:";

const selectedProductionBackendUrl =
  isHttpsPage &&
  productionBackendUrl.startsWith("http://") &&
  productionHttpsBackendUrl
    ? productionHttpsBackendUrl
    : productionBackendUrl;

const selectedBackendUrl =
  backendEnv === "development"
    ? developmentBackendUrl
    : selectedProductionBackendUrl;

export const BACKEND_BASE_URL = trimTrailingSlash(
  trimApiSuffix(manualApiBaseUrl || selectedBackendUrl)
);

export const API_BASE_URL = manualApiBaseUrl
  ? trimTrailingSlash(manualApiBaseUrl)
  : `${BACKEND_BASE_URL}/api`;
export const SHIPPER_API_BASE_URL = `${API_BASE_URL}/shipper`;
export const CUSTOMER_API_BASE_URL = `${API_BASE_URL}/customer`;
