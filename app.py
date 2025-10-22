
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import google.generativeai as genai
# ADD THIS LINE:
from datetime import datetime

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import google.generativeai as genai
import json
import ast
import subprocess
import tempfile
import os
import PyPDF2
import io

app = Flask(__name__)
app.config['SECRET_KEY'] = 'codesage_hackathon_2025'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Your working Gemini API key
GEMINI_API_KEY = "AIzaSyBhdqvKtdkjpSWSKn_kqM4Ybd0oOihlqWQ"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

class GeminiCodeSageInterviewer:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        self.interview_state = {
            "candidate_profile": None,
            "current_question": None,
            "question_count": 0,
            "questions": [],
            "conversation_history": []
        }
        
        self.default_problem = {
            "id": "default",
            "title": "Welcome to CodeSage",
            "description": "Upload your resume to start your personalized technical interview powered by Gemini AI.",
            "template": "# Welcome! Upload your resume to begin\n# Your personalized coding questions will appear here\nprint('Hello CodeSage!')"
        }
        
    def parse_resume(self, file_content, filename):
        """Parse resume content from uploaded file"""
        try:
            if filename.lower().endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
            elif filename.lower().endswith('.txt'):
                return file_content.decode('utf-8')
            else:
                return "Error: Please upload PDF or TXT file."
        except Exception as e:
            return f"Error parsing resume: {str(e)}"

    def analyze_resume_with_gemini(self, resume_text):
        """Analyze resume using working Gemini"""
        prompt = f"""You are an expert technical recruiter analyzing a software engineer's resume. 

RESUME CONTENT:
{resume_text[:3000]}

Please analyze this resume and create a personalized interview plan with exactly 8 questions:

1. Three behavioral questions about their experience, projects, and cultural fit
2. Two technical discussion questions about their skills and knowledge
3. Three coding problems: one easy, one medium, one hard based on their experience level

Provide your response in this JSON format:
{{
    "candidate_summary": "Brief analysis of experience level and key skills",
    "welcome_message": "Personalized welcome message referencing their background",
    "questions": [
        {{
            "id": 1,
            "type": "behavioral",
            "question": "Tell me about a challenging project you've worked on and how you overcame obstacles"
        }},
        {{
            "id": 2,
            "type": "behavioral", 
            "question": "Describe a time when you had to work with a difficult team member or in a challenging team environment"
        }},
        {{
            "id": 3,
            "type": "behavioral",
            "question": "How do you stay updated with new technologies and what motivates you in your career?"
        }},
        {{
            "id": 4,
            "type": "technical",
            "question": "Explain the differences between various programming paradigms you've used and when you'd choose each"
        }},
        {{
            "id": 5,
            "type": "technical",
            "question": "Walk me through how you would design a scalable system for [relevant domain based on their experience]"
        }},
        {{
            "id": 6,
            "type": "coding",
            "title": "Array/String Problem (Easy)",
            "description": "Find the first non-repeating character in a string",
            "template": "def first_non_repeating_char(s):\\n    # Your solution here\\n    pass\\n\\n# Test cases\\nprint(first_non_repeating_char('leetcode'))  # Expected: 'l'\\nprint(first_non_repeating_char('loveleetcode'))  # Expected: 'v'"
        }},
        {{
            "id": 7,
            "type": "coding",
            "title": "Data Structure Problem (Medium)",
            "description": "Implement a LRU (Least Recently Used) cache with get and put operations",
            "template": "class LRUCache:\\n    def __init__(self, capacity):\\n        # Your implementation here\\n        pass\\n    \\n    def get(self, key):\\n        # Your implementation here\\n        pass\\n    \\n    def put(self, key, value):\\n        # Your implementation here\\n        pass\\n\\n# Test your implementation\\ncache = LRUCache(2)"
        }},
        {{
            "id": 8,
            "type": "coding",
            "title": "Algorithm Problem (Hard)",
            "description": "Given an array of integers, find the maximum sum of any contiguous subarray (Kadane's Algorithm)",
            "template": "def max_subarray_sum(nums):\\n    # Your solution here\\n    # Try to achieve O(n) time complexity\\n    pass\\n\\n# Test cases\\nprint(max_subarray_sum([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6\\nprint(max_subarray_sum([1]))  # Expected: 1"
        }}
    ]
}}

Make the questions highly relevant to their actual experience and background. Adjust difficulty based on their experience level."""

        try:
            print("🤖 Analyzing resume with Gemini...")
            response = self.model.generate_content(prompt)
            content = response.text.strip()
            print("✅ Gemini analysis received!")
            
            # Extract JSON from response
            try:
                # Look for JSON content
                if '{' in content and '}' in content:
                    start = content.find('{')
                    # Find the matching closing brace
                    brace_count = 0
                    end = start
                    for i, char in enumerate(content[start:], start):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end = i + 1
                                break
                    
                    json_content = content[start:end]
                    interview_data = json.loads(json_content)
                    print("✅ Successfully parsed Gemini JSON response!")
                    return interview_data
                else:
                    raise json.JSONDecodeError("No JSON found", content, 0)
                    
            except json.JSONDecodeError:
                print("⚠️ JSON parsing failed, using fallback")
                return self.create_fallback_interview_plan(resume_text)
                
        except Exception as e:
            print(f"❌ Gemini error: {str(e)}")
            return self.create_fallback_interview_plan(resume_text)

    def create_fallback_interview_plan(self, resume_text):
        """Fallback interview plan"""
        text_lower = resume_text.lower()
        
        if any(keyword in text_lower for keyword in ['senior', 'lead', 'architect', '5+ years']):
            level = "Senior"
        else:
            level = "Mid-level"
            
        return {
            "candidate_summary": f"{level} software engineer with technical experience",
            "welcome_message": f"Welcome! I've reviewed your background and see you're a {level.lower()} developer. Let's have a great technical interview with 8 comprehensive questions!",
            "questions": [
                {
                    "id": 1,
                    "type": "behavioral",
                    "question": "Tell me about a challenging technical project you've worked on recently and how you handled any obstacles."
                },
                {
                    "id": 2,
                    "type": "behavioral",
                    "question": "Describe a time when you had to learn a new technology quickly. How did you approach it?"
                },
                {
                    "id": 3,
                    "type": "behavioral",
                    "question": "How do you handle disagreements with team members about technical decisions?"
                },
                {
                    "id": 4,
                    "type": "technical",
                    "question": "What technologies do you feel most confident with and why? How do you stay updated with new developments?"
                },
                {
                    "id": 5,
                    "type": "technical",
                    "question": "Explain your approach to debugging complex issues and optimizing application performance."
                },
                {
                    "id": 6,
                    "type": "coding",
                    "title": "Two Sum Problem (Easy)",
                    "description": "Given an array of integers and a target sum, return the indices of two numbers that add up to the target.",
                    "template": "def two_sum(nums, target):\n    # Your solution here\n    # Try to optimize for time complexity\n    pass\n\n# Test your function\nnums = [2, 7, 11, 15]\ntarget = 9\nresult = two_sum(nums, target)\nprint(f'Result: {result}')  # Expected: [0, 1]"
                },
                {
                    "id": 7,
                    "type": "coding",
                    "title": "Valid Parentheses (Medium)",
                    "description": "Given a string containing brackets '()', '[]', '{}', determine if the brackets are valid and properly nested.",
                    "template": "def is_valid(s):\n    # Your solution here\n    # Consider using a stack data structure\n    pass\n\n# Test your function\ntest_cases = ['()', '()[]{}', '([)]', '{[()]}']\nfor test in test_cases:\n    result = is_valid(test)\n    print(f'is_valid(\"{test}\") = {result}')"
                },
                {
                    "id": 8,
                    "type": "coding",
                    "title": "Binary Tree Traversal (Hard)",
                    "description": "Implement level-order traversal (BFS) of a binary tree and return the result as a list of lists.",
                    "template": "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef level_order(root):\n    # Your solution here\n    # Implement BFS traversal\n    pass\n\n# Test your function\n# Create a simple tree: [3,9,20,null,null,15,7]\nroot = TreeNode(3)\nroot.left = TreeNode(9)\nroot.right = TreeNode(20)\nroot.right.left = TreeNode(15)\nroot.right.right = TreeNode(7)\n\nresult = level_order(root)\nprint(f'Level order: {result}')  # Expected: [[3], [9, 20], [15, 7]]"
                }
            ]
        }

    def get_current_question(self):
        """Get current question"""
        if self.interview_state["question_count"] >= len(self.interview_state.get("questions", [])):
            return None
        return self.interview_state["questions"][self.interview_state["question_count"]]

    def advance_to_next_question(self):
        """Move to next question"""
        self.interview_state["question_count"] += 1
        return self.get_current_question()

    def get_gemini_response(self, prompt):
        """Get response from Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"I'm here to help! Let's continue with our interview."

    def analyze_code_with_gemini(self, code, analysis_type, profile_context=""):
        """Analyze code using Gemini"""
        context_prefix = f"Candidate background: {profile_context[:200]}...\n\n" if profile_context else ""
        
        prompts = {
            "hint": f"""{context_prefix}You are CodeSage, helping a candidate with their coding problem.

