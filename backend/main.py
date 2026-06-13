from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import pdfplumber
import requests
import json
from hf_service import ask_phi3

from ai_service import generate_roadmap
from auth import router as auth_router

app.include_router(auth_router)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home route
@app.get("/")
def home():
    return {"message": "NeuroLearn API Running"}


# Generate roadmap
@app.post("/generate-roadmap")
def roadmap(data: dict):

    roadmap = generate_roadmap(
        data["goal"],
        data["duration"],
        data["level"]
    )

    return {
        "roadmap": roadmap
    }


# Upload notes
@app.post("/upload-notes")
async def upload_notes(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }


# Notes list
@app.get("/notes")
def get_notes():

    os.makedirs("uploads", exist_ok=True)

    files = os.listdir("uploads")

    return {
        "notes": files
    }


# AI Summary (Phi3)
@app.get("/summarize/{filename}")
def summarize_notes(filename: str):

    file_path = f"uploads/{filename}"

    text = ""

    if filename.endswith(".pdf"):

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()

                if extracted:
                    text += extracted

    else:

        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()

    prompt = f"""
Summarize these study notes clearly for a student.

Notes:
{text[:4000]}
"""

    result = ask_phi3(prompt)

    print(result)

    if "choices" in result:
        summary = result["choices"][0]["message"]["content"]
    else:
        summary = str(result)

    return {
        "summary": summary
    }


# AI Quiz Generator (Phi3)
@app.get("/quiz/{filename}")
def generate_quiz(filename: str):

    file_path = f"uploads/{filename}"

    import os

    print("FILE PATH:", file_path)
    print("FILES IN UPLOADS:", os.listdir("uploads"))
    print("EXISTS:", os.path.exists(file_path))

    text = ""

    if filename.endswith(".pdf"):

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()

                if extracted:
                    text += extracted

    else:

        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()

    prompt = f"""
Create exactly 3 multiple-choice quiz questions from these study notes.

Rules:
- Each question must have 4 complete answer options.
- Do NOT use A/B/C/D as option text.
- Use actual content from the notes.
- Return ONLY valid JSON.
- No markdown.
- No explanation.

Format:

[
  {{
    "question": "Question text",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": "Correct option"
  }}
]

Notes:
{text[:3000]}
"""


    result = ask_phi3(prompt)

    print("HF RESPONSE:")
    print(result)

    if "choices" in result:
        quiz_text = result["choices"][0]["message"]["content"]

        try:
            quiz = json.loads(quiz_text)
        except:
            quiz = []
    else:
        return {
            "quiz": [],
            "error": result
        }

    return {
        "quiz": quiz
    }