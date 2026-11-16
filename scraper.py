import json
import os
from datetime import datetime

# 1. Crear carpeta 'data'
os.makedirs('data', exist_ok=True)

# 2. Datos simulados (El Depa 1 y el Depa 2 son el MISMO, pero a distinto precio)
datos = [
    {
        "id": "depa_urbania_01",
        "portal": "Urbania",
        "distrito": "miraflores",
        "precio_soles": 500000,
        "dormitorios": 3,
        "banos": 2,
        "area_m2": 100,
        "enlace": "https://urbania.pe/aviso-ejemplo-1",
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    },
    {
        "id": "depa_properati_01",
        "portal": "Properati",
        "distrito": "miraflores",
        "precio_soles": 485000, # ¡Más barato!
        "dormitorios": 3,       
        "banos": 2,             
        "area_m2": 100,         
        "enlace": "https://properati.com.pe/aviso-ejemplo-2",
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    },
    {
        "id": "depa_adonde_01",
        "portal": "Adonde Vivir",
        "distrito": "san isidro",
        "precio_soles": 850000,
        "dormitorios": 2,
        "banos": 2,
        "area_m2": 80,
        "enlace": "https://adondeyvivir.com/aviso-ejemplo-3",
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
]

# 3. Guardar el archivo JSON
ruta = 'data/resultados.json'
with open(ruta, 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=4, ensure_ascii=False)

print("✅ Archivo JSON generado con éxito.")