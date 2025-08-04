#!/usr/bin/env python3

import os
import getpass
import subprocess
import argparse
import sys
import tempfile
import shutil
import datetime
import json

def create_backup_file(file_path, backup_dir=None):
    """Create a backup of the specified file"""
    if not os.path.exists(file_path):
        return None
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.basename(file_path)
    
    if backup_dir:
        # Create backup directory if it doesn't exist
        os.makedirs(backup_dir, exist_ok=True)
        backup_path = os.path.join(backup_dir, f"{filename}.{timestamp}.bak")
    else:
        backup_path = f"{file_path}.{timestamp}.bak"
        
    shutil.copy2(file_path, backup_path)
    return backup_path

def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate a GPG key for GitHub commit signing')
    parser.add_argument('--name', help='Your full name')
    parser.add_argument('--email', help='Your GitHub email address')
    parser.add_argument('--comment', default='GitHub GPG Key', help='Optional comment for the key')
    parser.add_argument('--key-type', default='RSA', help='Key type (default: RSA)')
    parser.add_argument('--key-length', type=int, default=4096, help='Key length in bits (default: 4096)')
    parser.add_argument('--no-expire', action='store_true', help='Set the key to never expire')
    parser.add_argument('--skip-backup', action='store_true', help='Skip creating backups of modified files')
    parser.add_argument('--backup-dir', help='Directory to store backups (default: same directory as original files)')
    return parser.parse_args()

