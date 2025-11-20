import axiosInstance from "../utils/axiosInstance";

export const uploadB2BSheet = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post("/api/gstr2b-imports/b2b", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

