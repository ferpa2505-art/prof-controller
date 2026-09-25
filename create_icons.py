from PIL import Image, ImageDraw
import math

def create_icon(size=192):
    """Create modern geometric/abstract ProF Controller icon"""
    # Create transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Draw background with gradient effect
    # Create a radial gradient manually
    for i in range(size):
        for j in range(size):
            # Distance from center
            dist = math.sqrt((i - center)**2 + (j - center)**2)
            max_dist = center * 1.4
            
            if dist < max_dist:
                # Gradient from dark to slightly lighter
                ratio = dist / max_dist
                r = int(10 + ratio * 20)
                g = int(14 + ratio * 40)
                b = int(39 + ratio * 80)
                img.putpixel((i, j), (r, g, b, 255))
    
    # Draw geometric shapes - Modern abstract design
    
    # Outer glow circle
    glow_margin = int(size * 0.08)
    draw.ellipse(
        [(glow_margin, glow_margin), (size - glow_margin, size - glow_margin)],
        outline=(0, 153, 255, 120),
        width=2
    )
    
    # Central hexagon/polygon for modern look
    hex_size = int(size * 0.35)
    hex_points = []
    for i in range(6):
        angle = (i * 60 - 90) * math.pi / 180
        x = center + hex_size * math.cos(angle)
        y = center + hex_size * math.sin(angle)
        hex_points.append((x, y))
    
    # Draw hexagon with gradient colors
    draw.polygon(hex_points, fill=(0, 153, 255, 80), outline=(0, 153, 255, 200), width=2)
    
    # Draw P shape - geometric style (left side)
    p_box = int(size * 0.18)
    p_x = int(center * 0.6)
    p_y = int(center * 0.5)
    
    # P vertical bar (strong blue)
    draw.rectangle(
        [(p_x, p_y), (p_x + int(p_box*0.3), p_y + int(p_box*1.3))],
        fill=(0, 99, 255, 255)
    )
    
    # P curved top (vibrant green)
    draw.ellipse(
        [(p_x + int(p_box*0.2), p_y), 
         (p_x + p_box, p_y + int(p_box*0.6))],
        fill=(0, 215, 126, 255)
    )
    
    # Draw F shape - geometric style (right side)
    f_box = int(size * 0.16)
    f_x = int(center * 1.4)
    f_y = int(center * 0.52)
    
    # F vertical bar (vibrant orange)
    draw.rectangle(
        [(f_x, f_y), (f_x + int(f_box*0.3), f_y + int(f_box*1.2))],
        fill=(255, 107, 53, 255)
    )
    
    # F top horizontal (orange)
    draw.rectangle(
        [(f_x + int(f_box*0.25), f_y), 
         (f_x + f_box * 0.95, f_y + int(f_box*0.25))],
        fill=(255, 107, 53, 255)
    )
    
    # F middle horizontal (bright yellow)
    draw.rectangle(
        [(f_x + int(f_box*0.25), f_y + int(f_box*0.55)), 
         (f_x + f_box * 0.85, f_y + int(f_box*0.75))],
        fill=(255, 215, 0, 255)
    )
    
    # Add accent triangles for modern look
    triangle_size = int(size * 0.08)
    
    # Top-right accent (cyan)
    draw.polygon(
        [(size - triangle_size*2, triangle_size), 
         (size - triangle_size, 0), 
         (size, triangle_size)],
        fill=(0, 212, 255, 200)
    )
    
    # Bottom-left accent (bright green)
    draw.polygon(
        [(triangle_size*0.5, size - triangle_size*1.5), 
         (0, size - triangle_size*0.5), 
         (triangle_size, size)],
        fill=(0, 220, 130, 200)
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
