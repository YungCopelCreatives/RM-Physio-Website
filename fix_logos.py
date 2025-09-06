#!/usr/bin/env python3
import os
import re
import glob

# Directory containing the website files
base_dir = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"

# Find all HTML files in conditions and blog directories
condition_files = glob.glob(os.path.join(base_dir, "conditions", "*.html"))
blog_files = glob.glob(os.path.join(base_dir, "blog", "**", "*.html"), recursive=True)
all_files = condition_files + blog_files

def fix_file(filepath):
    """Fix logos and remove newsletter sections in HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix header logo - remove width, height, and "RM Physiotherapy" text
        content = re.sub(
            r'<img src="([^"]*Logo\.png)"[^>]*>\s*RM Physiotherapy',
            r'<img src="\1" alt="RM Physiotherapy Logo">',
            content
        )
        
        # Fix footer logo - remove width, height, style margin-right, and "RM Physiotherapy" text
        content = re.sub(
            r'<img src="([^"]*Logo\.png)"[^>]*style="[^"]*">\s*RM Physiotherapy',
            r'<img src="\1" alt="RM Physiotherapy Logo">',
            content
        )
        
        # Remove newsletter section from footer
        newsletter_pattern = r'<h3[^>]*>Newsletter</h3>.*?</form>'
        content = re.sub(newsletter_pattern, '', content, flags=re.DOTALL)
        
        # Clean up any extra whitespace or empty lines that might have been left
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
            return True
        else:
            print(f"No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all files
print("Fixing logos and newsletters in condition and blog pages...")
for file_path in all_files:
    fix_file(file_path)

print("Done!")