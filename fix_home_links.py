#!/usr/bin/env python3
import os
import re
import glob

# Directory containing the website files
base_dir = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"

# Find all HTML files
all_files = []
for root, dirs, files in os.walk(base_dir):
    # Skip certain directories
    if 'playwright-report' in root or '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            all_files.append(os.path.join(root, file))

def fix_home_links(filepath):
    """Update home navigation links to use /index.html"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix home navigation links in nav menus
        content = re.sub(
            r'<a href="/" class="nav-link">Home</a>', 
            r'<a href="/index.html" class="nav-link">Home</a>', 
            content
        )
        
        # Fix home navigation links from subdirectories
        content = re.sub(
            r'<a class="nav-link" href="/">Home</a>', 
            r'<a class="nav-link" href="/index.html">Home</a>', 
            content
        )
        
        # Fix home links in quick links sections of footers
        content = re.sub(
            r'<li><a href="/">Home</a></li>', 
            r'<li><a href="/index.html">Home</a></li>', 
            content
        )
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed home links in: {filepath}")
            return True
        else:
            print(f"No home links to fix in: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all files
print("Fixing home links to use /index.html...")
for file_path in all_files:
    fix_home_links(file_path)

print("Done!")