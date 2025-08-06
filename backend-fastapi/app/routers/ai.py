import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
import json
from dotenv import load_dotenv
from ..database import get_db
from .. import models, schemas

load_dotenv()

# --- Configuración de la API de Gemini ---
# Load API key from environment variable
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

router = APIRouter()

@router.post("/ai/summarize-post/{post_id}", response_model=schemas.AISummaryOut)
async def summarize_post(post_id: UUID, db: AsyncSession = Depends(get_db), force: bool = Query(False)):
    # Check if API key is configured
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    # 1. Buscar el post en la base de datos
    result = await db.execute(select(models.ForumPost).where(models.ForumPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")

    # 2. Si ya tiene resumen y no se fuerza, devolverlo para ahorrar costes
    if post.ai_summary and post.ai_tags and not force:
        return {"summary": post.ai_summary, "tags": post.ai_tags}

    # 3. Construir el prompt para Gemini
    prompt = f"""
    You are a cybersecurity expert analyst. Analyze the following post from a dark web forum and provide a concise summary and a list of relevant tags.

    **Post Title:** {post.title}
    **Author:** {post.author_username}
    **Category:** {post.category}
    **Content:**
    {post.content}

    ---

    **Output instructions:**
    Respond with a JSON object, and only the JSON object, with the following structure:
    {{
      "summary": "A concise and clear summary of the post content, highlighting the key cybersecurity points (e.g., type of malware, vulnerability, leaked data, etc.).",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }}
    All output must be in English.
    """

    # --- Bloque de llamada a la API de Gemini ---
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(prompt)

        # Limpiar la respuesta para asegurarse de que es un JSON válido
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        ai_data = json.loads(cleaned_response_text)

        summary = ai_data.get("summary")
        tags = ai_data.get("tags")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al contactar la API de IA: {str(e)}")

    if not summary or not tags:
        raise HTTPException(status_code=500, detail="La respuesta de la IA no tuvo el formato esperado.")

    # 4. Guardar en la base de datos
    post.ai_summary = summary
    post.ai_tags = tags
    await db.commit()
    await db.refresh(post)

    # 5. Devolver el resultado
    return {"summary": summary, "tags": tags}

@router.post("/ai/summarize-entry/{entry_id}", response_model=schemas.AISummaryOut)
async def summarize_entry(entry_id: UUID, db: AsyncSession = Depends(get_db), force: bool = Query(False)):
    # Check if API key is configured
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    # 1. Buscar la entrada en la base de datos
    result = await db.execute(select(models.RansomwareEntry).where(models.RansomwareEntry.id == entry_id))
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    # 2. Si ya tiene resumen y no se fuerza, devolverlo para ahorrar costes
    if entry.ai_summary and entry.ai_tags and not force:
        return {"summary": entry.ai_summary, "tags": entry.ai_tags}

    # 3. Construir el prompt para Gemini
    prompt = f"""
    You are a cybersecurity expert analyst specializing in ransomware analysis. Analyze the following ransomware entry and provide a concise summary and a list of relevant tags.

    **Breach Name:** {entry.BreachName}
    **Domain:** {entry.Domain or 'Not specified'}
    **Rank:** {entry.Rank or 'Not specified'}
    **Category:** {entry.Category or 'Not specified'}
    **Country:** {entry.Country or 'Not specified'}
    **Detection Date:** {entry.DetectionDate}
    **Original Source:** {entry.OriginalSource or 'Not specified'}
    **Download Link:** {entry.Download or 'Not specified'}

    ---

    **Output instructions:**
    Respond with a JSON object, and only the JSON object, with the following structure:
    {{
      "summary": "A concise and clear summary of the ransomware entry, highlighting key cybersecurity points (e.g., type of ransomware, target industry, data breach details, ransom demands, etc.).",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }}
    All output must be in English.
    Focus on cybersecurity threats, attack vectors, and potential impact.
    """

    # --- Bloque de llamada a la API de Gemini ---
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(prompt)

        # Limpiar la respuesta para asegurarse de que es un JSON válido
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "")
        ai_data = json.loads(cleaned_response_text)

        summary = ai_data.get("summary")
        tags = ai_data.get("tags")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al contactar la API de IA: {str(e)}")

    if not summary or not tags:
        raise HTTPException(status_code=500, detail="La respuesta de la IA no tuvo el formato esperado.")

    # 4. Guardar en la base de datos
    entry.ai_summary = summary
    entry.ai_tags = tags
    await db.commit()
    await db.refresh(entry)

    # 5. Devolver el resultado
    return {"summary": summary, "tags": tags} 