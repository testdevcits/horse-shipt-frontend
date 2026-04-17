// import React, { useRef, useState, useEffect } from "react";
// import { LuImagePlus } from "react-icons/lu";

// const ImageInput = ({ file, onChange, label, required, error }) => {
//   const inputRef = useRef();
//   const [previewUrl, setPreviewUrl] = useState("");

//   // Update preview URL whenever the file changes
//   useEffect(() => {
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);

//       return () => URL.revokeObjectURL(url);
//     } else {
//       setPreviewUrl("");
//     }
//   }, [file]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) onChange(selectedFile);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile) onChange(droppedFile);
//   };

//   return (
//     <div className="flex flex-col gap-1 w-full">
//       {label && (
//         <label className="block text-gray-700 font-medium mb-1">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}

//       <div
//         onClick={() => inputRef.current.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={handleDrop}
//         className={`border border-dashed border-gray-300 rounded-lg h-64 sm:h-56 w-full flex items-center justify-center cursor-pointer transition-colors hover:border-gray-400 overflow-hidden relative ${
//           error ? "border-red-500" : ""
//         }`}
//       >
//         {previewUrl ? (
//           <img
//             src={previewUrl}
//             alt="preview"
//             className="h-full w-full object-cover rounded-lg"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-400 pointer-events-none">
//             <LuImagePlus className="h-16 w-16 mb-2" />
//             <span>Click or drag image here</span>
//           </div>
//         )}
//         <input
//           type="file"
//           accept="image/*"
//           ref={inputRef}
//           className="hidden"
//           onChange={handleFileChange}
//         />
//       </div>
//       {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//     </div>
//   );
// };

// export default ImageInput;
import React, { useRef, useState, useEffect } from "react";
import { LuImagePlus } from "react-icons/lu";

const ImageInput = ({ file, onChange, label, required, error }) => {
  const inputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    // ✅ Case 1: Existing image URL (edit mode)
    if (typeof file === "string") {
      setPreviewUrl(file);
      return;
    }

    // ✅ Case 2: New uploaded file
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
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
    e.stopPropagation(); // prevent opening file picker
    onChange(null);
    setPreviewUrl("");
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="block text-gray-700 font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border border-dashed border-gray-300 rounded-lg h-64 sm:h-56 w-full flex items-center justify-center cursor-pointer transition-colors hover:border-gray-400 overflow-hidden relative ${
          error ? "border-red-500" : ""
        }`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="preview"
              className="h-full w-full object-cover rounded-lg"
            />

            {/* ✅ Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded"
            >
              Remove
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <LuImagePlus className="h-16 w-16 mb-2" />
            <span>Click or drag image here</span>
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

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ImageInput;