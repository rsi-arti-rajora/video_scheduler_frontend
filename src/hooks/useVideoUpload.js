import { useState, useRef } from 'react';
import axios from 'axios';

const useVideoUpload = () => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const backendUrl = "http://localhost:5000/";
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setUploadStatus('Please select a valid video file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('Getting presigned URL...');
      console.log('file',file);
      // Step 1: Get presigned URL from backend
      const { data } = await axios.post(`${backendUrl}/generate-presigned-url`, {
        file_name: file.name,
      });

      // setBucket(data.bucket);
      // setKey(data.key);

      await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
      });

      // setUploading(false);
      // setProgress(0);
      alert("File uploaded successfully! Please click 'Start Task' to begin.");
    }

      // const { presignedUrl } = response.data;

      // Step 2: Upload the file using the presigned URL
      // setUploadStatus('Uploading video...');
      // const uploadResponse = await axios.put(presignedUrl, file, {
      //   headers: {
      //     'Content-Type': file.type,
      //   },
      // });

      // setUploadStatus('Video uploaded successfully!');
      // console.log('Upload Response:', uploadResponse.data);
    catch (error) {
      console.error('Error during upload:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fileInputRef,
    isUploading,
    uploadStatus,
    handleFileUpload,
  };
};

export default useVideoUpload;
