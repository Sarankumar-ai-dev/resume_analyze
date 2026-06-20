from pypdf import PdfReader
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from openai import OpenAI
import json
import os
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

ATS_PROMPT = """You are an expert ATS (Applicant Tracking System) resume analyzer.

Analyze the resume and return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

Score each category from 0 to 100:

{
  "overall_score": <number>,
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
  "summary": "<2 sentence summary in English>"
}

SCORING GUIDE:
- Contact Information: email, phone, linkedin, github present → high score
- Work Experience: internships, jobs, roles with descriptions → high score
- Education: degree, institution, CGPA mentioned → high score
- Skills: technical + soft skills listed → high score
- Keywords: industry-relevant keywords present → high score
- Formatting: clear sections, readable structure → high score
- Projects: real projects with tech stack mentioned → high score
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


@api_view(["POST"])
def ats_score(request):
    global resume_text_storage

    if not resume_text_storage:
        return Response({
            "error": "No resume uploaded yet. Please upload a resume first."
        }, status=400)

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": ATS_PROMPT},
                {"role": "user", "content": f"Analyze this resume:\n\n{resume_text_storage}"}
            ],
            temperature=0.1
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return Response(result)

    except json.JSONDecodeError:
        return Response({"error": "Failed to parse ATS response"}, status=500)
    except Exception as e:
        return Response({"error": f"ATS analysis failed: {str(e)}"}, status=500)


@api_view(["POST"])
def build_resume(request):
    data = request.data

    user_input = f"""
Name: {data.get('name', '')}
Email: {data.get('email', '')}
Phone: {data.get('phone', '')}
LinkedIn: {data.get('linkedin', '')}
GitHub: {data.get('github', '')}
Location: {data.get('location', '')}
Job Role Target: {data.get('target_role', '')}

About Me / Description:
{data.get('description', '')}

Skills:
{data.get('skills', '')}

Work Experience:
{data.get('experience', '')}

Education:
{data.get('education', '')}

Projects:
{data.get('projects', '')}

Achievements:
{data.get('achievements', '')}

Certifications:
{data.get('certifications', '')}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": RESUME_BUILD_PROMPT},
                {"role": "user", "content": user_input}
            ],
            temperature=0.4
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