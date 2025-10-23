import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = () => {
  const sigCanvas = useRef({});
  const [imageURL, setImageURL] = useState(null);

  const clearSignature = () => sigCanvas.current.clear();

  const saveSignature = async () => {
    const dataURL = sigCanvas.current.toDataURL("image/png");
    setImageURL(dataURL);

    // send to backend
    await fetch("http://localhost:5000/api/signature/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: dataURL }),
    });
  };

  return (
    <div className="flex flex-col items-center">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        backgroundColor="#fff"
        canvasProps={{
          width: 500,
          height: 200,
          className: "border border-gray-400 rounded-md",
        }}
      />
      <div className="flex gap-3 mt-3">
        <button
          onClick={saveSignature}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Signature
        </button>
        <button
          onClick={clearSignature}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>
      {imageURL && (
        <img
          src={imageURL}
          alt="Saved Signature"
          className="mt-4 border rounded"
        />
      )}
    </div>
  );
};

export default SignaturePad;
