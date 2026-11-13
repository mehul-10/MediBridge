
import API from "./api";

// Get all medications for the logged-in patient
export const getMyMedications = async () => {
  const response = await API.get("/medications/my-medications");
  return response.data;
};

// Add a medication
export const createMedication = async (medicationData) => {
  const response = await API.post("/medications", medicationData);
  return response.data;
};

// Update a medication
export const updateMedication = async (medicationId, medicationData) => {
  const response = await API.put(
    `/medications/${medicationId}`,
    medicationData
  );
  return response.data;
};

// Delete a medication
export const deleteMedication = async (medicationId) => {
  const response = await API.delete(`/medications/${medicationId}`);
  return response.data;
};
