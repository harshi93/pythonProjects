#!/usr/bin/env python3

import os
import getpass
import subprocess
import argparse
import sys
import tempfile

def parse_arguments():
    parser = argparse.ArgumentParser(description='Generate a GPG key for GitHub commit signing')
    parser.add_argument('--name', help='Your full name')
    parser.add_argument('--email', help='Your GitHub email address')
    parser.add_argument('--comment', default='GitHub GPG Key', help='Optional comment for the key')
    parser.add_argument('--key-type', default='RSA', help='Key type (default: RSA)')
    parser.add_argument('--key-length', type=int, default=4096, help='Key length in bits (default: 4096)')
    parser.add_argument('--no-expire', action='store_true', help='Set the key to never expire')
    return parser.parse_args()

def main():
    # Parse command line arguments
    args = parse_arguments()
    
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
    
    # Configure Git to use the new key
    print("\nTo configure Git to use this key, run these commands:")
    print(f"git config --global user.signingkey {fingerprint}")
    print("git config --global commit.gpgsign true")
    
    print("\nDone! You can now make signed commits to GitHub.")
    
    print("\nTroubleshooting GPG Signing Issues:")
    print("=====================================")
    print("If you encounter 'error: gpg failed to sign the data' when committing, try:")
    print("\n1. Restart the GPG agent:")
    print("   gpgconf --kill gpg-agent")
    print("\n2. Set the GPG_TTY environment variable:")
    print("   export GPG_TTY=$(tty)")
    print("\n3. Start a new GPG agent daemon:")
    print("   gpg-agent --daemon")
    print("\n4. Try the commit again:")
    print("   git commit -m \"your commit message\"")
    print("\nFor persistent setup, add 'export GPG_TTY=$(tty)' to your shell profile")
    print("(.zshrc, .bashrc, etc.) to avoid future issues.")

if __name__ == "__main__":
    main()

