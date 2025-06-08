#!/usr/bin/env python3

import os
import sys
import re
import subprocess
import argparse
from typing import List, Dict, Optional, Tuple
from enum import Enum
import textwrap

# ANSI color codes for terminal output
class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"

# Commit type definitions based on Conventional Commits
class CommitType(Enum):
    FEAT = ("feat", "A new feature")
    FIX = ("fix", "A bug fix")
    DOCS = ("docs", "Documentation only changes")
    STYLE = ("style", "Changes that don't affect code meaning (white-space, formatting, etc.)")
    REFACTOR = ("refactor", "Code change that neither fixes a bug nor adds a feature")
    PERF = ("perf", "Code change that improves performance")
    TEST = ("test", "Adding missing tests or correcting existing tests")
    BUILD = ("build", "Changes that affect the build system or external dependencies")
    CI = ("ci", "Changes to CI configuration files and scripts")
    CHORE = ("chore", "Other changes that don't modify src or test files")
    REVERT = ("revert", "Reverts a previous commit")

    def __init__(self, prefix: str, description: str):
        self.prefix = prefix
        self.description = description

# Rules for commit messages
MAX_SUBJECT_LENGTH = 72
MAX_BODY_LINE_LENGTH = 72
MAX_FOOTER_LINE_LENGTH = 72

def get_changed_files() -> List[str]:
    """Get a list of changed files from git status."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True
        )
        files = [line[3:] for line in result.stdout.splitlines() if line.strip()]
        return files
    except subprocess.SubprocessError:
        return []

def get_commit_template() -> Optional[str]:
    """Get the commit template if configured in git."""
    try:
        result = subprocess.run(
            ["git", "config", "--get", "commit.template"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            template_path = os.path.expanduser(result.stdout.strip())
            if os.path.exists(template_path):
                with open(template_path, 'r') as f:
                    return f.read()
    except Exception:
        pass
    return None

def get_branch_name() -> Optional[str]:
    """Get the current branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.SubprocessError:
        return None

