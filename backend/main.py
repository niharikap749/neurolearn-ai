from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "NeuroLearn AI Backend Running"}