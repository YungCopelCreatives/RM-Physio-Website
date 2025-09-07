#!/usr/bin/env python3
"""
Update all HTML files to reference style.css in the root directory instead of css/style.css
"""

import os
import re

def update_css_references(file_path):
    """Update CSS references in a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Update CSS references
        content = re.sub(r'href="css/style\.css"', 'href="style.css"', content)
        content = re.sub(r'href="\.\.\/css\/style\.css"', 'href="../style.css"', content)
        content = re.sub(r'href="\.\.\/\.\.\/css\/style\.css"', 'href="../../style.css"', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
            return True
        else:
            print(f"No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to update all HTML files."""
    base_path = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"
    
    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk(base_path):
        # Skip node_modules and test directories
        if any(skip in root for skip in ['node_modules', 'playwright-report', 'test-results']):
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"Found {len(html_files)} HTML files to update...")
    
    updated_count = 0
    for html_file in html_files:
        if update_css_references(html_file):
            updated_count += 1
    
    print(f"\nSummary: Updated {updated_count} files out of {len(html_files)} total files.")
    print("CSS reference update complete!")

if __name__ == "__main__":
    main()