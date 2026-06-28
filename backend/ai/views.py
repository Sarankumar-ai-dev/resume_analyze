from pypdf import PdfReader
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()
resume_text_storage = ""

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("SECRET_KEY")
)

SYSTEM_PROMPT = """You are an expert resume analyst and career advisor assistant.

LANGUAGE RULES (VERY IMPORTANT):
- If the question is in Tamil (pure Tamil script) → Reply in Tamil
- If the question is in English → Reply in English  
- If the question is in Thanglish (Tamil words written in English letters, e.g. "ivan pathi sollu", "skills enna iruku") → Reply in Thanglish (Tamil in English letters)
- Always match the user's language style exactly

BEHAVIOR RULES:
- You can answer TWO types of questions:
  1. RESUME questions → Answer strictly based on the resume provided
  2. CAREER questions → Answer based on your general knowledge (job market, salary, skills, career advice, job switching, interview tips, etc.)
- Smart detection: if the question is about jobs, salary, market value, career path, skills to learn, companies, interviews → treat it as a CAREER question
- For career questions, you can relate your answer to the person's resume if relevant
- Be conversational, helpful, and encouraging
- For Thanglish: Use natural conversational Tamil transliterated in English (e.g. "Avan 3 years experience iruku Python la")

EXAMPLES:
- "What are his skills?" → RESUME question → answer from resume
- "Java full stack ku value eruka?" → CAREER question → answer from general knowledge
- "Entha company apply pannalam?" → CAREER question → suggest companies based on resume skills
- "Salary enna expect pannalam?" → CAREER question → answer based on market knowledge
"""


RESUME_BUILD_PROMPT = """You are an expert resume writer and career coach.

The user will give you their basic details like skills, achievements, description, experience, education etc.

Your job is to create a PROFESSIONAL, ATS-FRIENDLY resume in clean JSON format.

Return ONLY valid JSON, no markdown, no extra text:

{
  "name": "<full name>",
  "contact": {
    "email": "<email>",
    "phone": "<phone>",
    "linkedin": "<linkedin url or empty>",
    "github": "<github url or empty>",
    "location": "<city, country>"
  },
  "summary": "<3-4 sentence professional summary based on their skills and goals>",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "duration": "<duration>",
      "points": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "<degree name>",
      "institution": "<college name>",
      "year": "<year>",
      "cgpa": "<cgpa or percentage>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "tech": ["tech1", "tech2"],
      "description": "<2 line description>",
      "points": ["what you built", "impact or result"]
    }
  ],
  "achievements": ["achievement 1", "achievement 2"]
}

RULES:
- Write professional bullet points using action verbs (Developed, Built, Designed, Implemented)
- Make the summary compelling and role-specific
- Expand short inputs into professional descriptions
- If any field is missing, make a reasonable professional assumption
- Keep it ATS-friendly with industry keywords
"""


def build_prompt(resume_text: str, question: str) -> str:
    return f"""RESUME CONTENT:
{resume_text}

USER QUESTION:
{question}

Answer the question based on the resume content and your career knowledge.
Remember to follow the language rules — if Thanglish question, reply in Thanglish."""


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    global resume_text_storage

    if "resume" not in request.FILES:
        return Response({"error": "No resume file uploaded"}, status=400)

    file = request.FILES["resume"]

    if not file.name.endswith(".pdf"):
        return Response({"error": "Only PDF files are supported"}, status=400)

    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""

        if not text.strip():
            return Response({"error": "Could not extract text from PDF"}, status=400)

        resume_text_storage = text

        return Response({
            "message": "Resume uploaded successfully",
            "pages": len(reader.pages),
            "characters_extracted": len(text)
        })

    except Exception as e:
        return Response({"error": f"Failed to process PDF: {str(e)}"}, status=500)



