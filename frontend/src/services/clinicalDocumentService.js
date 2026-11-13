import API from "./api";

// Upload a clinical document
export const uploadClinicalDocument = async (documentData) => {
  const response = await API.post(
    "/clinical-documents",
    documentData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Get all documents for the logged-in patient
export const getMyClinicalDocuments = async () => {
  const response = await API.get("/clinical-documents/my-documents");
  return response.data;
};

// Download a clinical document
export const downloadClinicalDocument = async (documentId) => {
  const response = await API.get(
    `/clinical-documents/${documentId}/download`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

// Update document details
export const updateClinicalDocument = async (documentId, documentData) => {
  const response = await API.put(
    `/clinical-documents/${documentId}`,
    documentData
  );

  return response.data;
};

// Delete a clinical document
export const deleteClinicalDocument = async (documentId) => {
  const response = await API.delete(`/clinical-documents/${documentId}`);
  return response.data;
};