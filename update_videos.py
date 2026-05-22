import os

file_path = '/home/ubuntu/feiss-knowledge/public/index.html'

# IDs de YouTube seleccionados basados en relevancia:
# 1. Resumen de Auditoría: Steal my Shopify SEO Audit (D8CzAmb8x4Y)
# 2. 5 Recomendaciones Clave: Shopify Store Slow? These 5 Changes will Fix It (1GalWZwfkyk)
video1_id = "D8CzAmb8x4Y"
video2_id = "1GalWZwfkyk"

with open(file_path, 'r') as f:
    content = f.read()

# Reemplazar el primer iframe
old_iframe1 = 'src="https://app.heygen.com/embed/ffb2300d99a4426ea51c47dc2217347d"'
new_iframe1 = f'src="https://www.youtube.com/embed/{video1_id}"'
content = content.replace(old_iframe1, new_iframe1)

# Reemplazar el segundo iframe
old_iframe2 = 'src="https://app.heygen.com/embed/c1f97a31dbff4645907bf3f7e491285b"'
new_iframe2 = f'src="https://www.youtube.com/embed/{video2_id}"'
content = content.replace(old_iframe2, new_iframe2)

with open(file_path, 'w') as f:
    f.write(content)

print("Videos actualizados correctamente en public/index.html")
