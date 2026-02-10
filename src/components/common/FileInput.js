// /components/common/FileInput.jsx
import React, { useRef, useState, useEffect } from "react";
import Button from "./Button"; // import your custom Button component

const FileInput = ({
  label,
  file,
  onChange,
  required = false,
  accept = "*",
  error,
  placeholder = "No file selected",
}) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      onChange(selectedFile);
    }
  };

  const handleClick = () => {
    inputRef.current && inputRef.current.click();
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="block font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
        {/* File name or placeholder */}
        <span
          className={`truncate ${error ? "text-red-500" : ""}`}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 500,
            fontStyle: "normal",
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0%",
            color: "#333333",
          }}
        >
          {fileName || placeholder}
        </span>

        {/* Upload button using custom Button component */}
        <Button
          type="button"
          onClick={handleClick}
          variant="secondary"
          rounded={false}
          className="border border-gray-500 border-[2px]"
        >
          Upload
        </Button>

        {/* Hidden file input */}
        <input
          type="file"
          accept={accept}
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FileInput;
