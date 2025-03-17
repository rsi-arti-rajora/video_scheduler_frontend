import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Update with your backend's URL
// const API_BASE_URL = 'http://ec2-43-204-97-164.ap-south-1.compute.amazonaws.com:5000'; // Update with your backend's URL

const apiService = {

  fetchVideos: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`);
      return response.data; // Assuming the response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  streamStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stream-status`);
      return response.data; // Assuming the response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  startStream: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/start-stream`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error in startStream API:", error);
      throw error;
    }
  },

  stopStream: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stop-stream`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error in stopStream API:", error);
      throw error;
    }
  },

  getStreamData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_stream_data`);
      return response.data;
    } catch (error) {
      console.error("Error in getStreamData API:", error);
      throw error;
    }
  },

  fetchMetadata: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-metadata`);
      return response.data; // Assuming the response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  },

  fetchScheduledEvents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-scheduled-events`);

      return response.data; // Assuming the response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching scheduled events:', error);
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

  scheduleVideo: async (videos, selectedDate) => {
    try {
      console.log("Sending videos:", videos);  // Log the array of videos to debug
      console.log("Selected date: ", selectedDate);
      
      // Send the array of videos in the request body
      const response = await axios.post(`${API_BASE_URL}/schedule-video`, {
        videos: videos, // Array of video objects
        selectedDate: selectedDate.toString(), // Additional parameter for the selected date
      });
      
      // Assuming the response contains an array of results for each video
      console.log("Response:", response.data); // Log the entire response from the server
  
      // You can return success messages for all videos or handle each individually
      if (response.data && Array.isArray(response.data)) {
        // Example of showing success messages for each video
        response.data.forEach((videoResponse) => {
          console.log("Video Scheduled:", videoResponse.message || videoResponse.error);
        });
      }
  
      return response.data; // Optionally return the response from the server
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
 
  restartStream: async () => {
    try {
      await axios.get(`${API_BASE_URL}/start-ffmpeg-stream`);
      return 'Stream restarted successfully!';
    } catch (error) {
      console.error('Error restarting stream:', error);
      throw error;
    }
  },
};

export default apiService;

