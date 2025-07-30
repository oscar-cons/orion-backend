"""
Script to sync NocoDB ransomware entries to FastAPI backend.

Usage:
    python sync_nocodb_to_fastapi.py
"""

import requests
from datetime import datetime
import json

# CONFIG
NOCODB_API_TOKEN = 'voEPGkM9PwX-84lZ6xoh7iD03wfwNlm1n1VvwtNK'
NOCODB_BASE_URL = 'https://automatizaciones-nocodb.tlcrhy.easypanel.host/'
NOCODB_PROJECT = 'Ransomware Inventory'
NOCODB_TABLE = 'Ransomware Auto'

FASTAPI_URL = 'http://127.0.0.1:8000/ransomware/nocodb/'  # New endpoint for NocoDB data

def obtener_datos_nocodb():
    headers = {
        'accept': 'application/json',
        'xc-token': NOCODB_API_TOKEN
    }
    url = f'{NOCODB_BASE_URL}/api/v1/db/data/noco/{NOCODB_PROJECT}/{NOCODB_TABLE}?limit=10'
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json().get('list', [])

def enviar_a_fastapi(data):
    headers = {"Content-Type": "application/json"}
    
    # Filter out unwanted NocoDB fields for logging
    unwanted_fields = ['Id', 'CreatedAt', 'UpdatedAt']
    filtered_data = {k: v for k, v in data.items() if k not in unwanted_fields}
    
    try:
        response = requests.post(FASTAPI_URL, json=data, headers=headers)
        response.raise_for_status()
        result = response.json()
        
        if result.get("entry_created"):
            if result.get("group_created"):
                print(f"✅ New group '{data.get('Group')}' created and entry added.")
            else:
                print(f"✅ Entry added to existing group '{data.get('Group')}'.")
        else:
            print(f"⏭️  Entry already exists for group '{data.get('Group')}' - skipped.")
        
        return result
    except requests.RequestException as e:
        print(f"❌ Error al enviar datos: {e}")
        print(f"📤 Data sent: {json.dumps(filtered_data, indent=2, default=str)}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"📋 Error details: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"📋 Error response: {e.response.text}")
        return None

def sync():
    datos = obtener_datos_nocodb()
    print(f"📊 Found {len(datos)} entries in NocoDB")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for i, fila in enumerate(datos, 1):
        print(f"\n🔄 Processing entry {i}/{len(datos)}")
        
        if not fila.get("BreachName") or not fila.get("DetectionDate") or not fila.get("Group"):
            print(f"⚠️  Fila omitida por datos incompletos: {fila}")
            error_count += 1
            continue

        result = enviar_a_fastapi(fila)
        if result:
            if result.get("entry_created"):
                success_count += 1
            else:
                skipped_count += 1
        else:
            error_count += 1
    
    print(f"\n📈 Sync completed:")
    print(f"   ✅ Success: {success_count}")
    print(f"   ⏭️  Skipped (duplicates): {skipped_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📊 Total processed: {len(datos)}")

if __name__ == "__main__":
    sync()
