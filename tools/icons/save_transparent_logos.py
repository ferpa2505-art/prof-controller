#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image

# Save transparent logos for use in all themes
transparent_logos = r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\8a6c64ee-10f4-4d44-975e-cbdae153d2df-davinci___agora_quero_estes_3_com_fundo_transparente___ima.png'

# Load and save as transparent logo variants
img = Image.open(transparent_logos)
img.save('logo-transparent.png')
print('Saved: logo-transparent.png')

# Also save icon variants
icon_img = Image.open(r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\354ecd36-78e0-42e8-9904-d992b8cc8620-davinci__image1____agora_quero_que_fique_somente_o_icone__.png')
icon_img.save('icon-transparent.png')
print('Saved: icon-transparent.png')

# Save futuristic background logo for Profit C theme
future_logo = Image.open(r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\f7857e9d-10b3-4469-9f68-05c81979ad4a-davinci__image1__image2__quero_combinar_o_s_mbolo__pf__com.png')
future_logo.save('logo-profit-c.png')
print('Saved: logo-profit-c.png (Profit C theme)')
