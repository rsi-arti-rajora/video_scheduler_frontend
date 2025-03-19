import { React, useState, useEffect } from "react";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import IconButton from "@mui/material/IconButton";
import { Add, Delete, Close } from "@mui/icons-material";
import { format } from "date-fns";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
import "./RTMPDialogForm.css";

export default function RTMPDialogForm({ isOpen, onClose, initialDate }) {
  // Form state
  const [date, setDate] = useState(initialDate || new Date());
  const [scheduleType, setScheduleType] = useState("now");
  const [time, setTime] = useState("");
  const [sourceType, setSourceType] = useState("list");
  const [selectedSource, setSelectedSource] = useState("");
  const [rows, setRows] = useState([{ id: Date.now(), title: "", url: "" }]);

  // Persisted record and streaming status
  const [streamData, setStreamData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Other state
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [showScheduledDialog, setShowScheduledDialog] = useState(false);
  const [s3BucketUrls, setS3BucketUrls] = useState([]);

  // Determine if form is read-only (non-editable) – if a record exists and streaming is active.
  const isReadOnly = isStreaming && streamData !== null;

  // Fetch available videos for the source list
  useEffect(() => {
    const fetchS3Urls = async () => {
      try {
        const fetchedEvents = await apiService.fetchVideos();
        setS3BucketUrls(fetchedEvents);
      } catch (error) {
        console.error("Error fetching S3 URLs:", error);
      }
    };
    fetchS3Urls();
  }, []);

  // When sourceType changes, reset selectedSource (only if form is editable)
  useEffect(() => {
    if (!isReadOnly) {
      setSelectedSource("");
    }
  }, [sourceType, isReadOnly]);

  const fetchStreamStatus = async () => {
    try {
      const response = await apiService.streamStatus();
      const data = await response.json();
      setIsStreaming(data.is_streaming);
    } catch (error) {
      console.error("Error fetching stream status:", error);
    }
  };

  // Fetch persisted record data from the DB when component mounts or after save
  useEffect(() => {
    axios
      .get("http://localhost:5000/get_stream_data")
      .then((response) => {
        console.log("Stream Data Response:", response.data);
        if (response.data && Object.keys(response.data).length > 0) {
          setStreamData(response.data);
        } else {
          setStreamData(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching stream data:", error);
        setStreamData(null);
      });
  }, []);

  // Prepopulate the form if a persisted record exists
  useEffect(() => {
    if (streamData) {
      setDate(new Date(streamData.date));
      setScheduleType(streamData.scheduleType);
      setTime(streamData.time);
      setSourceType(streamData.sourceType);
      setSelectedSource(streamData.selectedSource);
      // Map DB streams to form rows; update mapping if you have title info
      const mappedRows = streamData.streams.map((s) => ({
        id: s.streamId,
        title: s.title, // Update to s.title if available
        url: s.outputUrl,
      }));
      setRows(mappedRows);
    }
  }, [streamData]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), title: "", url: "" }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async () => {
    if (rows.length === 0 || rows.some((row) => !row.title || !row.url)) {
      toast.info("At least one platform entry is required with title and URL.");
      return;
    }
    const payload = {
      date: format(date, "yyyy-MM-dd"),
      scheduleType,
      time: scheduleType === "later" ? time : "Now",
      sourceType,
      selectedSource,
      streams: rows,
    };
  
    // Save payload locally (or send to backend)
    setScheduledStreams([...scheduledStreams, payload]);
  
    try {
      const data = await apiService.getStreamData();
      if (data && Object.keys(data).length > 0) {
        setStreamData(data);
      } else {
        setStreamData(null);
      }
    } catch (error) {
      console.error("Error fetching stream data:", error);
      setStreamData(null);
    }
  };
  

  // Helper function to reset the form state
  const resetForm = () => {
    setDate(initialDate || new Date());
    setScheduleType("now");
    setTime("");
    setSourceType("list");
    setSelectedSource("");
    setRows([{ id: Date.now(), title: "", url: "" }]);
    setStreamData(null);
  };

  const startStreaming = async () => {
    const payload = {
      date: format(date, "yyyy-MM-dd"),
      scheduleType,
      time: scheduleType === "later" ? time : "Now",
      sourceType,
      selectedSource,
      streams: rows,
    };
  
    try {
      const data = await apiService.startStream(payload);
      console.log("Response:", data);
      setIsStreaming(true);
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const stopStreaming = async () => {
    try {
      await apiService.stopStream();
      setIsStreaming(false);
      // Reset form after stopping the stream
      // resetForm();
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" className="liveStream-popup">
        <DialogTitle sx={{ padding: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Live Stream Scheduling for {format(date, "PP")}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Select
            fullWidth
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            disabled={isReadOnly}
          >
            <MenuItem value="now">Now</MenuItem>
            <MenuItem value="later">Later</MenuItem>
          </Select>
          {scheduleType === "later" && (
            <TextField
              fullWidth
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isReadOnly}
            />
          )}
          <RadioGroup value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <FormControlLabel value="list" control={<Radio disabled={isReadOnly} />} label="Source List" />
            <FormControlLabel value="url" control={<Radio disabled={isReadOnly} />} label="Live URL" />
          </RadioGroup>
          {sourceType === "list" ? (
            <Select
              fullWidth
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={isReadOnly}
            >
              <MenuItem value="" disabled>
                Please select a video
              </MenuItem>
              {s3BucketUrls.map((url, index) => (
                <MenuItem key={index} value={url}>
                  {url}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <TextField
              fullWidth
              type="text"
              placeholder="Enter RTMP URL"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={isReadOnly}
            />
          )}
          <h3 style={{ marginBottom: "8px" }}>Platform</h3>
          {rows.map((row) => (
            <div key={row.id} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <TextField
                fullWidth
                type="text"
                placeholder="Title"
                value={row.title}
                onChange={(e) => handleChange(row.id, "title", e.target.value)}
                disabled={isReadOnly}
              />
              <TextField
                fullWidth
                type="text"
                placeholder="RTMP URL"
                value={row.url}
                onChange={(e) => handleChange(row.id, "url", e.target.value)}
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <IconButton color="secondary" onClick={() => removeRow(row.id)}>
                  <Delete />
                </IconButton>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <Button className="btn-addrow" variant="outlined" onClick={addRow} startIcon={<Add />}>
              Add Row
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button variant="contained" color="primary" onClick={stopStreaming} disabled={isReadOnly || scheduleType === "now" || isStreaming }>
            Save
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={startStreaming}
            disabled={isReadOnly || scheduleType === "later" || isStreaming}
          >
            Start Streaming
          </Button>
          <Button variant="contained" color="error" onClick={stopStreaming} disabled={!isStreaming}>
            Stop Stream
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showScheduledDialog} onClose={() => setShowScheduledDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Scheduled Streams
          <IconButton onClick={() => setShowScheduledDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        {/* Optionally, add a table or list to show scheduled streams */}
      </Dialog>
    </>
  );
}
