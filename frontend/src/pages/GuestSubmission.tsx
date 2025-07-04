import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";
import toast from "react-hot-toast";
import { useSubmitMessage, useStoreMediaFile, useGenerateUploadUrl, useUpdateMediaFileWithStorage } from "../hooks/useConvex";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import EventPage from "./EventPage";

const SUBMISSION_TYPES = ["text", "audio", "video", "media"] as const;

const GuestSubmission: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [submissionType, setSubmissionType] = useState<
    "text" | "audio" | "video" | "media"
  >("text");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const submitMessage = useSubmitMessage();
  const storeMediaFile = useStoreMediaFile();
  const generateUploadUrl = useGenerateUploadUrl();
  const updateMediaFileWithStorage = useUpdateMediaFileWithStorage();
  const getFileUrl = useMutation(api.files.getUrl);

  // Determine the best MIME type for audio recording
  const getAudioMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using audio MIME type:', type);
        return type;
      }
    }
    
    console.warn('No supported audio MIME type found, using undefined to let browser choose');
    return undefined; // Let browser choose the best format
  };

  const audioMimeType = getAudioMimeType();
  const audioRecorderOptions = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    },
    askPermissionOnMount: false,
    mediaRecorderOptions: audioMimeType ? {
      audioBitsPerSecond: 128000,
      mimeType: audioMimeType
    } : {
      audioBitsPerSecond: 128000
    },
    onStart: () => {
      console.log('Audio recording started');
    },
    onStop: (blobUrl: string, blob: Blob) => {
      console.log('Audio recording stopped');
      console.log('Audio blob type:', blob.type);
      console.log('Audio blob size:', blob.size);
      
      if (blob.size === 0) {
        console.error('Audio blob is empty!');
        toast.error('Audio recording failed - no data captured. Please check microphone permissions.');
        return;
      }
      
      // More lenient check for audio content
      if (blob.size < 1000) {
        console.warn('Audio blob is very small, may indicate recording issues');
        toast.error('Audio recording seems too short. Please try recording again.');
      }
    },
    onError: (error: Error) => {
      console.error('Audio recording error:', error);
      toast.error('Audio recording failed. Please try again.');
    }
  };

  const {
    status: audioStatus,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    mediaBlobUrl: audioBlobUrl,
    clearBlobUrl: clearAudioBlobUrl,
  } = useReactMediaRecorder(audioRecorderOptions);

  // Determine the best MIME type for video recording with audio
  const getVideoMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using video MIME type:', type);
        return type;
      }
    }
    
    console.warn('No supported video MIME type found, using undefined to let browser choose');
    return undefined; // Let browser choose the best format
  };

  const videoMimeType = getVideoMimeType();
  const videoRecorderOptions = {
    video: {
      width: 1280,
      height: 720,
      frameRate: 30
    }, 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    },
    askPermissionOnMount: false,
    mediaRecorderOptions: videoMimeType ? {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      mimeType: videoMimeType
    } : {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000
    },
    onStart: () => {
      console.log('Video recording started');
    },
    onStop: (blobUrl: string, blob: Blob) => {
      console.log('Video recording stopped');
      console.log('Video blob type:', blob.type);
      console.log('Video blob size:', blob.size);
      
      if (blob.size === 0) {
        console.error('Video blob is empty!');
        toast.error('Video recording failed - no data captured. Please check camera/microphone permissions.');
        return;
      }
      
      // More lenient check - just warn about potential audio issues
      if (blob.size < 10000) {
        console.warn('Video blob is very small, may indicate recording issues');
        toast.error('Video recording seems too short. Please try recording again.');
      }
      
      // Note: We can't reliably detect audio presence in the blob type for all browsers
      console.log('Video recording completed successfully');
    },
    onError: (error: Error) => {
      console.error('Video recording error:', error);
      toast.error('Video recording failed. Please try again.');
    }
  };

  const {
    status: videoStatus,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    mediaBlobUrl: videoBlobUrl,
    clearBlobUrl: clearVideoBlobUrl,
    previewStream,
  } = useReactMediaRecorder(videoRecorderOptions);

  useEffect(() => {
    const fetchBlob = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      setRecordedBlob(blob);
    };

    if (submissionType === "audio" && audioBlobUrl) {
      fetchBlob(audioBlobUrl);
    } else if (submissionType === "video" && videoBlobUrl) {
      fetchBlob(videoBlobUrl);
    }
  }, [audioBlobUrl, videoBlobUrl, submissionType]);

  // Function to check media stream tracks
  const checkMediaTracks = (stream: MediaStream) => {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    console.log('Video tracks:', videoTracks.length);
    console.log('Audio tracks:', audioTracks.length);
    
    videoTracks.forEach((track, index) => {
      console.log(`Video track ${index}:`, {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        label: track.label
      });
    });
    
    audioTracks.forEach((track, index) => {
      console.log(`Audio track ${index}:`, {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        label: track.label
      });
    });
    
    if (audioTracks.length === 0) {
      console.error('No audio tracks found in media stream!');
      toast.error('No microphone access detected. Please allow microphone permissions and try again.');
    }
  };

  // Cleanup preview stream when switching submission types
  useEffect(() => {
    if (submissionType !== "video" && previewVideoRef.current?.srcObject) {
      const stream = previewVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowVideoPreview(false);
    }
  }, [submissionType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewVideoRef.current?.srcObject) {
        const stream = previewVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for videos
        toast.error("File must be less than 50MB");
        return;
      }
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (submissionType === "text" && !message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (submissionType === "audio" && !recordedBlob) {
      toast.error("Please record an audio message");
      return;
    }

    if (submissionType === "video" && !recordedBlob) {
      toast.error("Please record a video message");
      return;
    }

    if (submissionType === "media" && !mediaFile) {
      toast.error("Please select a photo or video");
      return;
    }

    if (!eventId) {
      toast.error("Event not found");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the message first
      const trimmedMessage = message.trim();
      const submitArgs: {
        eventId: Id<"events">;
        guestName: string;
        messageText?: string;
        messageType: "text" | "audio" | "video" | "media";
      } = {
        eventId: eventId as Id<"events">,
        guestName: guestName.trim(),
        messageType: submissionType,
      };
      
      if (trimmedMessage) {
        submitArgs.messageText = trimmedMessage;
      }
      
      const messageId = await submitMessage(submitArgs);

      // Handle file storage with Convex if there's a file
      let fileToUpload: File | Blob | undefined;
      if (submissionType === "media") {
        fileToUpload = mediaFile ?? undefined;
      } else if (submissionType === "audio" || submissionType === "video") {
        fileToUpload = recordedBlob ?? undefined;
      }
      
      if (fileToUpload && messageId) {
        try {
          // Convert Blob to File if needed
          const fileForUpload = fileToUpload instanceof File 
            ? fileToUpload 
            : new File([fileToUpload], `${submissionType}_recording.${submissionType === 'audio' ? 'webm' : 'mp4'}`, { 
                type: fileToUpload.type || (submissionType === 'audio' ? 'audio/webm' : 'video/webm')
              });
          
          // First, store file metadata in Convex
          const mediaFileId = await storeMediaFile({
            messageId,
            fileName: fileForUpload.name,
            fileSize: fileForUpload.size,
            mimeType: fileForUpload.type,
          });
          
          // Generate upload URL for Convex file storage
          const uploadUrl = await generateUploadUrl();
          
          // Upload file to Convex storage
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": fileForUpload.type },
            body: fileForUpload,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          
          const { storageId } = await uploadResponse.json();
          
          // Generate file URL from storage ID using Convex
          const fileUrl = await getFileUrl({ storageId });
          
          if (!fileUrl) {
            throw new Error('Failed to generate file URL');
          }
          
          // Update media file record with storage details
          await updateMediaFileWithStorage({
            mediaFileId,
            convexFileId: storageId,
            convexFileUrl: fileUrl,
          });
          
        } catch (uploadError: any) {
          console.error('File storage failed:', uploadError);
          toast.error('Failed to store file. Please try again.');
          return;
        }
      }

      toast.success("Thank you for your submission!");
      // Reset form
      setGuestName("");
      setMessage("");
      setRecordedBlob(null);
      setMediaFile(null);
      setShowVideoPreview(false);
      clearAudioBlobUrl();
      clearVideoBlobUrl();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Stop any preview streams
      if (previewVideoRef.current?.srcObject) {
        const stream = previewVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error: any) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventPage eventId={eventId as Id<"events">}>
      {(event) => (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating Hearts */}
            <div className="floating-hearts">
              <div className="heart heart-1">💕</div>
              <div className="heart heart-2">💖</div>
              <div className="heart heart-3">💝</div>
              <div className="heart heart-4">💗</div>
              <div className="heart heart-5">💓</div>
            </div>
            
            {/* Sparkle Effects */}
            <div className="sparkles">
              <div className="sparkle sparkle-1">✨</div>
              <div className="sparkle sparkle-2">⭐</div>
              <div className="sparkle sparkle-3">✨</div>
              <div className="sparkle sparkle-4">⭐</div>
              <div className="sparkle sparkle-5">✨</div>
              <div className="sparkle sparkle-6">⭐</div>
            </div>
            
            {/* Wedding Rings */}
            <div className="wedding-rings">
              <div className="ring ring-1">💍</div>
              <div className="ring ring-2">💍</div>
            </div>
            
            {/* Rose Petals */}
            <div className="rose-petals">
              <div className="petal petal-1">🌹</div>
              <div className="petal petal-2">🌸</div>
              <div className="petal petal-3">🌹</div>
              <div className="petal petal-4">🌸</div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-rose-200 p-6 mb-6 hover:shadow-2xl transition-all duration-300">
              <h1 className="text-3xl font-bold text-rose-800 mb-2">
                {event.title}
              </h1>
              <p className="text-rose-600 mb-4">{event.description}</p>
              <div className="text-sm text-rose-500">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
              </div>
            </div>

            {/* Submission Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-rose-200 p-6 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-rose-800 mb-6">
                Share Your Love
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Guest Name */}
                <div>
                  <label className="block text-sm font-medium text-rose-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-800 placeholder-rose-400 hover:border-rose-400 transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Submission Type */}
                <div>
                  <label className="block text-sm font-medium text-rose-700 mb-4">
                    Choose how you'd like to share your love:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {SUBMISSION_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSubmissionType(type)}
                        className={`p-4 border-2 rounded-lg text-center transition-colors hover-lift ${
                          submissionType === type
                            ? "border-rose-400 bg-rose-100 text-rose-700"
                            : "border-rose-200 hover:border-rose-400 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {type === "text" && "💬"}
                          {type === "audio" && "🎤"}
                          {type === "video" && "📹"}
                          {type === "media" && "📱"}
                        </div>
                        <div className="font-medium capitalize">
                          {type === "media" ? "Photo/Video" : type}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Recording */}
                {submissionType === "audio" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="mb-6">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                            audioStatus === "recording"
                              ? "bg-red-900/50 text-red-300 border border-red-500"
                              : audioStatus === "stopped"
                                ? "bg-green-900/50 text-green-300 border border-green-500"
                                : "bg-gray-800 text-gray-300 border border-gray-600"
                          }`}
                        >
                          Status: {audioStatus}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Test microphone access first
                              const testStream = await navigator.mediaDevices.getUserMedia({
                                audio: {
                                  echoCancellation: true,
                                  noiseSuppression: true,
                                  autoGainControl: true,
                                  sampleRate: 44100
                                }
                              });
                              
                              // Check audio tracks
                              const audioTracks = testStream.getAudioTracks();
                              console.log('Audio tracks available:', audioTracks.length);
                              
                              if (audioTracks.length === 0) {
                                console.error('No audio tracks found!');
                                toast.error('No microphone access detected. Please allow microphone permissions.');
                                testStream.getTracks().forEach(track => track.stop());
                                return;
                              }
                              
                              // Log track details
                              audioTracks.forEach((track, index) => {
                                console.log(`Audio track ${index}:`, {
                                  kind: track.kind,
                                  enabled: track.enabled,
                                  readyState: track.readyState,
                                  label: track.label,
                                  settings: track.getSettings()
                                });
                              });
                              
                              // Clean up test stream before starting recording
                              testStream.getTracks().forEach(track => track.stop());
                              
                              // Small delay to ensure cleanup
                              await new Promise(resolve => setTimeout(resolve, 100));
                              
                              // Start recording with react-media-recorder
                              startAudioRecording();
                              
                            } catch (error: any) {
                                console.error('Error accessing microphone:', error);
                                if (error.name === 'NotAllowedError') {
                                  toast.error('Microphone access denied. Please allow microphone permissions and try again.');
                                } else if (error.name === 'NotFoundError') {
                                  toast.error('No microphone found. Please connect a microphone and try again.');
                                } else {
                                  toast.error('Failed to access microphone. Please check your device and try again.');
                                }
                              }
                          }}
                          disabled={audioStatus === "recording"}
                          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl min-w-[140px]"
                        >
                          🎤 Start Recording
                        </button>
                        <button
                          type="button"
                          onClick={stopAudioRecording}
                          disabled={audioStatus !== "recording"}
                          className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl min-w-[140px]"
                        >
                          ⏹️ Stop Recording
                        </button>
                      </div>
                      {audioBlobUrl && (
                        <div className="mt-4">
                          <div className="mb-2 text-sm text-rose-700">Preview your recording:</div>
                          <audio
                            src={audioBlobUrl}
                            controls
                            preload="metadata"
                            className="w-full bg-gray-800 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {submissionType === "text" && (
                  <div>
                    <label className="block text-sm font-medium text-rose-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                      className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-800 placeholder-rose-400 hover:border-rose-400 transition-all"
                      placeholder="Share your love and best wishes..."
                    />
                  </div>
                )}

                {/* Video Recording */}
                {submissionType === "video" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="mb-6">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                            videoStatus === "recording"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : videoStatus === "stopped"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-rose-100 text-rose-700 border border-rose-300"
                          }`}
                        >
                          Status: {videoStatus}
                        </div>
                      </div>
                      
                      {/* Camera Preview before recording */}
                      {!videoBlobUrl && videoStatus === "idle" && (
                        <div className="mb-6">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const stream = await navigator.mediaDevices.getUserMedia({ 
                                  video: {
                                    width: 1280,
                                    height: 720,
                                    frameRate: 30
                                  }, 
                                  audio: {
                                    echoCancellation: true,
                                    noiseSuppression: true,
                                    autoGainControl: true,
                                    sampleRate: 44100
                                  }
                                });
                                
                                console.log('Camera preview stream:');
                                checkMediaTracks(stream);
                                
                                if (previewVideoRef.current) {
                                  previewVideoRef.current.srcObject = stream;
                                }
                                setShowVideoPreview(true);
                              } catch (error: any) {
                                console.error('Camera preview error:', error);
                                toast.error("Camera/microphone access denied. Please allow permissions.");
                              }
                            }}
                            className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors shadow-lg hover:shadow-xl mb-4 min-w-[160px]"
                          >
                            📷 Preview Camera
                          </button>
                          {showVideoPreview && (
                            <div>
                              <div className="mb-2 text-sm text-rose-700">Camera Preview:</div>
                              <video
                                ref={previewVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full max-w-md mx-auto bg-rose-50 rounded-lg border border-rose-300"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Live Preview during recording */}
                      {videoStatus === "recording" && previewStream && (
                        <div className="mb-4">
                          <div className="mb-2 text-sm text-rose-700">Recording...</div>
                          <video
                            ref={(video) => {
                              if (video && previewStream) {
                                video.srcObject = previewStream;
                              }
                            }}
                            autoPlay
                            muted
                            playsInline
                            className="w-full max-w-md mx-auto bg-rose-50 rounded-lg border border-rose-300"
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // Test camera and microphone access first
                              const testStream = await navigator.mediaDevices.getUserMedia({
                                video: {
                                  width: 1280,
                                  height: 720,
                                  frameRate: 30
                                },
                                audio: {
                                  echoCancellation: true,
                                  noiseSuppression: true,
                                  autoGainControl: true,
                                  sampleRate: 44100
                                }
                              });
                              
                              // Check media tracks
                              console.log('Testing video recording capabilities:');
                              checkMediaTracks(testStream);
                              
                              const audioTracks = testStream.getAudioTracks();
                              const videoTracks = testStream.getVideoTracks();
                              
                              if (audioTracks.length === 0) {
                                console.error('No audio tracks found for video recording!');
                                toast.error('No microphone access detected. Video will be recorded without audio.');
                              }
                              
                              if (videoTracks.length === 0) {
                                console.error('No video tracks found!');
                                toast.error('No camera access detected. Please allow camera permissions.');
                                testStream.getTracks().forEach(track => track.stop());
                                return;
                              }
                              
                              // Stop preview stream if exists
                              if (previewVideoRef.current?.srcObject) {
                                const previewStream = previewVideoRef.current.srcObject as MediaStream;
                                previewStream.getTracks().forEach(track => track.stop());
                              }
                              
                              // Clean up test stream
                              testStream.getTracks().forEach(track => track.stop());
                              
                              // Small delay to ensure cleanup
                              await new Promise(resolve => setTimeout(resolve, 100));
                              
                              // Start recording with react-media-recorder
                              startVideoRecording();
                              setShowVideoPreview(false);
                              
                            } catch (error: any) {
                              console.error('Error accessing camera/microphone:', error);
                              if (error.name === 'NotAllowedError') {
                                toast.error('Camera/microphone access denied. Please allow permissions and try again.');
                              } else if (error.name === 'NotFoundError') {
                                toast.error('Camera or microphone not found. Please check your devices.');
                              } else {
                                toast.error('Failed to access camera/microphone. Please check your devices and try again.');
                              }
                            }
                          }}
                          disabled={videoStatus === "recording"}
                          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover-lift min-w-[140px]"
                        >
                          📹 Start Recording
                        </button>
                        <button
                          type="button"
                          onClick={stopVideoRecording}
                          disabled={videoStatus !== "recording"}
                          className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover-lift min-w-[140px]"
                        >
                          ⏹️ Stop Recording
                        </button>
                      </div>
                      
                      {videoBlobUrl && (
                        <div className="mt-4">
                          <div className="mb-2 text-sm text-gray-300">Preview your recording:</div>
                          <video
                            src={videoBlobUrl}
                            controls
                            preload="metadata"
                            className="w-full max-w-md mx-auto bg-rose-50 rounded-lg border border-rose-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Media Upload (Photo/Video) */}
                {submissionType === "media" && (
                  <div>
                    <label className="block text-sm font-medium text-rose-700 mb-2">
                      Upload Photo or Video
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600 hover:border-rose-400 transition-all"
                    />
                    <div className="text-xs text-rose-500 mt-1">
                      Supported formats: Images (JPG, PNG, GIF) and Videos (MP4, MOV, AVI) up to 50MB
                    </div>
                    {mediaFile && (
                      <div className="mt-4">
                        <div className="mb-2 text-sm text-rose-700">Preview:</div>
                        {mediaFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(mediaFile)}
                            alt="Media Preview"
                            className="w-full max-w-md mx-auto rounded-lg border border-rose-300"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(mediaFile)}
                            controls
                            preload="metadata"
                            className="w-full max-w-md mx-auto rounded-lg border border-rose-300"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Message for non-text submissions */}
                {submissionType !== "text" && (
                  <div>
                    <label className="block text-sm font-medium text-rose-700 mb-2">
                      Additional Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-800 placeholder-rose-400 hover:border-rose-400 transition-all"
                      placeholder="Add your love and best wishes..."
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Sharing Your Love..." : "Share Your Love"}
                </button>
              </form>
            </div>

            {/* Back Link */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/")}
                className="text-rose-600 hover:text-rose-500 font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </EventPage>
  );
};

export default GuestSubmission;
