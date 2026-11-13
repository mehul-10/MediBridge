
import API from "./api";

// Grant a healthcare professional access to medical records
export const grantSharingAccess = async (sharingData) => {
  const response = await API.post("/sharing", sharingData);
  return response.data;
};

// Get all sharing permissions granted by the logged-in patient
export const getMySharingPermissions = async () => {
  const response = await API.get("/sharing/my-permissions");
  return response.data;
};

// Revoke a healthcare professional's access
export const revokeSharingAccess = async (permissionId) => {
  const response = await API.delete(`/sharing/${permissionId}`);
  return response.data;
};
