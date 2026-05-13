import axios from "axios";

const CACHE_TTL_MS = 8000;
const responseCache = new Map();
const pendingRequests = new Map();

const safeClone = (value) => {
  if (value == null) return value;

  try {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
  } catch {
    // Fall through to JSON clone.
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const cloneResponse = (response) => ({
  ...response,
  data: safeClone(response.data),
});

const normalizeHeaderValue = (headers, key) => {
  if (!headers) return "";

  if (typeof headers.get === "function") {
    return headers.get(key) || headers.get(key.toLowerCase()) || "";
  }

  return headers[key] || headers[key.toLowerCase()] || "";
};

const getAuthorization = (config = {}, client = axios) => {
  const configAuth = normalizeHeaderValue(config.headers, "Authorization");
  if (configAuth) return configAuth;

  const defaults = client.defaults?.headers || {};
  return (
    normalizeHeaderValue(defaults.common, "Authorization") ||
    normalizeHeaderValue(defaults.get, "Authorization") ||
    normalizeHeaderValue(defaults, "Authorization")
  );
};

const stableStringify = (value) => {
  if (!value || typeof value !== "object") return JSON.stringify(value);

  if (value instanceof URLSearchParams) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
};

const isCacheableGet = (config = {}) => {
  if (config.cache === false) return false;

  const skipCache = normalizeHeaderValue(config.headers, "x-skip-cache");
  return skipCache !== "true";
};

const getCacheKey = ({ client, url, config }) =>
  stableStringify({
    baseURL: config.baseURL || client.defaults?.baseURL || "",
    url,
    params: config.params || null,
    auth: getAuthorization(config, client),
  });

const clearAxiosRequestCache = () => {
  responseCache.clear();
  pendingRequests.clear();
};

const installOnClient = (client) => {
  if (client.__horseShiptRequestCacheInstalled) return client;

  const originalGet = client.get.bind(client);

  client.get = (url, config = {}) => {
    if (!isCacheableGet(config)) {
      return originalGet(url, config);
    }

    const key = getCacheKey({ client, url, config });
    const cached = responseCache.get(key);

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return Promise.resolve(cloneResponse(cached.response));
    }

    if (pendingRequests.has(key)) {
      return pendingRequests.get(key).then(cloneResponse);
    }

    const request = originalGet(url, config)
      .then((response) => {
        responseCache.set(key, {
          fetchedAt: Date.now(),
          response: cloneResponse(response),
        });
        return response;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, request);
    return request;
  };

  ["post", "put", "patch", "delete"].forEach((method) => {
    const originalMethod = client[method]?.bind(client);
    if (!originalMethod) return;

    client[method] = (...args) => {
      clearAxiosRequestCache();
      return originalMethod(...args).finally(clearAxiosRequestCache);
    };
  });

  Object.defineProperty(client, "__horseShiptRequestCacheInstalled", {
    value: true,
  });

  return client;
};

if (!axios.__horseShiptCreateCacheInstalled) {
  const originalCreate = axios.create.bind(axios);

  axios.create = (...args) => installOnClient(originalCreate(...args));

  Object.defineProperty(axios, "__horseShiptCreateCacheInstalled", {
    value: true,
  });
}

installOnClient(axios);

export { clearAxiosRequestCache };
