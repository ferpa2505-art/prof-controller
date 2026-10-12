#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw

def create_fintech_icon(size):
    # Dark background
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    
    # Brand colors
    blue = (0, 153, 255, 255)
    green = (0, 215, 126, 255)
    orange = (255, 107, 53, 255)
    gold = (255, 184, 0, 255)
    
    margin = int(size * 0.15)
    center_x = size // 2
    center_y = size // 2
    radius = int(size * 0.35)
    
    # Draw shield shape with gradient effect
    shield_x = center_x - radius
    shield_y = center_y - radius
    shield_w = radius * 2
    shield_h = int(radius * 2.1)
    
    # Shield background (rounded rectangle)
    draw.rounded_rectangle(
        [shield_x, shield_y, shield_x + shield_w, shield_y + shield_h - int(radius*0.3)],
        radius=int(radius*0.3),
        fill=blue,
        outline=green,
        width=2
    )
    
    # Bottom point of shield (triangle)
    points = [
        (shield_x, shield_y + shield_h - int(radius*0.3)),
        (shield_x + shield_w, shield_y + shield_h - int(radius*0.3)),
        (center_x, shield_y + shield_h)
    ]
    draw.polygon(points, fill=blue, outline=green)
    
    # Draw rising chart indicator inside shield
    inner_radius = int(radius * 0.5)
    chart_x = center_x - int(inner_radius * 0.5)
    chart_y = center_y - int(inner_radius * 0.5)
    
    # Line 1 (gold)
    draw.line(
        [chart_x, chart_y + inner_radius, chart_x + inner_radius, chart_y],
        fill=gold,
        width=int(size*0.08)
    )
    
    # Line 2 (orange)
    draw.line(
        [chart_x + inner_radius, chart_y, chart_x + inner_radius*2, chart_y + inner_radius*0.5],
        fill=orange,
        width=int(size*0.08)
    )
    
    return img

# Create both sizes
for size in [192, 512]:
    img = create_fintech_icon(size)
    img.save(f'icon-{size}.png')
    print(f'Created: icon-{size}.png')
