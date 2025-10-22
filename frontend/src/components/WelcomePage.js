import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Code, Users, Shield, Mic, BarChart } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: "AI-Powered", desc: "Advanced Gemini AI for intelligent evaluation" },
    { icon: Code, title: "Live Coding", desc: "Real-time code analysis and feedback" },
    { icon: Mic, title: "Voice Interview", desc: "Natural conversation during coding" },
    { icon: Shield, title: "Secure", desc: "Enterprise-grade anti-cheat protection" },
    { icon: BarChart, title: "Detailed Analytics", desc: "Comprehensive performance metrics" },
    { icon: Users, title: "Personalized", desc: "Custom questions based on your resume" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-8"
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-blue-400 mr-4 float-animation" />
            <h1 className="text-6xl font-bold text-white">
              Code<span className="text-blue-400">Sage</span>
            </h1>
          </div>
          
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The World's First AI-Powered Voice Technical Interviewer
          </p>
          
          <div className="glass p-6 rounded-2xl max-w-2xl mx-auto mb-8">
            <p className="text-lg text-white leading-relaxed">
              Experience the future of technical interviews with our advanced AI system 
              that analyzes your resume, generates personalized questions, and provides 
              comprehensive evaluation with detailed metrics and scoring.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 pulse-glow"
          >
            Start Your AI Interview
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-dark p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Process Flow */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass p-8 rounded-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Upload Resume", desc: "Upload your PDF/TXT resume for AI analysis" },
              { step: "2", title: "AI Analysis", desc: "Gemini AI generates 7-8 personalized questions" },
              { step: "3", title: "Live Interview", desc: "Answer personality & technical questions with voice" },
              { step: "4", title: "Get Results", desc: "Receive detailed evaluation with score /100" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 grid md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: "95%", label: "Accuracy Rate" },
            { number: "<2s", label: "AI Response Time" },
            { number: "100+", label: "Evaluation Metrics" }
          ].map((stat, index) => (
            <div key={index} className="glass-dark p-6 rounded-xl">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