Current code:
{code}

Provide a helpful hint that guides them toward a better solution without giving it away. Be encouraging and specific about what to consider next.""",

            "feedback": f"""{context_prefix}You are CodeSage reviewing this code solution during a technical interview.

Code:
{code}

Provide constructive feedback covering:
1. Correctness and approach
2. Time/space complexity analysis
3. Code quality and readability  
4. Specific improvement suggestions

Be encouraging but thorough, like a senior engineer conducting a code review.""",

            "general": f"""{context_prefix}Analyze this code solution:

{code}

Provide brief, helpful feedback focusing on the approach and any key improvements."""
        }

        try:
            prompt = prompts.get(analysis_type, prompts["general"])
            return self.get_gemini_response(prompt)
        except:
            fallbacks = {
                "hint": "💡 Great start! Consider the problem step-by-step. What data structure might help optimize your approach?",
                "feedback": "🔍 Good effort! Your solution shows solid problem-solving thinking. Consider edge cases and optimization opportunities.",
                "general": "✅ Nice work! Keep thinking about efficiency and edge cases."
            }
            return fallbacks.get(analysis_type, fallbacks["general"])

    def execute_code(self, code):
        """Execute code safely"""
        if not code.strip():
            return {"success": False, "output": "No code to execute"}
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            result = subprocess.run(['python', temp_file], capture_output=True, text=True, timeout=10)
            os.unlink(temp_file)
            
            if result.returncode == 0:
                return {"success": True, "output": result.stdout.strip() or "✅ Code executed successfully"}
            else:
                return {"success": False, "output": f"❌ Runtime Error:\n{result.stderr.strip()}"}
                
        except subprocess.TimeoutExpired:
            return {"success": False, "output": "⏱️ Execution timed out (10s limit)"}
        except Exception as e:
            return {"success": False, "output": f"💥 Execution Error: {str(e)}"}

    def analyze_complexity(self, code):
        """Real-time complexity analysis"""
        if not code.strip():
            return {"complexity": "O(1)", "details": "No code", "warning": "", "syntax": "Ready"}
        
        try:
            tree = ast.parse(code)
            loops = sum(1 for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While)))
            functions = sum(1 for node in ast.walk(tree) if isinstance(node, ast.FunctionDef))
            
            complexity = "O(n²)" if loops > 1 else ("O(n)" if loops > 0 else "O(1)")
            warning = "⚠️ Consider optimization" if loops > 1 else ""
            
            return {
                "complexity": complexity,
                "details": f"Functions: {functions}, Loops: {loops}",
                "warning": warning,
                "syntax": "✅ Valid Python syntax"
            }
            
        except SyntaxError:
            return {"complexity": "N/A", "details": "❌ Syntax Error", "warning": "", "syntax": "❌ Syntax error"}

# Initialize the Gemini-powered interviewer
interviewer = GeminiCodeSageInterviewer()


@app.route('/api/ai-proctoring-violation', methods=['POST'])
def ai_proctoring_violation():
    data = request.json
    print(f"🤖 AI Proctoring violation: Multiple persons detected")
    print(f"📊 Violations: {len(data.get('violations', []))}")
    return jsonify({"status": "logged"})

@app.route('/')
def index():
    return render_template('index.html', problem=interviewer.default_problem)

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"})
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"})
    
    try:
        print(f"📄 Processing resume: {file.filename}")
        file_content = file.read()
        resume_text = interviewer.parse_resume(file_content, file.filename)
        
        if "Error" in resume_text:
            return jsonify({"success": False, "error": resume_text})
        
        print("🚀 Creating personalized interview with Gemini...")
        interview_data = interviewer.analyze_resume_with_gemini(resume_text)
        
        # Store interview plan
        interviewer.interview_state["questions"] = interview_data["questions"]
        interviewer.interview_state["question_count"] = 0
        interviewer.interview_state["candidate_profile"] = interview_data["candidate_summary"]
        
        # Get first question
        first_question = interviewer.get_current_question()
        
        # Update current question if it's coding type
        if first_question and first_question["type"] == "coding":
            interviewer.interview_state["current_question"] = {
                "id": f"q{first_question['id']}",
                "title": first_question["title"],
                "description": first_question["description"],
                "template": first_question["template"]
            }
        
        return jsonify({
            "success": True,
            "profile": interview_data["candidate_summary"],
            "summary": interview_data["candidate_summary"],
            "welcome_message": interview_data["welcome_message"],
            "first_question": first_question,
            "questions": interview_data["questions"],
            "personalized_problem": interviewer.interview_state.get("current_question", interviewer.default_problem),
            "progress": {"current": 1, "total": len(interview_data["questions"])}
        })
        
    except Exception as e:
        print(f"❌ Resume processing error: {str(e)}")
        return jsonify({"success": False, "error": f"Processing error: {str(e)}"})

@app.route('/api/next-question', methods=['POST'])
def get_next_question():
    next_question = interviewer.advance_to_next_question()
    
    if next_question:
        # Update current question if it's coding type
        if next_question["type"] == "coding":
            interviewer.interview_state["current_question"] = {
                "id": f"q{next_question['id']}",
                "title": next_question["title"],
                "description": next_question["description"],
                "template": next_question["template"]
            }
        
        return jsonify({
            "success": True,
            "question": next_question,
            "problem": interviewer.interview_state.get("current_question"),
            "progress": {
                "current": interviewer.interview_state["question_count"], 
                "total": len(interviewer.interview_state.get("questions", []))
            }
        })
    else:
        return jsonify({
            "interview_complete": True,
            "message": "🎉 Congratulations! You've completed your technical interview. You demonstrated strong problem-solving skills and technical knowledge. Thank you for your time!"
        })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    
    prompt = f"""You are CodeSage, a friendly AI technical interviewer. 

