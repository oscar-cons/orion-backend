"""
Script to synchronize a NocoDB table with a local PostgreSQL database.

Usage:
    python sync_nocodb_to_pg.py

Requirements:
    - requests
    - psycopg2

Install dependencies:
    pip install requests psycopg2

You must set your NocoDB API token, project name, table name, and PostgreSQL credentials.
"""

import requests
import psycopg2
import uuid
from datetime import datetime

# CONFIGURACIÓN
NOCODB_API_TOKEN = 'voEPGkM9PwX-84lZ6xoh7iD03wfwNlm1n1VvwtNK'
NOCODB_BASE_URL = 'https://automatizaciones-nocodb.tlcrhy.easypanel.host/'  # o el dominio donde esté tu instancia
NOCODB_PROJECT = 'Ransomware Inventory'
NOCODB_TABLE = 'Ransomware Auto'

POSTGRESQL_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'dbname': 'inteligencia',
    'user': 'OscarGranados',
    'password': 'Ogr_1181$!'
}

def obtener_datos_nocodb():
    headers = {
        'accept': 'application/json',
        'xc-token': NOCODB_API_TOKEN
    }
    url = f'{NOCODB_BASE_URL}/api/v1/db/data/noco/{NOCODB_PROJECT}/{NOCODB_TABLE}?limit=1000'
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json().get('list', [])

def insertar_datos_en_postgresql(datos):
    conn = psycopg2.connect(**POSTGRESQL_CONFIG)
    cur = conn.cursor()

    for fila in datos:
        try:
            country = fila.get('Country') or "WWW"
            if not all([fila.get('BreachName'), fila.get('DetectionDate'), country, fila.get('Group')]):
                print(f"Fila omitida por falta de datos obligatorios: {fila}")
                continue

            id_local = str(uuid.uuid4())
            print(f"Intentando insertar en sources: {id_local}, {fila.get('BreachName')}")

            cur.execute("""
                INSERT INTO sources (
                    id, name, description, type, nature, status, author, country, language, associated_domains, owner, monitored, discovery_source
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                id_local,
                fila.get('BreachName'),  # name
                None,                   # description
                'ransomware',           # type
                None,                   # nature
                True,                   # status
                'noco',                 # author
                country,
                'en',                   # language
                None,                   # associated_domains
                None,                   # owner
                'NO',                   # monitored
                None                    # discovery_source
            ))
            print("Insert realizado en sources")

            # Luego en ransomware
            cur.execute("""
                INSERT INTO ransomware (
                    id, "BreachName", "Domain", "Rank", "Category", "DetectionDate", "Country", "OriginalSource", "Group", "Download"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                id_local,
                fila.get('BreachName'),
                fila.get('Domain'),
                fila.get('Rank'),
                fila.get('Category'),
                fila.get('DetectionDate'),
                country,
                fila.get('OriginalSource'),
                fila.get('Group'),
                fila.get('Download')
            ))
        except Exception as e:
            print(f"Error al insertar fila: {fila}")
            print(e)

    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    datos = obtener_datos_nocodb()
    if datos:
        insertar_datos_en_postgresql(datos)
        print("Sincronización completada.")
    else:
        print("No se encontraron datos en NocoDB.")
