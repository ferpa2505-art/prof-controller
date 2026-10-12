#!/usr/bin/env python3
"""
Process Profit C theme logos with transparent and futuristic backgrounds
Extracts different logo variants for use across themes
"""

from PIL import Image, ImageFilter, ImageEnhance
import os
from pathlib import Path

def ensure_dir(path):
    """Create directory if it doesn't exist"""
    Path(path).mkdir(parents=True, exist_ok=True)

def optimize_logo(image_path, output_path, max_width=512, quality=95):
    """
    Optimize logo image for web
    - Resize if needed
    - Optimize compression
    """
    try:
        img = Image.open(image_path)
        
        # Convert RGBA if needed
        if img.mode != 'RGBA' and 'transparency' in img.info:
            img = img.convert('RGBA')
        
        # Resize if larger than max_width
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save with optimization
        img.save(output_path, quality=quality, optimize=True)
        print(f"[OK] Optimized: {output_path}")
        return True
    except Exception as e:
        print(f"[ERROR] Error processing {image_path}: {e}")
        return False

def create_logo_variants():
    """
    Create different logo variants for various uses
    """
    base_dir = Path(".")
    logo_files = {
        'logo-transparent.png': 'Logo with transparent background',
        'icon-transparent.png': 'Icon with transparent background', 
        'logo-profit-c.png': 'Logo with futuristic circuit background (default theme)',
    }
    
    ensure_dir("themes/logos")
    ensure_dir("assets")
    
    for filename, description in logo_files.items():
        filepath = base_dir / filename
        if filepath.exists():
            print(f"\n[PROCESS] {filename} - {description}")
            
            # Optimize for web
            optimize_logo(str(filepath), str(base_dir / filename))
            
            # Create variants for different sizes
            sizes = [
                ('32', 32),
                ('64', 64),
                ('128', 128),
                ('192', 192),
            ]
            
            for size_name, size_px in sizes:
                variant_path = base_dir / f"themes/logos/{filename.replace('.png', f'-{size_name}.png')}"
                try:
                    img = Image.open(filepath)
                    if img.mode != 'RGBA' and 'transparency' in img.info:
                        img = img.convert('RGBA')
                    
                    # Resize
                    img = img.resize((size_px, size_px), Image.Resampling.LANCZOS)
                    img.save(variant_path, quality=95, optimize=True)
                    print(f"  [OK] Created variant: {size_name}px")
                except Exception as e:
                    print(f"  [FAILED] Failed to create {size_name}px variant: {e}")
        else:
            print(f"[WARN] File not found: {filename}")

def print_usage():
    """Print information about logo files"""
    print("\n" + "="*60)
    print("PROFIT C THEME LOGOS")
    print("="*60)
    print("\nAvailable logo variants:")
    print("  1. logo-transparent.png - Use in light/custom themes")
    print("  2. icon-transparent.png - Icon-only transparent variant")
    print("  3. logo-profit-c.png    - Default with circuit background")
    print("\nVariants created in themes/logos/:")
    print("  - 32px, 64px, 128px, 192px versions")
    print("\nUsage in HTML:")
    print('  <img src="logo-profit-c.png" class="brand-logo-img" />')
    print("\nUsage in CSS (theme-specific):")
    print('  [data-theme="profit-c"] .brand-logo-img {')
    print('    background: url("logo-profit-c.png");')
    print("  }")
    print("\n" + "="*60)

if __name__ == "__main__":
    print("[*] Starting Profit C logo processing...")
    create_logo_variants()
    print_usage()