def extract_issue_number(branch_name: str) -> Optional[str]:
    """Extract issue number from branch name using common patterns."""
    if not branch_name:
        return None
        
    # Common branch naming conventions
    patterns = [
        r'(?:issue|issues|bug|feature|feat|fix|ticket|jira)[/-]?(\d+)',  # issue-123, feature/456
        r'[A-Z]+-\d+',  # JIRA-123, PROJ-456
        r'#(\d+)',  # #123
        r'(\d+)'  # Just a number as fallback
    ]
    
    for pattern in patterns:
        match = re.search(pattern, branch_name, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return None

def wrap_text(text: str, width: int) -> List[str]:
    """Wrap text to a specified width."""
    if not text:
        return []
    return textwrap.wrap(text, width=width)

def validate_subject(subject: str) -> Tuple[bool, str]:
    """Validate the commit subject line."""
    if not subject:
        return False, "Subject cannot be empty"
    if len(subject) > MAX_SUBJECT_LENGTH:
        return False, f"Subject exceeds maximum length of {MAX_SUBJECT_LENGTH} characters"
    if subject[0].islower():
        return False, "Subject should start with a capital letter"
    if subject.endswith("."):
        return False, "Subject should not end with a period"
    return True, ""

def create_commit_message() -> str:
    """Interactive process to create a commit message."""
    print(f"{Colors.BOLD}{Colors.BLUE}Git Commit Message Generator{Colors.RESET}")
    print(f"{Colors.CYAN}Following conventional commits specification{Colors.RESET}")
    print("https://www.conventionalcommits.org/\n")
    
    # Show changed files to help with context
    changed_files = get_changed_files()
    if changed_files:
        print(f"{Colors.YELLOW}Changed files:{Colors.RESET}")
        for file in changed_files[:10]:  # Limit to 10 files to avoid clutter
            print(f"  - {file}")
        if len(changed_files) > 10:
            print(f"  ... and {len(changed_files) - 10} more files")
        print("")
    
    # Get commit type
    print(f"{Colors.BOLD}Select commit type:{Colors.RESET}")
    for i, commit_type in enumerate(CommitType, 1):
        print(f"  {i}. {Colors.GREEN}{commit_type.prefix}{Colors.RESET}: {commit_type.description}")
    
    while True:
        try:
            type_choice = int(input("\nEnter number (1-11): "))
            if 1 <= type_choice <= len(CommitType):
                selected_type = list(CommitType)[type_choice - 1]
                break
            print(f"{Colors.RED}Invalid choice. Please enter a number between 1 and {len(CommitType)}.{Colors.RESET}")
        except ValueError:
            print(f"{Colors.RED}Please enter a valid number.{Colors.RESET}")
    
    # Get scope (optional)
    print(f"\n{Colors.BOLD}Enter scope (optional, press Enter to skip):{Colors.RESET}")
    print("Examples: ui, api, auth, database")
    scope = input("Scope: ").strip()
    
    # Get subject
    print(f"\n{Colors.BOLD}Enter commit subject:{Colors.RESET}")
    print(f"- Maximum {MAX_SUBJECT_LENGTH} characters")
    print("- Start with a capital letter")
    print("- No period at the end")
    print("- Use imperative mood (e.g., 'Add' not 'Added' or 'Adds')")
    
    while True:
        subject = input("\nSubject: ").strip()
        is_valid, error = validate_subject(subject)
        if is_valid:
            break
        print(f"{Colors.RED}{error}{Colors.RESET}")
    
    # Get body (optional)
    print(f"\n{Colors.BOLD}Enter commit body (optional, press Enter to skip):{Colors.RESET}")
    print("- Explain WHY this change is being made")
    print("- Separate paragraphs with a blank line")
    print("- Use bullet points with * if helpful")
    print(f"- Each line will be wrapped to {MAX_BODY_LINE_LENGTH} characters")
    print("- Type a single '.' on a line to finish")
    
    body_lines = []
    while True:
        line = input("> ")
        if line == ".":
            break
        body_lines.append(line)
    
    # Get footer (optional)
    print(f"\n{Colors.BOLD}Enter commit footer (optional, press Enter to skip):{Colors.RESET}")
    print("- Reference issues and PRs here (e.g., 'Fixes #123')")
    print("- List breaking changes (e.g., 'BREAKING CHANGE: API renamed')")
    print("- Type a single '.' on a line to finish")
    
    # Try to suggest issue number from branch name
    branch_name = get_branch_name()
    issue_number = extract_issue_number(branch_name) if branch_name else None
    if issue_number:
        print(f"{Colors.YELLOW}Suggested reference: Fixes #{issue_number}{Colors.RESET}")
    
    footer_lines = []
    while True:
        line = input("> ")
        if line == ".":
            break
        footer_lines.append(line)
    
    # Build the commit message
    # First line: type(scope): subject
    if scope:
        message = f"{selected_type.prefix}({scope}): {subject}"
    else:
        message = f"{selected_type.prefix}: {subject}"
    
    # Add body if provided
    if body_lines:
        # Add a blank line between subject and body
        message += "\n\n"
        
        # Process and wrap body lines
        processed_body = []
        current_paragraph = []
        
        for line in body_lines:
            if not line.strip():  # Empty line indicates paragraph break
                if current_paragraph:
                    processed_body.extend(wrap_text(" ".join(current_paragraph), MAX_BODY_LINE_LENGTH))
                    processed_body.append("")  # Add blank line between paragraphs
                    current_paragraph = []
            else:
                current_paragraph.append(line)
        
        # Process the last paragraph
        if current_paragraph:
            processed_body.extend(wrap_text(" ".join(current_paragraph), MAX_BODY_LINE_LENGTH))
        
        message += "\n".join(processed_body)
    
    # Add footer if provided
    if footer_lines:
        # Ensure there's a blank line before the footer
        if not message.endswith("\n\n"):
            if message.endswith("\n"):
                message += "\n"
            else:
                message += "\n\n"
                
        message += "\n".join(footer_lines)
    
    return message

def save_to_file(message: str, filename: str = "COMMIT_MSG") -> str:
    """Save the commit message to a file."""
    file_path = os.path.abspath(filename)
    with open(file_path, 'w') as f:
        f.write(message)
    return file_path

def commit_with_message(message: str) -> bool:
    """Commit using the generated message."""
    try:
        subprocess.run(
            ["git", "commit", "-m", message],
            check=True
        )
        return True
    except subprocess.SubprocessError as e:
        print(f"{Colors.RED}Failed to commit: {e}{Colors.RESET}")
        return False

def preview_message(message: str) -> None:
    """Display a preview of the commit message."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}Commit Message Preview:{Colors.RESET}")
    print(f"{Colors.CYAN}{'-' * 50}{Colors.RESET}")
    print(message)
    print(f"{Colors.CYAN}{'-' * 50}{Colors.RESET}")

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate a well-formatted git commit message")
    parser.add_argument(
        "-c", "--commit", 
        action="store_true", 
        help="Automatically commit with the generated message"
    )
    parser.add_argument(
        "-o", "--output", 
        help="Output the message to a file instead of committing"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    
    try:
        message = create_commit_message()
        preview_message(message)
        
        if args.commit:
            print("\nCommitting with this message...")
            if commit_with_message(message):
                print(f"{Colors.GREEN}Commit successful!{Colors.RESET}")
        elif args.output:
            file_path = save_to_file(message, args.output)
            print(f"\nCommit message saved to {file_path}")
            print(f"You can use it with: git commit -F {file_path}")
        else:
            # Ask what to do with the message
            print("\nWhat would you like to do with this message?")
            print("  1. Commit now")
            print("  2. Save to a file")
            print("  3. Copy to clipboard")
            print("  4. Just display (do nothing else)")
            
            choice = input("Enter your choice (1-4): ").strip()
            
            if choice == "1":
                if commit_with_message(message):
                    print(f"{Colors.GREEN}Commit successful!{Colors.RESET}")
            elif choice == "2":
                file_path = save_to_file(message)
                print(f"\nCommit message saved to {file_path}")
                print(f"You can use it with: git commit -F {file_path}")
            elif choice == "3":
                try:
                    # Use pbcopy on macOS, clip on Windows, or xclip/xsel on Linux
                    if sys.platform == "darwin":  # macOS
                        subprocess.run(["pbcopy"], input=message.encode(), check=True)
                    elif sys.platform == "win32":  # Windows
                        subprocess.run(["clip"], input=message.encode(), check=True)
                    else:  # Linux
                        try:
                            subprocess.run(["xclip", "-selection", "clipboard"], input=message.encode(), check=True)
                        except FileNotFoundError:
                            try:
                                subprocess.run(["xsel", "-ib"], input=message.encode(), check=True)
                            except FileNotFoundError:
                                print(f"{Colors.RED}Could not find clipboard program. Message not copied.{Colors.RESET}")
                                return
                    print(f"{Colors.GREEN}Message copied to clipboard!{Colors.RESET}")
                except subprocess.SubprocessError:
                    print(f"{Colors.RED}Failed to copy to clipboard{Colors.RESET}")
            elif choice == "4":
                print("Message displayed only. No action taken.")
            else:
                print(f"{Colors.RED}Invalid choice.{Colors.RESET}")
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
        sys.exit(1)

if __name__ == "__main__":
    main()

