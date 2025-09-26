# Recursive AI Executor

A web-based system that accepts prompts, generates Python code using GenAI (GPT-4), executes it recursively until it runs successfully, and displays the results to the user.

## 🚀 Features

- **AI Code Generation**: Uses OpenAI GPT to generate Python code from natural language prompts
- **Recursive Execution**: Automatically retries and refines code if it fails
- **Safe Execution**: Runs code in isolated environment with timeout protection
- **Modern UI**: Beautiful React frontend with Tailwind CSS
- **Real-time Feedback**: Shows execution status, attempts, and results
- **Export Results**: Save execution logs as JSON files

## 🏗️ Architecture

- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI Engine**: gemini-1.5-flash
- **Code Execution**: Subprocess with sandboxing

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Gemini API key

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
export GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 Running the Application

### 1. Start the Backend
```bash
cd backend
python main.py
```
The backend will start on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## 📖 Usage

1. **Enter a Prompt**: Describe the programming task you want to accomplish
   - Example: "Generate code to calculate factorial of a number"
   - Example: "Create a function to sort a list of numbers"

2. **Set Max Attempts**: Choose how many times the system should retry (3, 5, or 10)

3. **Click Run**: The system will:
   - Generate Python code using AI
   - Execute the code safely
   - If it fails, retry with improved code
   - Display results when successful

4. **View Results**:
   - Generated code with syntax highlighting
   - Execution output or error messages
   - Number of attempts and execution time
   - Export results as JSON

## 🔒 Security Features

- **Sandboxed Execution**: Code runs in temporary files with limited permissions
- **Timeout Protection**: 10-second execution timeout
- **Input Validation**: Sanitized user inputs
- **Resource Limits**: Controlled execution environment

## 🎯 Example Prompts

- "Write a function to find the largest number in a list"
- "Generate code to calculate the Fibonacci sequence"
- "Create a program to check if a string is a palindrome"
- "Write a function to reverse a string"

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py              # FastAPI application
│   └── __init__.py
├── frontend/
│   ├── public/
│   │   └── index.html       # Main HTML file
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Node.js dependencies
│   ├── tailwind.config.js   # Tailwind configuration
│   └── postcss.config.js    # PostCSS configuration
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🔧 API Endpoints

- `POST /api/execute` - Execute a prompt and generate/run code
- `GET /api/health` - Health check endpoint

## 🐛 Troubleshooting

### Common Issues

1. **GEMINI API Key Not Set**
   - Set the `GEMINI_API_KEY` environment variable
   - Check the backend logs for configuration errors

2. **Port Already in Use**
   - Backend: Change port in `main.py` (line with `uvicorn.run`)
   - Frontend: React will automatically suggest an alternative port

3. **CORS Errors**
   - Ensure backend is running on port 8000
   - Check that CORS middleware is properly configured

4. **Code Execution Timeout**
   - Increase timeout in `execute_python_code` function
   - Simplify your prompt for faster execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- FastAPI for the excellent web framework
- React and Tailwind CSS for the UI components
