import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewProvider } from './context/InterviewContext';
import WelcomePage from './components/WelcomePage';
import ResumeUpload from './components/ResumeUpload';
import InterviewFlow from './components/InterviewFlow';
import EvaluationReport from './components/EvaluationReport';
import './App.css';

function App() {
  const [interviewState, setInterviewState] = useState({
    candidateProfile: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    codeSubmissions: [],
    isCompleted: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <InterviewProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={<WelcomePage />} 
              />
              <Route 
                path="/upload" 
                element={
                  <ResumeUpload 
                    onUploadSuccess={(profile, questions) => {
                      setInterviewState(prev => ({
                        ...prev,
                        candidateProfile: profile,
                        questions: questions
                      }));
                    }}
                  />
                } 
              />
              <Route 
                path="/interview" 
                element={
                  <InterviewFlow 
                    interviewState={interviewState}
                    setInterviewState={setInterviewState}
                  />
                } 
              />
            <Route 
              path="/evaluation" 
              element={
                <EvaluationReport 
                  interviewState={interviewState}
                />
              } 
            />
          </Routes>
        </AnimatePresence>
      </Router>
      </InterviewProvider>
    </div>
  );
}

export default App;