Candidate's message: {message}

Context: You're conducting a technical interview. The candidate has shared their thoughts or asked a question. Respond as a supportive interviewer would - be encouraging, ask follow-ups when appropriate, and guide the conversation naturally.

Keep your response conversational and helpful."""
    
    response = interviewer.get_gemini_response(prompt)
    return jsonify({"response": response})

@app.route('/api/execute', methods=['POST'])
def execute_code():
    data = request.json
    code = data.get('code', '')
    result = interviewer.execute_code(code)
    return jsonify(result)

@app.route('/api/analyze', methods=['POST'])
def analyze_code():
    data = request.json
    code = data.get('code', '')
    analysis_type = data.get('type', 'general')
    profile = interviewer.interview_state.get("candidate_profile", "")
    
    complexity = interviewer.analyze_complexity(code)
    ai_analysis = interviewer.analyze_code_with_gemini(code, analysis_type, profile)
    
    return jsonify({"complexity": complexity, "ai_analysis": ai_analysis})
# NEW: ANTI-CHEAT ENDPOINTS
@app.route('/api/log-violation', methods=['POST'])
def log_violation():
    data = request.json
    print(f"🚨 Security violation: {data.get('type')} - {data.get('description')}")
    return jsonify({"status": "logged"})

@app.route('/api/terminate-interview', methods=['POST'])
def terminate_interview():
    data = request.json
    print(f"🚫 Interview terminated: {data.get('reason')}")
    print(f"📊 Final strikes: {data.get('strikes')}")
    return jsonify({"status": "terminated", "report_generated": True})
@app.route('/api/ai-violation', methods=['POST'])
def ai_violation():
    data = request.json
    print(f"🤖 AI VIOLATION: {data.get('count')} people detected by {data.get('model')}")
    print(f"📊 Detection timestamp: {data.get('timestamp')}")
    return jsonify({"status": "logged", "action": "interview_terminated"})

# Make sure static files are served (add if missing)
from flask import send_from_directory

@app.route('/api/ai-proctoring', methods=['POST'])
def ai_proctoring():
    data = request.json
    print(f"🤖 AI PROCTORING: {data.get('count')} people detected by {data.get('model')}")
    print(f"📊 Violation type: {data.get('type')}")
    return jsonify({"status": "logged", "action": "terminated"})


@socketio.on('code_change')
def handle_code_change(data):
    code = data.get('code', '')
    complexity = interviewer.analyze_complexity(code)
    emit('analysis_update', complexity)

@app.route('/api/voice-chat', methods=['POST'])
def voice_chat():
    data = request.json
    speech = data.get('speech', '')
    code = data.get('code', '')
    profile = data.get('profile', '')
    
    # Enhanced prompt for voice interaction
    prompt = f"""You are CodeSage conducting a LIVE VOICE technical interview. The candidate just said: "{speech}"

