# scripts/enroll_speaker.py
import sys
import librosa
from resemblyzer import VoiceEncoder
import psycopg2

if len(sys.argv) != 3:
    print("Usage: python enroll_speaker.py user_id audio_file.wav")
    sys.exit(1)

user_id = int(sys.argv[1])
audio_path = sys.argv[2]

# Load audio
wav, sr = librosa.load(audio_path, sr=16000)
encoder = VoiceEncoder()
embedding = encoder.embed_utterance(wav).tolist()

# Insert into DB (update if exists)
conn = psycopg2.connect(dbname="meetings", user="postgres", password="password")
cur = conn.cursor()
cur.execute("""
    INSERT INTO speakers (user_id,name,embedding) VALUES (%s,%s,%s)
    ON CONFLICT (user_id) DO UPDATE SET embedding = EXCLUDED.embedding;
""", (user_id, f"User{user_id}", embedding))
conn.commit()
conn.close()
print(f"Enrolled user {user_id} from {audio_path}")
