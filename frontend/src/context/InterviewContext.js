import React, { createContext, useContext, useState } from 'react';

// Create the context
const InterviewContext = createContext();

// Custom hook to use the interview context
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

// Interview Provider component
export const InterviewProvider = ({ children }) => {
  const [interviewState, setInterviewState] = useState({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    candidateProfile: null,
    isCompleted: false,
    startTime: null,
    endTime: null
  });

  const [candidateProfile, setCandidateProfile] = useState(null);

  const value = {
    interviewState,
    setInterviewState,
    candidateProfile,
    setCandidateProfile
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

export { InterviewContext };
