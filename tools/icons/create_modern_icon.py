#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import math

def create_modern_icon(size):
    # Dark background
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    
    # Brand colors
    blue = (0, 153, 255, 255)
    green = (0, 215, 126, 255)
    orange = (255, 107, 53, 255)
    gold = (255, 184, 0, 255)
    
    center = size // 2
    
    # Draw concentric circles with brand colors
    for i in range(4):
        colors = [blue, green, orange, gold]
        color = colors[i]
        r = int(size * (0.35 - i * 0.08))
        draw.ellipse(
            [center - r, center - r, center + r, center + r],
            outline=color,
            width=int(size * 0.06)
        )
    
    # Draw flowing chevrons in center
    chevron_w = int(size * 0.12)
    chevron_h = int(size * 0.18)
    
    # Chevron 1 (blue)
    points1 = [
        (center - chevron_w, center - chevron_h),
        (center, center),
        (center - chevron_w, center + chevron_h)
    ]
    draw.polygon(points1, fill=blue)
    
    # Chevron 2 (green)
    points2 = [
        (center, center - chevron_h),
        (center + chevron_w, center),
        (center, center + chevron_h)
    ]
    draw.polygon(points2, fill=green)
    
    # Small accent circles
    accent_r = int(size * 0.05)
    draw.ellipse(
        [center + chevron_w + int(size*0.05) - accent_r, center - accent_r, 
         center + chevron_w + int(size*0.05) + accent_r, center + accent_r],
        fill=orange
    )
    draw.ellipse(
        [center - chevron_w - int(size*0.05) - accent_r, center - accent_r, 
         center - chevron_w - int(size*0.05) + accent_r, center + accent_r],
        fill=gold
    )
    
    return img

# Create both sizes
for size in [192, 512]:
    img = create_modern_icon(size)
    img.save(f'icon-{size}.png')
    print(f'Created: icon-{size}.png')
