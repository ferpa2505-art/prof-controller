#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image

# Use the images you provided
images = {
    'text': r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\5bf6e7bb-1bc4-40fe-b4f8-ff5c39fc5c98-Imagemgerada_1790352601389.png',
    'logo': r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\047e01a5-0989-4bf0-8995-674a3dd65b74-Imagemgerada_1790352473415.png',
    'neon_3d': r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\5a659895-5bb5-4bd6-a4ce-73472329b0eb-Imagemgerada_1790352489293.png'
}

# Use the 3D neon icon for both sizes
img = Image.open(images['neon_3d'])

# Resize to 192x192
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save('icon-192.png')
print('Created: icon-192.png')

# Resize to 512x512
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save('icon-512.png')
print('Created: icon-512.png')

# Copy logo
logo_img = Image.open(images['logo'])
logo_img.save('logo-prof.png')
print('Created: logo-prof.png')
