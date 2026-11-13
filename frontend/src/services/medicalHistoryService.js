
import API from "./api";

// Get all medical history entries for the logged-in patient
export const getMyMedicalHistory = async () => {
  const response = await API.get("/medical-history/my-history");
  return response.data;
};

// Get one medical history entry
export const getMedicalHistoryById = async (historyId) => {
  const response = await API.get(`/medical-history/${historyId}`);
  return response.data;
};

// Add a medical history entry
export const createMedicalHistory = async (historyData) => {
  const response = await API.post("/medical-history", historyData);
  return response.data;
};

// Update a medical history entry
export const updateMedicalHistory = async (historyId, historyData) => {
  const response = await API.put(
    `/medical-history/${historyId}`,
    historyData
  );
  return response.data;
};

// Delete a medical history entry
export const deleteMedicalHistory = async (historyId) => {
  const response = await API.delete(`/medical-history/${historyId}`);
  return response.data;
};
