
import API from "./api";

// Create a clinical handover
export const createClinicalHandover = async (handoverData) => {
  const response = await API.post("/clinical-handovers", handoverData);
  return response.data;
};

// Get all handovers created by logged-in healthcare professional
export const getMyClinicalHandovers = async () => {
  const response = await API.get("/clinical-handovers/my-handovers");
  return response.data;
};

// Get a single clinical handover
export const getClinicalHandoverById = async (id) => {
  const response = await API.get(`/clinical-handovers/${id}`);
  return response.data;
};

// Update a clinical handover
export const updateClinicalHandover = async (id, handoverData) => {
  const response = await API.put(
    `/clinical-handovers/${id}`,
    handoverData
  );
  return response.data;
};

// Delete a clinical handover
export const deleteClinicalHandover = async (id) => {
  const response = await API.delete(`/clinical-handovers/${id}`);
  return response.data;
};
