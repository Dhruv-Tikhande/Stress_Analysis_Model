from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure NLTK data is downloaded locally
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# 1. Initialize the Web App
app = FastAPI(title="Reddit Stress Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all frontend domains to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the AI Model and Vectorizer
print("Loading AI Models...")
with open('stress_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('tfidf_vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)
print("Models Loaded Successfully!")

# 3. Define the Input Data Format
class UserInput(BaseModel):
    text: str

# 4. The Text Cleaning Function (Same as Colab)
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\[.*?\]|r/|u/', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return ' '.join(cleaned_words)

# 5. Create the API Endpoint
@app.post("/predict")
def predict_stress(input_data: UserInput):
    # Convert to lowercase for easier matching
    raw_text = input_data.text.lower()
    
    # 🚨 1. UPGRADED CRISIS OVERRIDE 
    # Use partial phrases so typos like "wan to" don't break the system
    crisis_phrases = [
        "kill myself", 
        "kill someone", 
        "suicide", 
        "end my life", 
        "want to die", 
        "hurt myself", 
        "hurt someone",
        "harm myself"
    ]
    
    # Check if ANY of the crisis phrases are hidden anywhere inside the text
    if any(phrase in raw_text for phrase in crisis_phrases):
        return {
            "original_text": input_data.text,
            "is_stressed": True,
            "stress_probability": 99.99 
        }

    # 🤖 2. THE MACHINE LEARNING ENGINE
    cleaned = clean_text(input_data.text)
    vectorized_text = vectorizer.transform([cleaned])
    prediction = model.predict(vectorized_text)[0]
    probability = model.predict_proba(vectorized_text)[0][1] 
    
    return {
        "original_text": input_data.text,
        "is_stressed": bool(prediction == 1),
        "stress_probability": round(probability * 100, 2)
    }