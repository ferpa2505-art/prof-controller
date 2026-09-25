from PIL import Image, ImageDraw

def create_icon(size=192):
    """Create modern ProF Controller icon with gradient"""
    # Create image with dark blue background
    img = Image.new('RGBA', (size, size), (10, 14, 39, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background manually
    for i in range(size):
        ratio = i / size
        r = int(10 + (20 * ratio))
        g = int(14 + (40 * ratio))
        b = int(39 + (80 * ratio))
        draw.line([(0, i), (size, i)], fill=(r, g, b, 255))
    
    # Draw outer circle (glow)
    margin = int(size * 0.1)
    draw.ellipse(
        [(margin, margin), (size-margin, size-margin)],
        outline=(0, 153, 255, 100),
        width=3
    )
    
    # Draw P (left) with blue-green colors
    p_left = int(size * 0.2)
    p_top = int(size * 0.25)
    p_height = int(size * 0.5)
    p_width = int(size * 0.18)
    
    # P vertical bar (blue)
    draw.rectangle(
        [(p_left, p_top), (p_left + int(p_width*0.4), p_top + p_height)],
        fill=(0, 153, 255, 255)
    )
    
    # P rounded top (green)
    p_curve_radius = int(p_width * 0.6)
    draw.ellipse(
        [(p_left + int(p_width*0.25), p_top), 
         (p_left + p_width + int(p_width*0.15), p_top + int(p_height*0.45))],
        fill=(0, 215, 126, 255)
    )
    
    # Draw F (right) with orange-yellow colors
    f_left = int(size * 0.55)
    f_top = int(size * 0.25)
    f_height = int(size * 0.5)
    f_width = int(size * 0.15)
    
    # F vertical bar (orange)
    draw.rectangle(
        [(f_left, f_top), (f_left + int(f_width*0.35), f_top + f_height)],
        fill=(255, 107, 53, 255)
    )
    
    # F top horizontal (orange)
    h_bar_height = int(f_width * 0.25)
    draw.rectangle(
        [(f_left + int(f_width*0.3), f_top), 
         (f_left + f_width + int(f_width*0.2), f_top + h_bar_height)],
        fill=(255, 107, 53, 255)
    )
    
    # F middle horizontal (yellow)
    mid_pos = int(f_top + f_height * 0.45)
    draw.rectangle(
        [(f_left + int(f_width*0.3), mid_pos), 
         (f_left + f_width, mid_pos + h_bar_height)],
        fill=(255, 184, 0, 255)
    )
    
    return img

# Create 192x192 icon
icon_192 = create_icon(192)
icon_192.save('icon-192.png', 'PNG')
print("[OK] icon-192.png created")

# Create 512x512 icon
icon_512 = create_icon(512)
icon_512.save('icon-512.png', 'PNG')
print("[OK] icon-512.png created")

print("[DONE] Modern icons created successfully!")
