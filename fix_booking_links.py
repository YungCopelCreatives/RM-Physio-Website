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
    if 'playwright-report' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            all_files.append(os.path.join(root, file))

def fix_booking_links(filepath):
    """Replace booking links to point to appointments.html"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace various booking link patterns
        # From root level files: /#booking -> /appointments.html
        content = re.sub(r'href="/#booking"', r'href="/appointments.html"', content)
        
        # From subdirectory files: ../#booking -> ../appointments.html
        content = re.sub(r'href="\.\./\#booking"', r'href="../appointments.html"', content)
        
        # From deeper subdirectories: ../../#booking -> ../../appointments.html  
        content = re.sub(r'href="\.\.\/\.\./\#booking"', r'href="../../appointments.html"', content)
        
        # From any level: #booking -> /appointments.html (for standalone # links)
        content = re.sub(r'href="#booking"', r'href="/appointments.html"', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed booking links in: {filepath}")
            return True
        else:
            print(f"No booking links to fix in: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all files
print("Fixing booking links to point to appointments.html...")
for file_path in all_files:
    fix_booking_links(file_path)

print("Done!")