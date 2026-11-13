
import API from "./api";

// Get the logged-in patient's profile
export const getMyPatientProfile = async (patientId) => {
  const response = await API.get(`/patients/${patientId}`);
  return response.data;
};

// Update the logged-in patient's profile
export const updateMyPatientProfile = async (profileData) => {
  const response = await API.put("/patients/my-profile", profileData);
  return response.data;
};
