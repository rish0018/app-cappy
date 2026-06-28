import shutil
from pathlib import Path

import kagglehub

print("Downloading ASL Alphabet dataset...")

# Download dataset (cached by kagglehub)
download_path = Path(kagglehub.dataset_download("grassknoted/asl-alphabet"))

# Destination inside your project
project_root = Path(__file__).resolve().parent.parent
destination = project_root / "datasets" / "raw" / "asl_alphabet"

# Remove existing dataset if it exists
if destination.exists():
    print("Existing dataset found. Removing...")
    shutil.rmtree(destination)

print("Copying dataset into project...")
shutil.copytree(download_path, destination)

print("\nDataset setup complete!")
print(f"Location: {destination}")