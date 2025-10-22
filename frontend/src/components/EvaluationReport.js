import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
} from 'chart.js';
import { Bar, Radar, Doughnut, Line } from 'react-chartjs-2';
import {
  Trophy,
  Target,
  Clock,
  Code,
  MessageCircle,
  Brain,
  CheckCircle,
  XCircle,
  Award,
  Download,
  Share,
  RefreshCw,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

const EvaluationReport = ({ interviewState }) => {
  const navigate = useNavigate();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI evaluation process
    setTimeout(() => {
      const evaluation = generateEvaluation(interviewState);
      setEvaluationData(evaluation);
      setLoading(false);
    }, 3000);
  }, [interviewState]);

  const generateEvaluation = (state) => {
    // Simulate comprehensive AI evaluation
    const totalQuestions = state.questions.length;
    const behavioralQuestions = state.questions.filter(q => q.type === 'behavioral').length;
    const technicalQuestions = state.questions.filter(q => q.type === 'technical').length;
    const codingQuestions = state.questions.filter(q => q.type === 'coding').length;

    // Generate scores for different metrics
    const scores = {
      technical_knowledge: Math.floor(Math.random() * 30) + 70, // 70-100
      problem_solving: Math.floor(Math.random() * 25) + 65,     // 65-90
      communication: Math.floor(Math.random() * 20) + 75,      // 75-95
      code_quality: Math.floor(Math.random() * 25) + 60,       // 60-85
      behavioral_fit: Math.floor(Math.random() * 20) + 70,     // 70-90
      creativity: Math.floor(Math.random() * 30) + 55,         // 55-85
    };

    const overallScore = Math.round(
      (scores.technical_knowledge * 0.25 +
       scores.problem_solving * 0.20 +
       scores.communication * 0.15 +
       scores.code_quality * 0.20 +
       scores.behavioral_fit * 0.15 +
       scores.creativity * 0.05)
    );

    const isPassed = overallScore >= 70;

    return {
      overallScore,
      isPassed,
      scores,
      metrics: {
        totalTime: state.answers.reduce((acc, ans) => acc + (ans.timeSpent || 0), 0),
        questionsAnswered: state.answers.length,
        totalQuestions,
        behavioralQuestions,
        technicalQuestions,
        codingQuestions,
        avgTimePerQuestion: Math.round(
          state.answers.reduce((acc, ans) => acc + (ans.timeSpent || 0), 0) / state.answers.length
        ),
      },
      strengths: [
        'Strong technical fundamentals',
        'Clear communication skills',
        'Good problem-solving approach',
        'Efficient coding practices'
      ],
      improvements: [
        'Code optimization techniques',
        'Advanced algorithms knowledge',
        'System design concepts',
        'Edge case handling'
      ],
      detailedFeedback: {
        behavioral: 'Demonstrated excellent communication and cultural fit. Shows strong motivation and learning attitude.',
        technical: 'Good grasp of technical concepts with room for improvement in advanced topics.',
        coding: 'Clean code structure with efficient solutions. Consider optimizing for complex scenarios.'
      }
    };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-600 to-green-800';
    if (score >= 70) return 'from-yellow-600 to-yellow-800';
    return 'from-red-600 to-red-800';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-4">AI is Evaluating Your Performance</h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Our advanced AI is analyzing your responses, code quality, and overall performance 
            to generate comprehensive insights and scoring.
          </p>
          <div className="space-y-2 text-left max-w-sm mx-auto">
            {[
              'Analyzing code complexity and efficiency...',
              'Evaluating communication skills...',
              'Assessing problem-solving approach...',
              'Generating personalized feedback...',
              'Computing final scores...'
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="flex items-center text-gray-400"
              >
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const { overallScore, isPassed, scores, metrics, strengths, improvements, detailedFeedback } = evaluationData;

  // Chart data
  const skillsRadarData = {
    labels: [
      'Technical Knowledge',
      'Problem Solving',
      'Communication',
      'Code Quality',
      'Behavioral Fit',
      'Creativity'
    ],
    datasets: [
      {
        label: 'Your Scores',
        data: Object.values(scores),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const performanceData = {
    labels: ['Behavioral', 'Technical', 'Coding'],
    datasets: [
      {
        label: 'Performance Score',
        data: [
          scores.behavioral_fit,
          (scores.technical_knowledge + scores.problem_solving) / 2,
          (scores.code_quality + scores.creativity) / 2
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeDistributionData = {
    labels: ['Behavioral Questions', 'Technical Questions', 'Coding Questions'],
    datasets: [
      {
        data: [30, 25, 45], // Percentage distribution
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            {isPassed ? (
              <Trophy className="w-12 h-12 text-yellow-400 mr-3" />
            ) : (
              <Target className="w-12 h-12 text-red-400 mr-3" />
            )}
            <h1 className="text-4xl font-bold text-white">
              Interview Evaluation Report
            </h1>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`glass p-8 rounded-2xl mb-8 bg-gradient-to-r ${getScoreBg(overallScore)}`}
        >
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">
              {overallScore}/100
            </div>
            <div className="flex items-center justify-center mb-4">
              {isPassed ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-300 mr-2" />
                  <span className="text-2xl font-semibold text-green-300">
                    Congratulations! You Passed
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-300 mr-2" />
                  <span className="text-2xl font-semibold text-red-300">
                    Keep Learning - Try Again
                  </span>
                </>
              )}
            </div>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {isPassed 
                ? "Excellent performance! You've demonstrated strong technical skills and would be a great fit for the role."
                : "Good effort! With some additional preparation in the highlighted areas, you'll be ready for success."
              }
            </p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Clock,
              label: 'Total Time',
              value: formatTime(metrics.totalTime),
              color: 'text-blue-400'
            },
            {
              icon: Target,
              label: 'Questions Answered',
              value: `${metrics.questionsAnswered}/${metrics.totalQuestions}`,
              color: 'text-green-400'
            },
            {
              icon: Code,
              label: 'Avg Time/Question',
              value: formatTime(metrics.avgTimePerQuestion),
              color: 'text-purple-400'
            },
            {
              icon: TrendingUp,
              label: 'Performance Level',
              value: isPassed ? 'Excellent' : 'Good',
              color: isPassed ? 'text-green-400' : 'text-yellow-400'
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass p-6 rounded-xl text-center"
            >
              <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-3`} />
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Radar Chart */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Skills Assessment
            </h3>
            <div className="h-80">
              <Radar 
                data={skillsRadarData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'white'
                      }
                    }
                  },
                  scales: {
                    r: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      pointLabels: {
                        color: 'white',
                        font: {
                          size: 12
                        }
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        backdropColor: 'transparent'
                      },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Performance by Category */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Performance by Category
            </h3>
            <div className="h-80">
              <Bar 
                data={performanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'white'
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'white'
                      },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Time Distribution */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Time Distribution
            </h3>
            <div className="h-64">
              <Doughnut 
                data={timeDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'white',
                        padding: 20,
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-400" />
              Key Strengths
            </h3>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{strength}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Improvement Areas */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Growth Opportunities
            </h3>
            <div className="space-y-3">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-yellow-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{improvement}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Feedback */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="glass p-8 rounded-xl mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-400" />
            Detailed AI Feedback
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(detailedFeedback).map(([category, feedback], index) => (
              <div key={category} className="glass-dark p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                  {category} Assessment
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{feedback}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors">
            <Share className="w-5 h-5 mr-2" />
            Share Results
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Take Another Interview
          </button>
          
          {!isPassed && (
            <button
              onClick={() => navigate('/upload')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <Target className="w-5 h-5 mr-2" />
              Practice & Improve
            </button>
          )}
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>
            Powered by Advanced AI • Generated in real-time • 
            <span className="text-blue-400 ml-1">CodeSage v2.0</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EvaluationReport;
