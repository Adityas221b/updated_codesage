import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import axios from 'axios';

const ResumeUpload = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);

  const handleFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setErrorMessage('Please upload a PDF or TXT file only');
      setUploadStatus('error');
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/api/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadStatus('success');
        setCandidateProfile(response.data);
        
        // Pass data to parent component
        onUploadSuccess(response.data.profile, response.data.questions || []);
        
        // Navigate to interview after a brief delay
        setTimeout(() => {
          navigate('/interview');
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrorMessage(response.data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Network error. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Resume Analysis</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your resume and let our AI create a personalized technical interview 
            with 7-8 questions tailored to your background and experience.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-2xl"
        >
          {uploadStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">Analysis Complete!</h3>
              <p className="text-gray-300 mb-6">
                AI has analyzed your resume and generated personalized questions
              </p>
              {candidateProfile && (
                <div className="glass-dark p-6 rounded-xl max-w-2xl mx-auto">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Your Profile:</h4>
                  <p className="text-gray-300">{candidateProfile.summary}</p>
                </div>
              )}
              <div className="flex items-center justify-center mt-6">
                <Loader className="w-6 h-6 text-blue-400 animate-spin mr-2" />
                <span className="text-blue-400">Redirecting to interview...</span>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-400/10'
                    : file
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-400 hover:border-blue-400 hover:bg-blue-400/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader className="w-16 h-16 text-blue-400 animate-spin mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">Analyzing Resume...</h3>
                    <p className="text-gray-300">AI is processing your background and generating questions</p>
                    <div className="mt-6 w-64 bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-16 h-16 text-green-400 mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">File Selected</h3>
                    <p className="text-gray-300 mb-4">{file.name}</p>
                    <p className="text-sm text-gray-400">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Drop your resume here
                    </h3>
                    <p className="text-gray-300 mb-4">or click to browse files</p>
                    <p className="text-sm text-gray-400">Supports PDF and TXT files (max 16MB)</p>
                  </div>
                )}

                {!uploading && (
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                )}
              </div>

              {/* Error Message */}
              {uploadStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center text-red-400"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Upload Button */}
              {file && !uploading && uploadStatus !== 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={handleUpload}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Brain className="w-5 h-5 inline mr-2" />
                    Analyze with AI
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "AI Analysis",
              desc: "Advanced Gemini AI analyzes your skills and experience",
              icon: Brain
            },
            {
              title: "Custom Questions",
              desc: "7-8 personalized questions based on your background",
              icon: FileText
            },
            {
              title: "Comprehensive Scoring",
              desc: "Detailed evaluation with metrics and 100-point scoring",
              icon: CheckCircle
            }
          ].map((item, index) => (
            <div key={index} className="glass-dark p-6 rounded-xl text-center">
              <item.icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            ← Back to Welcome
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResumeUpload;
