
from PIL import Image
import os
import shutil

SRC = "/home/abduloh/.gemini/antigravity/brain/419a7c81-80ef-40e9-9278-6ae253246f31/modernmeat_icon_1777111781195.png"
BASE = "/media/abduloh/Новый том/Abdulloh/gosht/android/app/src/main/res"

# Android mipmap sizes
sizes = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

# Play Store icon (512x512) - save to project root
play_store_size = 512

img = Image.open(SRC).convert("RGBA")

# Generate each mipmap size
for folder, size in sizes.items():
    dir_path = os.path.join(BASE, folder)
    os.makedirs(dir_path, exist_ok=True)
    
    resized = img.resize((size, size), Image.LANCZOS)
    
    # Save ic_launcher.png
    resized.save(os.path.join(dir_path, "ic_launcher.png"))
    # Save ic_launcher_round.png (same image, Android will round it)
    resized.save(os.path.join(dir_path, "ic_launcher_round.png"))
    
    print(f"✓ {folder}/ic_launcher.png ({size}x{size})")

# Play Store icon 512x512
play_img = img.resize((play_store_size, play_store_size), Image.LANCZOS)
play_path = "/media/abduloh/Новый том/Abdulloh/gosht/modernmeat_playstore_icon.png"
play_img.save(play_path)
print(f"\n✓ Play Store icon saved: modernmeat_playstore_icon.png (512x512)")

print("\n🎉 Barcha iconlar tayyor!")
