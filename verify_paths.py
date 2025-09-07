#!/usr/bin/env python3
"""
Verify that all HTML files use relative paths instead of absolute paths.
This helps ensure CSS and assets will load correctly on GitHub Pages.
"""

import os
import re

def check_file(file_path):
    """Check a single HTML file for absolute paths."""
    issues = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for problematic absolute paths
            if 'href="/' in line and not any(skip in line for skip in ['http://', 'https://', 'mailto:', 'tel:', '#']):
                issues.append(f"Line {i}: {line.strip()}")
            if 'src="/' in line and not any(skip in line for skip in ['http://', 'https://']):
                issues.append(f"Line {i}: {line.strip()}")
                
    except Exception as e:
        issues.append(f"Error reading file: {e}")
    
    return issues

def main():
    """Main function to verify all HTML files."""
    base_path = "/Users/macbook/Desktop/RM-Physiotherapy Website 2025"
    
    # Find all HTML files (excluding node_modules and test directories)
    html_files = []
    for root, dirs, files in os.walk(base_path):
        if any(skip in root for skip in ['playwright-report', 'test-results', 'node_modules']):
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"Checking {len(html_files)} HTML files for absolute paths...")
    print("=" * 60)
    
    total_issues = 0
    
    for html_file in html_files:
        issues = check_file(html_file)
        if issues:
            rel_path = os.path.relpath(html_file, base_path)
            print(f"\n❌ {rel_path}:")
            for issue in issues:
                print(f"   {issue}")
            total_issues += len(issues)
    
    print("\n" + "=" * 60)
    if total_issues == 0:
        print("✅ All HTML files look good! No absolute path issues found.")
    else:
        print(f"❌ Found {total_issues} absolute path issues that need fixing.")
    
    print("\nNote: This check excludes external URLs (http/https), mailto, tel, and fragment links (#).")

if __name__ == "__main__":
    main()