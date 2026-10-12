#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image

# Use the black background icon you provided
black_icon = r'C:\Users\ferpa\.copilot\workspaces\f45a47bf-4d00-448d-84e7-a34bdf046f3c\attachments\5caa231b-fe4f-4ed3-b7d2-f93366d5304d-Captura de tela 2026-09-25 181804.png'

# Load and save as logo
img = Image.open(black_icon)
img.save('logo-prof.png')
print('Updated: logo-prof.png (black background)')
