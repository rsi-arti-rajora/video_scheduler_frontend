import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Update with your backend's URL

const apiService = {
  fetchMetadata: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-metadata`);

      return response.data; // Assuming the response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  generatePresignedUrl: async (fileName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-presigned-url`, {
        file_name: fileName,
      });
      return response.data.url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  },

  addMetadata: async (metadata) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add-metadata`, metadata);
      return response.data.message;
    } catch (error) {
      console.error('Error adding metadata:', error);
      throw error;
    }
  },

  scheduleVideo: async (fileName, startTime) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schedule-video`, {
        file_name: fileName,
        start_time: startTime,
      });
      return response.data.message;
    } catch (error) {
      console.error('Error scheduling video:', error);
      throw error;
    }
  },

 // Upload file using the presigned URL
 uploadFile: async (file, onProgress) => {
  try {
    // Step 1: Get the presigned URL
    const presignedUrl = await apiService.generatePresignedUrl(file.name);
    

    // Step 2: Upload the file using the presigned URL
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'video/mp4',
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        if (onProgress) onProgress(progress);
      },
    };
    console.log("presignedUrl", presignedUrl);

    await axios.put(presignedUrl, file, config); // PUT request to the presigned URL

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
},
};

export default apiService;

