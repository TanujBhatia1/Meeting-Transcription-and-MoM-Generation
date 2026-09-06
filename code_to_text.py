from pathlib import Path

# ==============================
# Configuration
# ==============================

PROJECT_ROOT = Path(
    r"D:\MoM_Generation\Meeting-Transcription-and-MoM-Generation\backend"
)

OUTPUT_FILE = PROJECT_ROOT.parent / "Backend_Codebase.txt"

INCLUDE_EXTENSIONS = {
    ".py",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".cfg",
    ".conf",
    ".env",
    ".sql",
    ".md",
    ".txt",
    ".html",
    ".css",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".sh",
    ".ps1",
}

SPECIAL_FILES = {
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
}

EXCLUDE_DIRS = {
    "__pycache__",
    ".git",
    ".venv",
    "venv",
    "env",
    ".idea",
    ".vscode",
    "node_modules",
    "build",
    "dist",
    ".pytest_cache",
    ".mypy_cache",
    ".tox",
    ".cache",
    "logs",
}

# ==============================
# Export
# ==============================

with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:

    for file in sorted(PROJECT_ROOT.rglob("*")):

        if not file.is_file():
            continue

        # Skip excluded directories
        if any(part in EXCLUDE_DIRS for part in file.parts):
            continue

        # Include only required files
        if (
            file.suffix.lower() not in INCLUDE_EXTENSIONS
            and file.name not in SPECIAL_FILES
        ):
            continue

        relative_path = file.relative_to(PROJECT_ROOT)

        separator = "=" * 120

        outfile.write("\n")
        outfile.write(separator + "\n")
        outfile.write(f"FILE: backend/{relative_path.as_posix()}\n")
        outfile.write(separator + "\n\n")

        try:
            with open(file, "r", encoding="utf-8") as f:
                outfile.write(f.read())
        except UnicodeDecodeError:
            outfile.write("[Binary or unsupported encoding]\n")
        except Exception as e:
            outfile.write(f"[Error reading file: {e}]\n")

        outfile.write("\n\n")

print("=" * 60)
print("Backend exported successfully!")
print(f"Output: {OUTPUT_FILE}")
print("=" * 60)