def main():
    # Parse command line arguments
    args = parse_arguments()
    
    # Initialize backup tracking
    backup_files = {}
    
    # Get the path to gpg binary dynamically
    try:
        gpg_binary = subprocess.check_output(["which", "gpg"]).decode().strip()
    except subprocess.CalledProcessError:
        print("Error: GPG not found. Please install GPG first.")
        sys.exit(1)
    
    print(f"Using GPG binary at: {gpg_binary}")
    
    # Get user input
    print("\nGenerating a new GPG key for GitHub commits")
    print("===============================================")
    name = args.name or input("Enter your full name: ")
    email = args.email or input("Enter your GitHub email address: ")
    comment = args.comment if args.comment != "GitHub GPG Key" else input("Enter a comment (optional, press Enter to skip): ") or "GitHub GPG Key"
    
    # Get secure passphrase
    passphrase = getpass.getpass("Enter a secure passphrase for your GPG key: ")
    if not passphrase:
        print("Error: Passphrase cannot be empty")
        return
    
    # Create a temporary batch file for GPG key generation
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as batch_file:
        # Write key generation parameters to the batch file
        batch_file.write(f"Key-Type: {args.key_type}\n")
        batch_file.write(f"Key-Length: {args.key_length}\n")
        batch_file.write(f"Name-Real: {name}\n")
        if comment:
            batch_file.write(f"Name-Comment: {comment}\n")
        batch_file.write(f"Name-Email: {email}\n")
        batch_file.write(f"Passphrase: {passphrase}\n")
        if args.no_expire:
            batch_file.write("Expire-Date: 0\n")
        else:
            batch_file.write("Expire-Date: 2y\n")  # Default expiry of 2 years
        batch_file.write("%commit\n")
        batch_file.write("%echo Done\n")
        
        batch_file_path = batch_file.name
    
    try:
        # Generate the key using GPG batch mode
        print("\nGenerating GPG key. This may take a moment...")
        process = subprocess.run(
            [gpg_binary, "--batch", "--generate-key", batch_file_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Extract key fingerprint from the output
        output_lines = process.stderr.splitlines()
        fingerprint = None
        for line in output_lines:
            if "revocation certificate stored as" in line:
                # Extract fingerprint from the path
                parts = line.split("/")
                for part in parts:
                    if ".rev" in part:
                        fingerprint = part.replace(".rev", "")
                        break
        
        if not fingerprint:
            # Try to find the latest key
            process = subprocess.run(
                [gpg_binary, "--list-secret-keys", "--with-colons"],
                capture_output=True,
                text=True,
                check=True
            )
            
            for line in process.stdout.splitlines():
                if line.startswith("fpr:"):
                    # Format: fpr:::::::::FINGERPRINT:
                    fingerprint = line.split(":")[9]
        
        if not fingerprint:
            print("Error: Failed to retrieve key fingerprint.")
            return
            
        print(f"\nSuccessfully generated GPG key with ID: {fingerprint}")
        
        # Export the public key - but first make sure we're only exporting this specific key
        # Trim any single quote that might be in the fingerprint
        fingerprint = fingerprint.replace("'", "")
        
        # Verify the key actually exists before exporting
        verify_process = subprocess.run(
            [gpg_binary, "--list-keys", fingerprint],
            capture_output=True,
            text=True
        )
        
        if verify_process.returncode != 0:
            print(f"Warning: Key with fingerprint {fingerprint} not found. Attempting to find the correct key...")
            # Try to find the most recently created key
            list_process = subprocess.run(
                [gpg_binary, "--list-secret-keys", "--with-colons"],
                capture_output=True,
                text=True,
                check=True
            )
            
            latest_time = 0
            latest_fingerprint = None
            
            for line in list_process.stdout.splitlines():
                if line.startswith("pub:"):
                    parts = line.split(":")
                    creation_time = int(parts[5])
                    if creation_time > latest_time:
                        latest_time = creation_time
                        # The fingerprint will be in the next line
                        fingerprint_line = next((l for l in list_process.stdout.splitlines() if l.startswith("fpr:") and l.split(":")[0] == "fpr"), None)
                        if fingerprint_line:
                            latest_fingerprint = fingerprint_line.split(":")[9]
            
            if latest_fingerprint:
                fingerprint = latest_fingerprint
                print(f"Using most recently created key: {fingerprint}")
            else:
                print("Error: Could not find a valid GPG key to export.")
                return
        
        print(f"Exporting key with fingerprint: {fingerprint}")
        export_process = subprocess.run(
            [gpg_binary, "--armor", "--export", fingerprint],
            capture_output=True,
            text=True
        )
        
        ascii_armored_public_key = export_process.stdout
        
        # If output is empty, something went wrong
        if not ascii_armored_public_key.strip():
            print("Error: Failed to export the public key.")
            print(f"Please try manually with: gpg --armor --export {fingerprint} > ~/github_gpg_key.asc")
            return
        
        # If we still don't have the key, display an error
        if not ascii_armored_public_key.strip():
            print("Error: Failed to export the public key.")
            print("Please try manually with: gpg --armor --export <your-key-id> > ~/github_gpg_key.asc")
            return
        
        # Save public key to file
        public_key_file = os.path.expanduser("~/github_gpg_key.asc")
        with open(public_key_file, "w") as f:
            f.write(ascii_armored_public_key)
    except subprocess.CalledProcessError as e:
        print(f"Error executing GPG command: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return
    finally:
        # Clean up the temporary batch file
        if os.path.exists(batch_file_path):
            os.unlink(batch_file_path)
    
    print(f"\nYour public key has been saved to: {public_key_file}")
    print("\nAdd this key to your GitHub account:")
    print("1. Go to GitHub Settings -> SSH and GPG keys -> New GPG key")
    print("2. Copy and paste your public key into the form")
    print("\nTo copy your public key to clipboard, run:")
    print(f"cat {public_key_file} | pbcopy")
    
    # Ask if the user wants to configure Git now
    configure_now = input("\nDo you want to configure Git to use this key now? (Y/n): ").strip().lower()
    if configure_now == "" or configure_now == "y" or configure_now == "yes":
        try:
            # Create backup of the gitconfig file before modifying
            if not args.skip_backup:
                gitconfig_path = os.path.expanduser("~/.gitconfig")
                if os.path.exists(gitconfig_path):
                    backup_path = create_backup_file(gitconfig_path, args.backup_dir)
                    if backup_path:
                        backup_files["gitconfig"] = backup_path
                        print(f"✓ Created backup of Git config at: {backup_path}")
            
            # Configure Git to use the new key
            print("\nConfiguring Git to use your new GPG key...")
            
            # Set the signing key
            subprocess.run(
                ["git", "config", "--global", "user.signingkey", fingerprint],
                check=True
            )
            print("✓ Set signing key")
            
            # Configure the GPG program path
            subprocess.run(
                ["git", "config", "--global", "gpg.program", gpg_binary],
                check=True
            )
            print(f"✓ Set GPG program path to {gpg_binary}")
            
            # Enable commit signing
            subprocess.run(
                ["git", "config", "--global", "commit.gpgsign", "true"],
                check=True
            )
            print("✓ Enabled commit signing")
            
            # Enable tag signing
            subprocess.run(
                ["git", "config", "--global", "tag.gpgsign", "true"],
                check=True
            )
            print("✓ Enabled tag signing")
            
            # Set up GPG_TTY in shell profile for persistent configuration
            shell_profile = None
            if os.path.exists(os.path.expanduser("~/.zshrc")):
                shell_profile = os.path.expanduser("~/.zshrc")
            elif os.path.exists(os.path.expanduser("~/.bashrc")):
                shell_profile = os.path.expanduser("~/.bashrc")
            elif os.path.exists(os.path.expanduser("~/.bash_profile")):
                shell_profile = os.path.expanduser("~/.bash_profile")
            
            if shell_profile:
                # Create backup of shell profile before modifying
                if not args.skip_backup and os.path.exists(shell_profile):
                    backup_path = create_backup_file(shell_profile, args.backup_dir)
                    if backup_path:
                        backup_files["shell_profile"] = backup_path
                        print(f"✓ Created backup of shell profile at: {backup_path}")
                
                # Check if GPG_TTY is already in the profile
                with open(shell_profile, 'r') as f:
                    content = f.read()
                
                if "export GPG_TTY=$(tty)" not in content:
                    with open(shell_profile, 'a') as f:
                        f.write("\n# GPG configuration for Git commit signing\nexport GPG_TTY=$(tty)\n")
                    print(f"✓ Added GPG_TTY to {shell_profile}")
                    
                    # Export GPG_TTY in the current session
                    os.environ["GPG_TTY"] = subprocess.check_output(["tty"]).decode().strip()
                    print("✓ Set GPG_TTY in current session")
                else:
                    print(f"✓ GPG_TTY already configured in {shell_profile}")
            else:
                print("! Could not find shell profile to add GPG_TTY configuration")
                print("  Please manually add 'export GPG_TTY=$(tty)' to your shell profile")
            
            # Restart the GPG agent to ensure everything is working
            subprocess.run(["gpgconf", "--kill", "gpg-agent"], check=False)
            subprocess.run(["gpg-agent", "--daemon"], check=False)
            print("✓ Restarted GPG agent")
            
            print("\nGit has been successfully configured to use your GPG key!")
            print("You can now make signed commits and tags.")
        except Exception as e:
            print(f"\nError configuring Git: {str(e)}")
            print("\nTo manually configure Git to use this key, run these commands:")
            print(f"git config --global user.signingkey {fingerprint}")
            print(f"git config --global gpg.program {gpg_binary}")
            print("git config --global commit.gpgsign true")
            print("git config --global tag.gpgsign true")
    else:
        # Just show the commands to run manually
        print("\nTo configure Git to use this key, run these commands:")
        print(f"git config --global user.signingkey {fingerprint}")
        print(f"git config --global gpg.program {gpg_binary}")
        print("git config --global commit.gpgsign true")
        print("git config --global tag.gpgsign true")
    
    # Save backup information to a file and show summary
    if backup_files and not args.skip_backup:
        backup_info_path = os.path.expanduser("~/gpg_key_setup_backups.json")
        try:
            with open(backup_info_path, 'w') as f:
                json.dump({
                    "timestamp": datetime.datetime.now().isoformat(),
                    "backup_files": backup_files
                }, f, indent=2)
            print("\nBackup Summary:")
            print("===============")
            print(f"Backup information saved to: {backup_info_path}")
            for file_type, backup_path in backup_files.items():
                print(f"* {file_type}: {backup_path}")
            print("\nTo restore backups, manually copy these files back to their original locations.")
        except Exception as e:
            print(f"Warning: Failed to save backup information: {e}")
    
    print("\nDone! You can now make signed commits to GitHub.")
    
    print("\nTroubleshooting GPG Signing Issues:")
    print("=====================================")
    print("If you encounter 'error: gpg failed to sign the data' when committing, try:")
    print("\n1. Verify your GPG configuration:")
    print("   git config --list | grep -E '(gpg|sign)'")
    print("\n2. Restart the GPG agent:")
    print("   gpgconf --kill gpg-agent")
    print("\n3. Set the GPG_TTY environment variable:")
    print("   export GPG_TTY=$(tty)")
    print("\n4. Start a new GPG agent daemon:")
    print("   gpg-agent --daemon")
    print("\n5. Test if GPG works correctly:")
    print("   echo \"test\" | gpg --clearsign")
    print("\n6. Try the commit again:")
    print("   git commit -m \"your commit message\")
    print("\nFor persistent setup, add 'export GPG_TTY=$(tty)' to your shell profile")
    print("(.zshrc, .bashrc, etc.) to avoid future issues.")
    print("\nEnsure your GPG key is available in your keyring:")
    print(f"   gpg --list-secret-keys {fingerprint}")

if __name__ == "__main__":
    main()