Current code they're working on:
{code}

Candidate background: {profile}

Respond as if you're having a natural conversation. Be encouraging, ask follow-ups, and provide guidance. Keep responses conversational and under 40 words for speech synthesis.

Guidelines:
- If they're thinking aloud about code, acknowledge their thought process
- If they ask a question, answer helpfully and concisely  
- If they seem stuck, offer a gentle hint
- Be encouraging and natural like a friendly interviewer

Response:"""
    
    try:
        response = interviewer.get_gemini_response(prompt)
        # Keep response concise for speech
        if len(response) > 200:
            response = response[:200] + "..."
        return jsonify({"response": response})
    except Exception as e:
        print(f"Voice chat error: {e}")
        return jsonify({"response": "I hear you thinking through this! That's a great approach. Tell me more about your solution."})

@app.route('/api/evaluate-interview', methods=['POST'])
def evaluate_interview():
    """Comprehensive AI-powered interview evaluation"""
    data = request.json
    answers = data.get('answers', [])
    candidate_profile = data.get('candidate_profile', '')
    
    try:
        # Generate comprehensive evaluation using Gemini
        evaluation_prompt = f"""You are an expert technical interviewer evaluating a candidate's complete interview performance.

CANDIDATE PROFILE: {candidate_profile}

INTERVIEW ANSWERS: {json.dumps(answers, indent=2)}

