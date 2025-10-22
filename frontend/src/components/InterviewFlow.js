import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Play, Pause, SkipForward, 
  Code2, MessageCircle, Mic, MicOff,
  CheckCircle2, AlertCircle, Brain,
  ChevronLeft, ChevronRight, Send,
  Target, Code, Lightbulb, CheckCircle,
  ArrowRight, Bot, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InterviewContext } from '../context/InterviewContext';
import { Editor as MonacoEditor } from '@monaco-editor/react';

const InterviewFlow = ({ interviewState, setInterviewState }) => {
  const navigate = useNavigate();
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [code, setCode] = useState('# Write your solution here\n');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const recognitionRef = useRef(null);
  const [executionResult, setExecutionResult] = useState('');
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];
  const isLastQuestion = interviewState.currentQuestionIndex === interviewState.questions.length - 1;
  const progress = ((interviewState.currentQuestionIndex + 1) / interviewState.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewState.currentQuestionIndex]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeSpent(0);
    setCode('# Write your solution here\n');
    setCurrentAnswer('');
    setExecutionResult('');
    setCodeAnalysis(null);
  }, [interviewState.currentQuestionIndex]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isVoiceActive) {
          // Restart recognition if voice is still active
          setTimeout(() => {
            if (isVoiceActive) {
              recognition.start();
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      setSpeechRecognition(recognition);
    }
  }, [isVoiceActive]);

  const toggleVoiceRecognition = () => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isVoiceActive) {
      speechRecognition.stop();
      setIsVoiceActive(false);
      setIsListening(false);
    } else {
      setIsVoiceActive(true);
      speechRecognition.start();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    const answer = {
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      answer: currentAnswer,
      code: currentQuestion.type === 'coding' ? code : null,
      timeSpent: timeSpent,
      timestamp: new Date().toISOString()
    };

    // Add to answers array
    setInterviewState(prev => ({
      ...prev,
      answers: [...prev.answers, answer]
    }));

    if (isLastQuestion) {
      // Complete interview and navigate to evaluation
      setInterviewState(prev => ({
        ...prev,
        isCompleted: true
      }));
      navigate('/evaluation');
    } else {
      // Move to next question
      setInterviewState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handleRunCode = async () => {
    try {
      const response = await axios.post('/api/execute', { code });
      setExecutionResult(response.data.output);
    } catch (error) {
      setExecutionResult('Error executing code: ' + error.message);
    }
  };

  const handleGetHint = async () => {
    try {
      const response = await axios.post('/api/analyze', { 
        code, 
        type: 'hint',
        profile: interviewState.candidateProfile 
      });
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: response.data.ai_analysis,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/chat', {
        message: chatInput,
        profile: interviewState.candidateProfile
      });

      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: response.data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setChatInput('');
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">No questions available</h2>
          <button 
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Upload Resume First
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-6"
    >
      {/* Header */}
      <div className="glass p-4 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white font-semibold">
                Question {interviewState.currentQuestionIndex + 1} of {interviewState.questions.length}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-mono">{formatTime(timeSpent)}</span>
            </div>
          </div>
          
          <div className="w-64">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-400 mt-1 block">{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Question & Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <motion.div
            key={currentQuestion.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.type === 'behavioral' 
                    ? 'bg-purple-600 text-white'
                    : currentQuestion.type === 'technical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {currentQuestion.type === 'behavioral' ? 'Behavioral' :
                   currentQuestion.type === 'technical' ? 'Technical' : 'Coding'}
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">
              {currentQuestion.title || currentQuestion.question}
            </h3>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              {currentQuestion.description || currentQuestion.question}
            </p>

            {/* Answer Input for Non-Coding Questions */}
            {currentQuestion.type !== 'coding' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Answer:
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Share your thoughts and experience..."
                />
              </div>
            )}
          </motion.div>

          {/* Code Editor for Coding Questions */}
          {currentQuestion.type === 'coding' && (
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Code Editor
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRunCode}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </button>
                  <button
                    onClick={handleGetHint}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint
                  </button>
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <MonacoEditor
                  width="100%"
                  height="400"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={setCode}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Execution Output */}
              {executionResult && (
                <div className="mt-4 bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Output:</h5>
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {executionResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer && currentQuestion.type !== 'coding'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center font-semibold transition-all duration-300"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Interview
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Chat & Analysis */}
        <div className="space-y-6">
          {/* Voice Controls */}
          <div className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Voice Interview</h4>
              <button
                onClick={toggleVoiceRecognition}
                className={`p-3 rounded-full transition-colors ${
                  isVoiceActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isVoiceActive ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            {isVoiceActive && (
              <div className="mt-3 flex items-center text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm">{isListening ? 'Listening...' : 'Voice Active'}</span>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="glass p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              AI Assistant
            </h4>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto space-y-3 mb-4">
              <AnimatePresence>
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start space-x-2 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <Bot className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.type === 'user' && (
                      <User className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for help or clarification..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Progress */}
          <div className="glass p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3">Progress</h4>
            <div className="space-y-2">
              {interviewState.questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className={`flex items-center space-x-3 p-2 rounded ${
                    index === interviewState.currentQuestionIndex 
                      ? 'bg-blue-600/20 border border-blue-600' 
                      : index < interviewState.currentQuestionIndex
                      ? 'bg-green-600/20'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    index < interviewState.currentQuestionIndex
                      ? 'bg-green-600 text-white'
                      : index === interviewState.currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index < interviewState.currentQuestionIndex ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">
                      {q.type === 'behavioral' ? 'Behavioral' :
                       q.type === 'technical' ? 'Technical' : 'Coding'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {q.title || q.question?.substring(0, 30) + '...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewFlow;
