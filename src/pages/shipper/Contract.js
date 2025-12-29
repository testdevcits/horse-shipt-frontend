import React, { useState } from "react";
import { useShipperContract } from "../../contexts/shipperContext/ShipperContractContext";

const Contracts = () => {
  const { contracts = [], loading, uploadContract } = useShipperContract();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  // ---------------- HANDLE UPLOAD ----------------
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      alert("Please provide contract title and file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("contractFile", file);

    const res = await uploadContract(formData);
    if (res?.success) {
      setTitle("");
      setFile(null);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contracts</h1>
        <p className="text-gray-600 text-sm">
          Upload contracts that buyers must sign when accepting your quote
        </p>
      </div>

      {/* UPLOAD */}
      <form
        onSubmit={handleUpload}
        className="bg-white border rounded-lg p-4 mb-6"
      >
        <h2 className="font-medium mb-3">Upload New Contract</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Contract title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border px-3 py-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {/* LIST */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-medium mb-4">My Contracts</h2>

        {loading ? (
          <p>Loading...</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-500 text-sm">No contracts uploaded yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c._id} className="border-b">
                  <td>{c.title}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <a
                      href={c.contractFile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Contracts;
