
import API from "./api";

// Get all medical records belonging to the logged-in patient
export const getMyMedicalRecords = async () => {
  const response = await API.get("/medical-records/my-records");
  return response.data;
};

// Get one specific medical record
export const getMedicalRecordById = async (recordId) => {
  const response = await API.get(`/medical-records/${recordId}`);
  return response.data;
};

// Create a new medical record
export const createMedicalRecord = async (recordData) => {
  const response = await API.post("/medical-records", recordData);
  return response.data;
};

// Update an existing medical record
export const updateMedicalRecord = async (recordId, recordData) => {
  const response = await API.put(
    `/medical-records/${recordId}`,
    recordData
  );
  return response.data;
};

// Delete a medical record
export const deleteMedicalRecord = async (recordId) => {
  const response = await API.delete(`/medical-records/${recordId}`);
  return response.data;
};
