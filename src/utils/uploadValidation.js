export const MAX_IMAGE_UPLOAD_SIZE = 2 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_SIZE_LABEL = "2 MB";

export const IMAGE_SIZE_ERROR = `Image size must be ${MAX_IMAGE_UPLOAD_SIZE_LABEL} or less.`;

export const isImageFile = (file) =>
  Boolean(file?.type && file.type.startsWith("image/"));

export const isImageTooLarge = (file) =>
  isImageFile(file) && Number(file.size || 0) > MAX_IMAGE_UPLOAD_SIZE;

export const validateImageUpload = (file, { requireImage = true } = {}) => {
  if (!file) return "";

  if (requireImage && !isImageFile(file)) {
    return "Please upload a valid image file.";
  }

  if (isImageTooLarge(file)) {
    return IMAGE_SIZE_ERROR;
  }

  return "";
};

export const getFileSizeError = (file) =>
  isImageTooLarge(file) ? IMAGE_SIZE_ERROR : "";
