# HACKConnect

## Project Setup

This project is now configured for safe sharing and different environments without file corruption.

### What was fixed:
1. ✅ Removed duplicate `HackConect - Copy` folder
2. ✅ Added `.gitignore` to prevent unwanted files from being committed
3. ✅ Added `.editorconfig` for consistent formatting across editors
4. ✅ Fixed git line-ending configuration to prevent CRLF/LF issues

## How to Use

### Clone the Repository
```bash
git clone https://github.com/Mrunalini-patil/HACKConnect.git
cd HACKConnect
```

### On Windows
The project is now configured to work properly on Windows without line-ending issues.

### On macOS/Linux
The `.editorconfig` file ensures consistent formatting across all platforms.

## Sharing the Project

### Safe Ways to Share:

**Option 1: Git Push (Recommended)**
```bash
git push origin main
```

**Option 2: As a ZIP file**
```bash
# The .gitignore file prevents corruption:
# - No node_modules folder
# - No .vscode settings
# - No OS-specific files
# - No temporary files
zip -r HACKConnect.zip . -x ".git/*" "node_modules/*" ".vscode/*"
```

**Option 3: Create a Release**
Push to GitHub and create a release - it will automatically archive properly.

## File Structure
```
HACKConnect/
├── .gitignore           # Prevents bad files from being tracked
├── .editorconfig        # Ensures consistent formatting
├── index.html           # Main page
├── login.html
├── signup.html
├── dashboard.html
├── profile.html
├── js/                  # JavaScript files
│   ├── auth.js
│   ├── main.js
│   └── utils.js
├── css/                 # Stylesheets
│   ├── main.css
│   ├── layout.css
│   ├── components.css
│   └── pages/           # Page-specific styles
└── main/                # Alternative page set
```

## Important Notes

**Do NOT:**
- Add `node_modules/` folder to git
- Add IDE folders like `.vscode/` or `.idea/`
- Use "Save As" with `- Copy` suffixes for versioning (use git branches instead)
- Commit sensitive data in `.env` files

**DO:**
- Use git branches for different features: `git checkout -b feature-name`
- Commit frequently with clear messages
- Pull before pushing: `git pull origin main`
- Review `.gitignore` before committing new file types

## For Contributors

If you're adding new file types:
1. Check the `.gitignore` and `.editorconfig` files
2. Add rules for new file types if needed
3. Commit the config changes separately from feature changes

---
**Project is now safe to share and will not get corrupted across different environments!**
