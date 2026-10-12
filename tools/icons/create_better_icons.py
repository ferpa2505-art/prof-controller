#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import math

def create_gradient_icon(size):
    # Dark background with subtle gradient
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    
    # Brand colors
    blue = (0, 153, 255, 255)
    green = (0, 215, 126, 255)
    orange = (255, 107, 53, 255)
    gold = (255, 184, 0, 255)
    
    center = size // 2
    padding = int(size * 0.15)
    
    # Draw P shape (Blue to Green gradient effect)
    # Left vertical bar
    p_bar_x = padding
    p_bar_y = padding
    p_bar_w = int(size * 0.18)
    p_bar_h = size - (padding * 2)
    
    draw.rectangle([p_bar_x, p_bar_y, p_bar_x + p_bar_w, p_bar_y + p_bar_h], fill=blue)
    
    # P bulge (circle)
    bulge_size = int(size * 0.28)
    draw.ellipse([p_bar_x, p_bar_y, p_bar_x + bulge_size, p_bar_y + bulge_size], fill=green)
    
    # Draw F shape (Orange to Gold gradient effect)
    # Right vertical bar
    f_bar_x = size - padding - p_bar_w
    draw.rectangle([f_bar_x, p_bar_y, f_bar_x + p_bar_w, p_bar_y + p_bar_h], fill=orange)
    
    # F top horizontal
    f_top_h = int(size * 0.15)
    draw.rectangle([f_bar_x - int(p_bar_w * 0.8), p_bar_y, f_bar_x + p_bar_w, p_bar_y + f_top_h], fill=gold)
    
    # F middle horizontal
    f_mid_y = p_bar_y + int(p_bar_h * 0.4)
    f_mid_h = int(size * 0.12)
    draw.rectangle([f_bar_x - int(p_bar_w * 0.6), f_mid_y, f_bar_x + p_bar_w, f_mid_y + f_mid_h], fill=orange)
    
    # Central rising arrow/indicator (Green chevron pointing up)
    arrow_center_x = center
    arrow_top_y = padding + int(size * 0.1)
    arrow_bottom_y = size - padding - int(size * 0.1)
    
    # Arrow line
    line_w = int(size * 0.05)
    draw.rectangle([arrow_center_x - line_w//2, arrow_top_y, arrow_center_x + line_w//2, arrow_bottom_y], fill=green)
    
    # Arrow head
    arrow_point_size = int(size * 0.12)
    draw.polygon([
        (arrow_center_x - arrow_point_size, arrow_top_y + int(size*0.08)),
        (arrow_center_x + arrow_point_size, arrow_top_y + int(size*0.08)),
        (arrow_center_x, arrow_top_y - int(size*0.03))
    ], fill=green)
    
    return img

# Create both sizes
for size in [192, 512]:
    img = create_gradient_icon(size)
    img.save(f'icon-{size}.png')
    print(f'Created: icon-{size}.png')
