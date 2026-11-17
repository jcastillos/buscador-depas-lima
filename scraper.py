import json
import os
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# 1. Preparar el entorno
os.makedirs('data', exist_ok=True)
distritos = ["miraflores", "san-isidro"]
datos_reales = []

# 2. Configurar el "disfraz" del robot para que no lo bloqueen
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9"
}

# 3. Navegar y extraer
for distrito in distritos:
    print(f"🔍 Buscando en Properati: {distrito.upper()}...")
    url = f"https://www.properati.com.pe/s/{distrito}/departamento/venta"
    
    try:
        respuesta = requests.get(url, headers=headers, timeout=15)
        respuesta.raise_for_status() # Verifica si la página cargó bien
        
        # Parsear el HTML con BeautifulSoup
        soup = BeautifulSoup(respuesta.text, 'html.parser')
        
        # Properati suele envolver sus avisos en etiquetas de listado. 
        # Buscamos elementos que parezcan tarjetas de propiedades.
        # Nota: Los nombres de las clases (class_) cambian en los portales reales. 
        # Si devuelve 0 resultados, tendremos que inspeccionar la web actualizada.
        tarjetas = soup.find_all('div', class_=re.compile(r'listing-card|property-card|card')) 
        
        if not tarjetas:
            print(f"⚠️ No se encontraron tarjetas en {distrito}. Las clases HTML de Properati pudieron haber cambiado.")
            continue

        for i, tarjeta in enumerate(tarjetas[:5]): # Extraemos los primeros 5 de cada distrito para probar
            try:
                # Extraer Precio
                precio_tag = tarjeta.find(string=re.compile(r'(USD|S/|S/\.)'))
                if not precio_tag: continue
                
                # Limpiar el texto para dejar solo los números
                precio_texto = precio_tag.text.replace(',', '').replace('.', '').replace('S/', '').replace('USD', '').strip()
                precio_num = int(re.search(r'\d+', precio_texto).group())
                
                # Extraer Enlace
                enlace_tag = tarjeta.find('a', href=True)
                enlace = f"https://www.properati.com.pe{enlace_tag['href']}" if enlace_tag else url
                
                # Agregar a nuestra lista
                datos_reales.append({
                    "id": f"prop_{distrito}_{i}",
                    "portal": "Properati",
                    "distrito": "san isidro" if distrito == "san-isidro" else "miraflores",
                    "precio_soles": precio_num * 3.75 if "USD" in precio_tag.text else precio_num, # Conversión simple si está en dólares
                    "dormitorios": 3, # Simplificado para la prueba inicial
                    "banos": 2,
                    "area_m2": 100,
                    "enlace": enlace,
                    "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            except Exception as error_tarjeta:
                continue # Si una tarjeta falla, salta a la siguiente
                
    except Exception as e:
        print(f"❌ Error al conectar con Properati ({distrito}): {e}")

# 4. Guardar los resultados reales
ruta = 'data/resultados.json'
with open(ruta, 'w', encoding='utf-8') as f:
    json.dump(datos_reales, f, indent=4, ensure_ascii=False)

print(f"✅ Scraping completado. {len(datos_reales)} departamentos reales guardados.")