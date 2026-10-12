#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import math

def create_professional_icon(size):
    # Dark background
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    
    # Brand colors
    blue = (0, 153, 255, 255)
    green = (0, 215, 126, 255)
    orange = (255, 107, 53, 255)
    gold = (255, 184, 0, 255)
    
    center = size // 2
    scale = size / 120  # Scale factor from 120 unit viewBox
    
    # Draw P with 3D effect (Blue gradient)
    p_x = int(center * 0.6)
    p_width = int(size * 0.25)
    p_height = int(size * 0.55)
    
    # P shadow/3D depth
    draw.polygon([
        (p_x + int(scale*8), center - int(p_height/2) + int(scale*8)),
        (p_x + p_width + int(scale*8), center - int(p_height/2) + int(scale*8)),
        (p_x + p_width + int(scale*8), center + int(p_height/2) + int(scale*8)),
        (p_x + int(scale*8), center + int(p_height/2) + int(scale*8))
    ], fill=(0, 0, 0, 100))
    
    # P main shape
    draw.rectangle([p_x, center - int(p_height/2), p_x + p_width, center + int(p_height/2)], fill=blue)
    
    # P bulge (circle)
    bulge_r = int(size * 0.15)
    draw.ellipse([p_x, center - int(p_height/2), p_x + bulge_r*2, center - int(p_height/2) + bulge_r*2], fill=green)
    
    # Draw F with 3D effect (Orange-Gold)
    f_x = int(center * 1.35)
    f_width = int(size * 0.25)
    
    # F shadow/3D depth
    draw.polygon([
        (f_x + int(scale*8), center - int(p_height/2) + int(scale*8)),
        (f_x + f_width + int(scale*8), center - int(p_height/2) + int(scale*8)),
        (f_x + f_width + int(scale*8), center + int(p_height/2) + int(scale*8)),
        (f_x + int(scale*8), center + int(p_height/2) + int(scale*8))
    ], fill=(0, 0, 0, 100))
    
    # F main shape
    draw.rectangle([f_x, center - int(p_height/2), f_x + f_width, center + int(p_height/2)], fill=orange)
    
    # F top bar
    draw.rectangle([f_x, center - int(p_height/2), f_x + int(f_width*1.5), center - int(p_height/2) + int(size*0.12)], fill=gold)
    
    # F middle bar
    draw.rectangle([f_x, center - int(size*0.05), f_x + int(f_width*1.3), center + int(size*0.05)], fill=orange)
    
    # Draw rising arrow/indicator (Green)
    arrow_x = int(center * 0.95)
    arrow_y_start = center + int(p_height * 0.3)
    arrow_y_end = center - int(p_height * 0.3)
    
    # Arrow line
    draw.line([arrow_x, arrow_y_start, arrow_x, arrow_y_end], fill=green, width=int(size*0.08))
    
    # Arrow head
    arrow_point_w = int(size * 0.1)
    draw.polygon([
        (arrow_x - arrow_point_w, arrow_y_end + int(size*0.08)),
        (arrow_x + arrow_point_w, arrow_y_end + int(size*0.08)),
        (arrow_x, arrow_y_end - int(size*0.05))
    ], fill=green)
    
    return img

# Create both sizes
for size in [192, 512]:
    img = create_professional_icon(size)
    img.save(f'icon-{size}.png')
    print(f'Created: icon-{size}.png ({size}x{size})')