ATS_PROMPT = """You are a STRICT ATS resume analyzer. You must differentiate resumes accurately.

CRITICAL RULES:
- Most resumes score between 30–75. Only truly exceptional resumes get 80+.
- A resume missing ANY major section gets heavily penalized.
- Be harsh. Real ATS systems reject 75% of resumes.

Return ONLY valid JSON, no markdown, no extra text.

{
  "overall_score": <number 0-100>,
  "categories": {
    "Contact Information": <number>,
    "Work Experience": <number>,
    "Education": <number>,
    "Skills": <number>,
    "Keywords": <number>,
    "Formatting": <number>,
    "Projects": <number>
  },
  "level": "<Excellent | Good | Average | Needs Improvement>",
  "summary": "<2 sentence honest summary in English>"
}

STRICT SCORING RULES:

Contact Information (0-100):
- Has email + phone + LinkedIn + GitHub + location → 90-100
- Missing LinkedIn or GitHub → max 70
- Missing phone or email → max 40
- Only name present → 10-20

Work Experience (0-100):
- 3+ jobs with bullet points, metrics, action verbs → 85-100
- 1-2 internships with descriptions → 50-70
- Jobs listed but no descriptions → 20-40
- No work experience at all → 0-15

Education (0-100):
- Degree + institution + GPA + graduation year → 80-100
- Degree + institution, no GPA → 55-70
- Only degree name, missing details → 30-50
- No education section → 0

Skills (0-100):
- 15+ relevant technical skills, categorized → 85-100
- 8-14 skills listed → 55-75
- 3-7 skills → 25-50
- 1-2 skills or none → 0-20

Keywords (0-100):
- Industry-specific terms, tools, technologies matching job market → 80-100
- Some relevant keywords → 45-65
- Generic words only → 15-35
- No keywords → 0-10

Formatting (0-100):
- Clear sections, consistent fonts, ATS-parseable, no tables/columns → 80-100
- Minor inconsistencies → 55-75
- Tables, columns, images (ATS unfriendly) → 15-40
- Wall of text, no structure → 0-20

Projects (0-100):
- 3+ projects with tech stack + github links + impact → 85-100
- 2 projects with some detail → 55-70
- 1 project, vague description → 25-45
- No projects section → 0-10

LEVEL RULES (based on overall_score):
- overall_score >= 80 → "Excellent"
- overall_score >= 60 → "Good"
- overall_score >= 40 → "Average"
- overall_score < 40 → "Needs Improvement"

Overall score = weighted average:
Work Experience × 0.25 + Skills × 0.20 + Keywords × 0.20 + Projects × 0.15 + Education × 0.10 + Formatting × 0.05 + Contact × 0.05
"""
@api_view(["POST"])
def ats_score(request):
    global resume_text_storage

    if not resume_text_storage:
        return Response({
            "error": "No resume uploaded yet. Please upload a resume first."
        }, status=400)

    try:
        # Count actual content to calibrate
        word_count = len(resume_text_storage.split())
        
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": ATS_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Analyze this resume strictly. Word count: {word_count} words.\n"
                        f"A resume with {word_count} words is likely "
                        f"{'too short (penalize heavily)' if word_count < 200 else 'adequate length' if word_count < 600 else 'good length'}.\n\n"
                        f"Resume content:\n{resume_text_storage}"
                    )
                }
            ],
            temperature=0.3,  # Slight randomness so scores differ
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        # Server-side validation: recalculate overall score
        cats = result.get("categories", {})
        weights = {
            "Work Experience": 0.25,
            "Skills": 0.20,
            "Keywords": 0.20,
            "Projects": 0.15,
            "Education": 0.10,
            "Formatting": 0.05,
            "Contact Information": 0.05,
        }
        calculated_score = sum(
            cats.get(k, 0) * w for k, w in weights.items()
        )
        result["overall_score"] = round(calculated_score)

        # Enforce level based on calculated score
        score = result["overall_score"]
        if score >= 80:
            result["level"] = "Excellent"
        elif score >= 60:
            result["level"] = "Good"
        elif score >= 40:
            result["level"] = "Average"
        else:
            result["level"] = "Needs Improvement"

        return Response(result)

    except json.JSONDecodeError:
        return Response({"error": "Failed to parse ATS response"}, status=500)
    except Exception as e:
        return Response({"error": f"ATS analysis failed: {str(e)}"}, status=500)


RESUME_BUILD_PROMPT = """You are an expert resume writer and career coach.

Create a professional ATS-friendly resume JSON from the user's input.

Return ONLY valid JSON, no markdown, no extra text.

CRITICAL RULES:
- Use ONLY the information the user has provided
- If a field is empty, missing, or says "not provided" → set it to null or empty array []
- Do NOT invent, assume, or hallucinate any information
- Do NOT add fake education, experience, or projects
- Only expand and rephrase what the user actually gave you into professional language

{
  "name": "<full name>",
  "contact": {
    "email": "<email or empty string>",
    "phone": "<phone or empty string>",
    "linkedin": "<linkedin or empty string>",
    "github": "<github or empty string>",
    "location": "<location or empty string>"
  },
  "summary": "<3-4 sentence professional summary using ONLY provided info. If too little info, write a short 1-2 sentence summary>",
  "skills": {
    "technical": ["only skills the user mentioned"],
    "soft": ["only soft skills the user mentioned or clearly implied"]
  },
  "experience": [
    {
      "title": "<job title>",
      "company": "<company>",
      "duration": "<duration>",
      "points": ["professional bullet using what user described"]
    }
  ],
  "education": [
    {
      "degree": "<degree>",
      "institution": "<institution>",
      "year": "<year>",
      "cgpa": "<cgpa or empty string>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "tech": ["tech stack mentioned"],
      "description": "<description from user input>",
      "points": ["what user said they built or achieved"]
    }
  ],
  "achievements": ["only achievements user mentioned"],
  "certifications": ["only certifications user mentioned"]
}

If experience is not provided → "experience": []
If projects is not provided → "projects": []
If achievements is not provided → "achievements": []
If education is not provided → "education": []
"""
@api_view(["POST"])
def build_resume(request):
    data = request.data

    
    def field(key, label):
        val = data.get(key, "").strip()
        return f"{label}:\n{val}\n" if val else f"{label}:\nnot provided\n"

    user_input = f"""
{field('name',          'Name')}
{field('email',         'Email')}
{field('phone',         'Phone')}
{field('linkedin',      'LinkedIn')}
{field('github',        'GitHub')}
{field('location',      'Location')}
{field('target_role',   'Target Job Role')}
{field('description',   'About Me')}
{field('skills',        'Skills')}
{field('experience',    'Work Experience')}
{field('education',     'Education')}
{field('projects',      'Projects')}
{field('achievements',  'Achievements')}
{field('certifications','Certifications')}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": RESUME_BUILD_PROMPT},
                {"role": "user",   "content": user_input}
            ],
            temperature=0.2,  # Low = less hallucination
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return Response(result)

    except json.JSONDecodeError:
        return Response({"error": "Failed to parse resume response"}, status=500)
    except Exception as e:
        return Response({"error": f"Resume build failed: {str(e)}"}, status=500)
@api_view(["POST"])
def chat(request):
    global resume_text_storage

    if not resume_text_storage:
        return Response({
            "error": "No resume uploaded yet. Please upload a resume first."
        }, status=400)

    question = request.data.get("question", "").strip()

    if not question:
        return Response({"error": "Question is required"}, status=400)

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_prompt(resume_text_storage, question)}
            ],
            temperature=0.3
        )

        return Response({
            "answer": response.choices[0].message.content
        })

    except Exception as e:
        return Response({"error": f"AI request failed: {str(e)}"}, status=500)