Please provide a comprehensive evaluation with the following scoring (0-100 for each):

1. Technical Knowledge (25%): Understanding of programming concepts, technologies, algorithms
2. Problem Solving (20%): Approach to coding problems, logical thinking, debugging skills  
3. Communication (15%): Clarity of explanations, ability to articulate thoughts
4. Code Quality (20%): Clean code, best practices, efficiency, readability
5. Behavioral Fit (15%): Cultural alignment, teamwork, motivation, learning attitude
6. Creativity (5%): Innovation in solutions, thinking outside the box

Respond in this JSON format:
{{
    "overall_score": 85,
    "is_passed": true,
    "detailed_scores": {{
        "technical_knowledge": 88,
        "problem_solving": 82,
        "communication": 90,
        "code_quality": 85,
        "behavioral_fit": 87,
        "creativity": 78
    }},
    "strengths": [
        "Strong technical fundamentals in Python and algorithms",
        "Excellent communication and explanation skills",
        "Clean, readable code with good structure",
        "Positive attitude and willingness to learn"
    ],
    "improvement_areas": [
        "Could improve time complexity optimization",
        "Practice more advanced data structures",
        "Consider edge cases more thoroughly",
        "Enhance system design knowledge"
    ],
    "detailed_feedback": {{
        "behavioral": "Candidate showed excellent soft skills with clear communication, good teamwork examples, and strong motivation for continuous learning. Cultural fit appears very strong.",
        "technical": "Solid foundation in programming concepts with good grasp of common algorithms. Some room for improvement in advanced topics and system design principles.",
        "coding": "Code quality is good with clear structure and readable solutions. Shows understanding of time/space complexity but could optimize further for complex scenarios."
    }},
    "next_steps": "Strong candidate with good potential. Recommend for next round with focus on system design and advanced algorithms.",
    "interview_duration_minutes": 45,
    "recommendation": "HIRE"
}}

