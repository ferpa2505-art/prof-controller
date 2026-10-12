#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw

def create_icon(size):
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    
    # Brand colors
    blue = (0, 153, 255, 255)
    green = (0, 215, 126, 255)
    orange = (255, 107, 53, 255)
    gold = (255, 184, 0, 255)
    
    margin = int(size * 0.15)
    
    # P shape (Blue-Green)
    p_width = int(size * 0.25)
    p_height = int(size * 0.7)
    draw.rectangle([margin, margin, margin + p_width, margin + p_height], fill=blue)
    bulge_size = int(size * 0.35)
    draw.ellipse([margin, margin, margin + bulge_size, margin + bulge_size], fill=green)
    
    # F shape (Orange-Gold)
    f_start = int(margin + size * 0.45)
    f_width = int(size * 0.25)
    draw.rectangle([f_start, margin, f_start + f_width, margin + p_height], fill=orange)
    draw.rectangle([f_start, margin, f_start + int(size * 0.4), margin + int(size * 0.15)], fill=gold)
    draw.rectangle([f_start, int(margin + size * 0.3), f_start + int(size * 0.35), int(margin + size * 0.4)], fill=orange)
    
    return img

img192 = create_icon(192)
img512 = create_icon(512)

img192.save('icon-192.png')
img512.save('icon-512.png')

print('New icons created')
