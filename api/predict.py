import pickle
import json

model = pickle.load(open("stress_model.pkl", "rb"))
vectorizer = pickle.load(open("tfidf_vectorizer.pkl", "rb"))

def handler(request):
    try:
        body = json.loads(request.body)
        text = body.get("text", "")

        transformed = vectorizer.transform([text])
        prediction = model.predict(transformed)[0]

        return {
            "statusCode": 200,
            "body": json.dumps({"prediction": int(prediction)})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }