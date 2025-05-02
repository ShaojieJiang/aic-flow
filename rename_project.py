"""Rename the project."""

import argparse
import os


def get_underscore_name(name: str) -> str:
    """Convert hyphenated name to underscore name."""
    return name.replace("-", "_")


def rename_directory(old_name: str, new_name: str) -> None:
    """Rename directory from old_name to new_name."""
    if os.path.exists(old_name):
        os.rename(old_name, new_name)
        print(f"Renamed directory {old_name} to {new_name}")


def replace_in_file(file_path: str, old_name: str, new_name: str) -> None:
    """Replace old_name with new_name in file."""
    with open(file_path) as f:
        content = f.read()

    new_content = content.replace(old_name, new_name)

    with open(file_path, "w") as f:
        f.write(new_content)
    print(f"Updated {file_path}")


def main() -> None:
    """Main function."""
    parser = argparse.ArgumentParser(description="Rename the project")
    parser.add_argument("new_name", help="New project name")
    args = parser.parse_args()

    orig_name = args.new_name
    underscore_name = get_underscore_name(orig_name)

    # Rename directory
    rename_directory("uv_template", underscore_name)

    # Update Makefile
    replace_in_file("Makefile", "uv_template", underscore_name)

    # Update pyproject.toml
    replace_in_file("pyproject.toml", "uv_template", underscore_name)
    replace_in_file("pyproject.toml", "uv-template", orig_name)

    print("Project renamed successfully!")
    print(f"Original name: {orig_name}")
    print(f"Underscore name: {underscore_name}")


if __name__ == "__main__":
    main()
