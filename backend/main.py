from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import google.generativeai as genai
import subprocess
import tempfile
import os
import json
from datetime import datetime
import logging
from dotenv import load_dotenv


load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Recursive AI Executor", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str
    max_attempts: Optional[int] = 5

class CodeExecutionResult(BaseModel):
    success: bool
    code: str
    output: str
    error: Optional[str] = None
    attempts: int
    execution_time: float
    
    class Config:
        orm_mode = True


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")


if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')


def clean_generated_code(text: str) -> str:
    try:
        txt = text.strip()
        if "```" in txt:
            parts = txt.split("```")
           
            for i in range(1, len(parts), 2):
                block = parts[i]
                lines = block.splitlines()
                if lines and lines[0].strip().lower().startswith(("python", "py")):
                    lines = lines[1:]
                code = "\n".join(lines).strip()
                if code:
                    return code
            
            return txt.replace("```python", "").replace("```", "").strip()
       
        return txt.replace("```python", "").replace("```", "").strip()
    except Exception:
        return text

def generate_python_code(prompt: str, previous_error: str = None) -> str:
    """Generate Python code using Google Gemini"""
    try:
        if not GEMINI_API_KEY:
            raise Exception("Gemini API key not configured")
        
       
        full_prompt = f"""
Generate Python code for the following task: {prompt}

Requirements:
- Return only executable Python code without any explanations
- Do NOT include markdown fences or triple backticks
- Make sure the code is complete and runnable
- Include necessary imports
- Add a main execution block if needed
- Handle potential errors gracefully
"""
        
        if previous_error:
            full_prompt += f"\n\nPrevious error encountered: {previous_error}\nPlease fix this error in the new code."
        
        response = model.generate_content(full_prompt)
        raw = response.text or ""
        return clean_generated_code(raw)
    
    except Exception as e:
        logger.error(f"Error generating code: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate code: {str(e)}")

def execute_python_code(code: str) -> Dict[str, Any]:
    """Execute Python code in a safe environment"""
    try:
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file_path = f.name
        
      
        result = subprocess.run(
            ['python', temp_file_path],
            capture_output=True,
            text=True,
            timeout=10,  
            cwd=tempfile.gettempdir()
        )
        
      
        os.unlink(temp_file_path)
        
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Execution timed out after 10 seconds',
            'returncode': -1
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': f'Execution error: {str(e)}',
            'returncode': -1
        }

@app.post("/api/execute", response_model=CodeExecutionResult)
async def execute_prompt(request: PromptRequest):
    """Main endpoint for recursive AI code execution"""
    start_time = datetime.now()
    attempts = 0
    max_attempts = request.max_attempts
    current_prompt = request.prompt
    previous_error = None
    
    while attempts < max_attempts:
        attempts += 1
        logger.info(f"Attempt {attempts}/{max_attempts}")
        
        try:
            
            generated_code = generate_python_code(current_prompt, previous_error)
            
            
            execution_result = execute_python_code(generated_code)
            
            if execution_result['success']:
                
                execution_time = (datetime.now() - start_time).total_seconds()
                return CodeExecutionResult(
                    success=True,
                    code=generated_code,
                    output=execution_result['stdout'],
                    attempts=attempts,
                    execution_time=execution_time
                )
            else:
               
                previous_error = execution_result['stderr']
                current_prompt = f"{request.prompt}\n\nError from previous attempt: {previous_error}"
                logger.info(f"Attempt {attempts} failed: {previous_error}")
        
        except Exception as e:
            logger.error(f"Error in attempt {attempts}: {e}")
            previous_error = str(e)
            current_prompt = f"{request.prompt}\n\nError from previous attempt: {previous_error}"

    execution_time = (datetime.now() - start_time).total_seconds()
    return CodeExecutionResult(
        success=False,
        code=generated_code if 'generated_code' in locals() else "",
        output="",
        error=f"Failed after {max_attempts} attempts. Last error: {previous_error}",
        attempts=attempts,
        execution_time=execution_time
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "gemini_configured": bool(GEMINI_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    print(" Starting Recursive AI Executor with Google Gemini ")
    print(f" Gemini API configured: {'✅ Yes' if GEMINI_API_KEY else '❌ No'}")
    print("Server will be available at: http://127.0.0.1:8000")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=8000)
