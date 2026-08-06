import React, { useRef, useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";

const ImageInput = ({ file, onChange, label, required, error }) => {
  const inputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    if (typeof file === "string") {
      setPreviewUrl(file);
      return;
    }

    if (file && typeof file === "object" && file.url) {
      setPreviewUrl(file.url);
      return;
    }

    // If it's a File object
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }

    // If it has public_id or other object structure
    if (file && typeof file === "object") {
      setPreviewUrl("");
      return;
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onChange(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onChange(droppedFile);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setPreviewUrl("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="block text-slate-900 font-semibold text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg h-64 sm:h-56 w-full flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden relative group ${
          error
            ? "border-red-500 bg-red-50 hover:border-red-600"
            : "border-slate-300 bg-slate-50 hover:border-[#BF9B53] hover:bg-amber-50"
        }`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="preview"
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-lg"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center rounded-lg">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-[#BF9B53]/50 hover:bg-[#BF9B53] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none space-y-2">
            <ImagePlus className="h-12 w-12 text-slate-400" />
            <div className="text-center">
              <p className="font-semibold text-slate-700">
                Click or drag image
              </p>
              <p className="text-xs text-slate-600">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
    </div>
  );
};

export default ImageInput;