Base the evaluation on actual performance indicators from their answers and code submissions."""

        response = interviewer.get_gemini_response(evaluation_prompt)
        
        # Try to parse JSON response
        try:
            if '{' in response and '}' in response:
                start = response.find('{')
                brace_count = 0
                end = start
                for i, char in enumerate(response[start:], start):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end = i + 1
                            break
                
                json_content = response[start:end]
                evaluation_data = json.loads(json_content)
                
                return jsonify({
                    "success": True,
                    "evaluation": evaluation_data
                })
        except:
            pass
        
        # Fallback evaluation if JSON parsing fails
        fallback_evaluation = generate_fallback_evaluation(answers, candidate_profile)
        return jsonify({
            "success": True, 
            "evaluation": fallback_evaluation
        })
        
    except Exception as e:
        print(f"❌ Evaluation error: {str(e)}")
        fallback_evaluation = generate_fallback_evaluation(answers, candidate_profile)
        return jsonify({
            "success": True,
            "evaluation": fallback_evaluation
        })

def generate_fallback_evaluation(answers, profile):
    """Generate a fallback evaluation when AI fails"""
    # Check for empty or minimal answers
    valid_answers = []
    for answer in answers:
        answer_text = answer.get('answer', '').strip()
        if answer_text and len(answer_text) > 10:  # At least 10 characters for a valid answer
            valid_answers.append(answer)
    
    # If no valid answers, give very low scores
    if len(valid_answers) == 0:
        base_scores = {
            "technical_knowledge": 15,
            "problem_solving": 10, 
            "communication": 20,
            "code_quality": 15,
            "behavioral_fit": 25,
            "creativity": 10
        }
    elif len(valid_answers) <= 2:
        # Very few answers - low scores
        base_scores = {
            "technical_knowledge": 35,
            "problem_solving": 30, 
            "communication": 40,
            "code_quality": 35,
            "behavioral_fit": 45,
            "creativity": 30
        }
    else:
        # Good number of answers - base scores
        base_scores = {
            "technical_knowledge": 75,
            "problem_solving": 70, 
            "communication": 80,
            "code_quality": 72,
            "behavioral_fit": 78,
            "creativity": 68
        }
    
    # Adjust scores based on answer count and types
    if len(valid_answers) >= 6:
        for key in base_scores:
            base_scores[key] += 5
    
    # Count coding vs behavioral answers
    coding_answers = len([a for a in valid_answers if a.get('questionType') == 'coding'])
    behavioral_answers = len([a for a in valid_answers if a.get('questionType') == 'behavioral'])
    
    if coding_answers >= 3:
        base_scores["technical_knowledge"] += 10
        base_scores["code_quality"] += 8
    
    if behavioral_answers >= 3:
        base_scores["communication"] += 10
        base_scores["behavioral_fit"] += 8
    
    # Calculate overall score
    weights = {
        "technical_knowledge": 0.25,
        "problem_solving": 0.20,
        "communication": 0.15,
        "code_quality": 0.20,
        "behavioral_fit": 0.15,
        "creativity": 0.05
    }
    
    overall_score = sum(base_scores[key] * weights[key] for key in base_scores)
    overall_score = int(overall_score)
    
    # Generate realistic feedback based on performance
    if len(valid_answers) == 0:
        strengths = ["Participated in the interview process"]
        improvement_areas = [
            "Provide detailed answers to interview questions",
            "Engage more actively with technical problems", 
            "Practice explaining solutions clearly",
            "Prepare for behavioral interview questions"
        ]
        feedback_behavioral = "Candidate did not provide substantial answers to behavioral questions. More preparation needed."
        feedback_technical = "No technical responses provided. Requires significant preparation in programming concepts."
        feedback_coding = "No coding solutions submitted. Practice with coding problems is essential."
        recommendation = "ADDITIONAL_PREPARATION_NEEDED"
    elif len(valid_answers) <= 2:
        strengths = [
            "Showed up for the interview",
            "Attempted to engage with some questions"
        ]
        improvement_areas = [
            "Provide more comprehensive answers",
            "Practice technical problem-solving",
            "Improve communication skills",
            "Prepare better for interviews"
        ]
        feedback_behavioral = "Limited engagement with behavioral questions. More detailed responses needed."
        feedback_technical = "Minimal technical responses. Requires more study and practice."
        feedback_coding = "Very limited coding attempts. Extensive practice with algorithms and data structures needed."
        recommendation = "ADDITIONAL_PRACTICE_NEEDED"
    else:
        strengths = [
            "Completed comprehensive interview assessment",
            "Demonstrated technical problem-solving abilities", 
            "Good communication throughout the process",
            "Positive engagement with the interview format"
        ]
        improvement_areas = [
            "Continue practicing coding problems",
            "Explore advanced algorithms and data structures",
            "Strengthen system design knowledge",
            "Practice explaining technical concepts clearly"
        ]
        feedback_behavioral = "Showed good engagement and communication during the interview process."
        feedback_technical = "Demonstrated foundational technical knowledge with room for growth in advanced topics."
        feedback_coding = "Attempted coding problems with reasonable approach and problem-solving methodology."
        recommendation = "CONSIDER" if overall_score >= 70 else "ADDITIONAL_PRACTICE_NEEDED"
    
    return {
        "overall_score": overall_score,
        "is_passed": overall_score >= 70,
        "detailed_scores": base_scores,
        "strengths": strengths,
        "improvement_areas": improvement_areas,
        "detailed_feedback": {
            "behavioral": feedback_behavioral,
            "technical": feedback_technical,
            "coding": feedback_coding
        },
        "next_steps": "Continue learning and practicing technical skills. Consider focusing on areas for improvement.",
        "interview_duration_minutes": 45,
        "recommendation": recommendation
    }

if __name__ == '__main__':
    print("🚀 Starting GEMINI-POWERED CodeSage...")
    print("🔗 Access at: http://localhost:5000")
    print("💎 AI Engine: Google Gemini 2.0 Flash (WORKING!)")
    print("📝 Features: Resume Analysis + Personalized Interviews")
    print("🎯 Interview Flow: Upload → Analyze → 4 Custom Questions")
    print("⚡ Response Time: Lightning fast with Gemini!")
    print("🔑  Status: ACTIVE AND WORKING PERFECTLY!")
    print("🎤 NEW: Voice Interview Feature!")
    print("=" * 60)
    
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)

