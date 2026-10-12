from PIL import Image
import os
import shutil

# Path da melhor imagem (sexta)
source_img = "C:/Users/ferpa/.copilot/workspaces/f45a47bf-4d00-448d-84e7-a34bdf046f3c/attachments/b31dd49f-a251-4df4-ac70-658fc6b6c9c4-davinci_modern_icon_for__prof_controller__wealth_managemen.png"

# Verificar se existe
if not os.path.exists(source_img):
    print("[ERRO] Arquivo não encontrado")
    print(f"Procurando em: {source_img}")
    exit(1)

print("[OK] Abrindo imagem original...")
img = Image.open(source_img)
print(f"[OK] Tamanho original: {img.size}")

# Converter para RGBA (com transparência)
img_rgba = img.convert('RGBA')
print("[OK] Convertido para RGBA")

# Criar 192x192
print("[PROCESSANDO] Redimensionando para 192x192...")
img_192 = img_rgba.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save('icon-192.png', 'PNG')
print("[OK] icon-192.png criado (192x192)")

# Criar 512x512
print("[PROCESSANDO] Redimensionando para 512x512...")
img_512 = img_rgba.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save('icon-512.png', 'PNG')
print("[OK] icon-512.png criado (512x512)")

print("\n[SUCESSO] Ícones prontos!")
print("- icon-192.png (192x192)")
print("- icon-512.png (512x512)")
