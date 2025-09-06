#!/usr/bin/env python3
import os
import re
import glob

# Directory containing the website files
base_dir = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"

# Find all HTML files
root_files = [f for f in glob.glob(os.path.join(base_dir, "*.html")) if not f.endswith("index.html")]
index_file = [os.path.join(base_dir, "index.html")]
condition_files = glob.glob(os.path.join(base_dir, "conditions", "*.html"))
blog_files = glob.glob(os.path.join(base_dir, "blog", "**", "*.html"), recursive=True)

def fix_root_file(filepath):
    """Fix logos in root-level HTML files (use /images/ or images/)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix all logo references to use consistent format without width/height
        content = re.sub(
            r'<img src="[^"]*Logo\.png"[^>]*>',
            r'<img src="images/Logo.png" alt="RM Physiotherapy Logo">',
            content
        )
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed root file: {filepath}")
            return True
        else:
            print(f"No changes needed in root file: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def fix_subfolder_file(filepath):
    """Fix logos in subfolder HTML files (use ../images/)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix all logo references to use ../images/ format without width/height
        content = re.sub(
            r'<img src="[^"]*Logo\.png"[^>]*>',
            r'<img src="../images/Logo.png" alt="RM Physiotherapy Logo">',
            content
        )
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed subfolder file: {filepath}")
            return True
        else:
            print(f"No changes needed in subfolder file: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all files
print("Fixing all logo paths...")

# Fix root files (including appointments.html)
for file_path in root_files + index_file:
    fix_root_file(file_path)

# Fix subfolder files  
for file_path in condition_files + blog_files:
    fix_subfolder_file(file_path)

print("Done!")