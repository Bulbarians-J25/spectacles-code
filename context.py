import os
import re
import argparse
import fnmatch

"""
# HOW TO USE

## PURPOSE
This script consolidates all relevant code files in a directory into a single text file named 'all-lines.txt'. It automatically removes comments, blank lines, and excludes non-code files and specified directories.

## BASIC USAGE
1. Run the script:
   python context.py

## EXCLUDING FILES AND DIRECTORIES
Use the `--exclude` flag followed by one or more file names, directory names, or patterns to exclude them from the output.

### More Examples:

# Exclude a single file:
python context.py --exclude config.js

# Exclude a directory (use quotes if your shell requires it for wildcards):
python context.py --exclude 'dist/*'

# Exclude all files in a 'tests' subdirectory:
python context.py --exclude 'tests/*'

# Exclude all files with a specific extension:
python context.py --exclude '*.log'

# Exclude all files ending with '_temp.py':
python context.py --exclude '*_temp.py'

# Exclude multiple different files and patterns:
python context.py --exclude secrets.py 'dist/*' '*.xml' 'temp_folder/*'

## NOTES
- The output file 'all-lines.txt' is automatically excluded.
- Default excluded directories: .git, .github, .vscode, __pycache__
- Default excluded file types include images, documents, and archives (e.g., .png, .pdf, .zip).
"""

def get_directory_tree(path):
    tree = []
    default_excluded_dirs = ['.git', '.github', '.vscode', '__pycache__']
    for root, dirs, files in os.walk(path, topdown=True):
        dirs[:] = [d for d in dirs if d not in default_excluded_dirs]
        level = root.replace(path, '').count(os.sep)
        indent = ' ' * 4 * (level)
        tree.append(f'{indent}{os.path.basename(root)}/')
        sub_indent = ' ' * 4 * (level + 1)
        for f in files:
            tree.append(f'{sub_indent}{f}')
    return '\n'.join(tree)

def strip_comments(content, file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.py']:
        content = re.sub(r'""".*?"""', '', content, flags=re.DOTALL)
        content = re.sub(r"'''.*?'''", '', content, flags=re.DOTALL)
        content = re.sub(r'#.*', '', content)
    elif ext in ['.c', '.h', '.cpp', '.hpp', '.java', '.js', '.cs', '.go', '.ts', '.tsx']:
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        content = re.sub(r'//.*', '', content)
    elif ext in ['.html', '.xml']:
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    elif ext in ['.sh', '.bash', '.zsh', 'rb', 'yml', 'yaml']:
        content = re.sub(r'#.*', '', content)
    return content

def main():
    parser = argparse.ArgumentParser(description='Gather code files into a single file, excluding comments and specified files.')
    parser.add_argument('--exclude', nargs='*', default=[], help='A list of files or patterns to exclude.')
    args = parser.parse_args()
    current_directory = '.'
    output_file = 'all-lines.txt'
    default_excluded_extensions = ['.txt', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.mp4', '.mov', '.avi', '.mkv', '.zip', '.gz', '.tar', '.rar', '.exe', '.dll', '.so', '.a', '.lib', '.o', '.obj', '.class', '.pyc']
    default_excluded_dirs = ['.git', '.github', '.vscode', '__pycache__']
    user_excluded_files = args.exclude
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("====== DIRECTORY TREE ======\n")
        tree = get_directory_tree(current_directory)
        outfile.write(tree)
        outfile.write("\n\n")
        for root, dirs, files in os.walk(current_directory, topdown=True):
            dirs[:] = [d for d in dirs if d not in default_excluded_dirs and not any(fnmatch.fnmatch(d, pattern) for pattern in user_excluded_files)]
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, current_directory)
                if any(file.lower().endswith(ext) for ext in default_excluded_extensions):
                    continue
                if any(fnmatch.fnmatch(file, pattern) for pattern in user_excluded_files):
                    continue
                if os.path.abspath(file_path) == os.path.abspath(output_file):
                    continue
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                    stripped_content = strip_comments(content, file)
                    lines = [line for line in stripped_content.splitlines() if line.strip()]
                    if lines:
                        outfile.write(f"====== CONTENT OF: {relative_path} ======\n")
                        outfile.write('\n'.join(lines))
                        outfile.write("\n\n")
                except Exception as e:
                    print(f"Could not process file {file_path}: {e}")

if __name__ == '__main__':
    main()