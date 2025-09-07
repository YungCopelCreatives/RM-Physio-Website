#!/usr/bin/env python3
"""
Fix absolute paths in HTML files to use relative paths instead.
This fixes the issue where CSS and other resources don't load when deployed to GitHub Pages.
"""

import os
import re
import glob

def fix_paths_in_file(file_path):
    """Fix absolute paths in a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix CSS paths
        content = re.sub(r'href="/css/', 'href="css/', content)
        content = re.sub(r'href="\./css/', 'href="css/', content)
        
        # Fix JS paths  
        content = re.sub(r'src="/js/', 'src="js/', content)
        content = re.sub(r'src="\./js/', 'src="js/', content)
        
        # Fix image paths
        content = re.sub(r'src="/images/', 'src="images/', content)
        content = re.sub(r'src="\./images/', 'src="images/', content)
        
        # Fix favicon paths
        content = re.sub(r'href="/favicon', 'href="favicon', content)
        content = re.sub(r'href="/apple-touch-icon', 'href="apple-touch-icon', content)
        content = re.sub(r'href="/manifest', 'href="manifest', content)
        
        # Fix RSS feed paths
        content = re.sub(r'href="/rss\.xml"', 'href="rss.xml"', content)
        
        # Fix HTML page links (but be careful with fragments like #top)
        content = re.sub(r'href="/([a-zA-Z][^"]*\.html)"', r'href="\1"', content)
        content = re.sub(r'href="/([a-zA-Z][^"#]*/)?"', r'href="\1"', content)
        
        # Special case: fix root link
        content = re.sub(r'href="/"', 'href="index.html"', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
            return True
        else:
            print(f"No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix all HTML files."""
    base_path = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"
    
    # Find all HTML files
    html_files = []
    for root, dirs, files in os.walk(base_path):
        # Skip playwright-report directory
        if 'playwright-report' in root or 'test-results' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"Found {len(html_files)} HTML files to process...")
    
    fixed_count = 0
    for html_file in html_files:
        if fix_paths_in_file(html_file):
            fixed_count += 1
    
    print(f"\nSummary: Fixed {fixed_count} files out of {len(html_files)} total files.")
    print("Path fixing complete!")

if __name__ == "__main__":
    main()