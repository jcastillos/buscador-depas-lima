import json
import os
from datetime import datetime

os.makedirs('data', exist_ok=True)

# Datos de prueba para verificar deduplicación y filtros
datos = [
    {
        "id": "1", "portal": "Urbania", "distrito": "miraflores",
        "precio_soles": 500000, "dormitorios": 3, "banos": 2, "area_m2": 100,
        "enlace": "https://urbania.pe/", "fecha": datetime.now().strftime("%Y-%m-%d")
    },
    {
        "id": "2", "portal": "Properati", "distrito": "miraflores",
        "precio_soles": 485000, "dormitorios": 3, "banos": 2, "area_m2": 100,
        "enlace": "https://properati.com.pe/", "fecha": datetime.now().strftime("%Y-%m-%d")
    },
    {
        "id": "3", "portal": "Adonde Vivir", "distrito": "san isidro",
        "precio_soles": 850000, "dormitorios": 2, "banos": 2, "area_m2": 80,
        "enlace": "https://adondeyvivir.com/", "fecha": datetime.now().strftime("%Y-%m-%d")
    }
]

with open('data/resultados.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=4, ensure_ascii=False)

print("✅ JSON generado")