export const GOOGLE_MAPS_LIBRARIES = ["places", "geometry"];

export const getGoogleMapsLoaderOptions = () => ({
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  libraries: GOOGLE_MAPS_LIBRARIES,
});
