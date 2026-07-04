from pathlib import Path
from collections import Counter

from PIL import Image
from tqdm import tqdm

# ==========================================================
# Configuration
# ==========================================================

DATASET_PATH = (
    Path(__file__).resolve().parent.parent
    / "datasets"
    / "raw"
    / "asl_alphabet"
)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# ==========================================================
# Statistics
# ==========================================================

total_images = 0
corrupt_images = []
image_sizes = Counter()

print("=" * 60)
print("CAPPY DATASET INSPECTION")
print("=" * 60)

# ==========================================================
# Inspect Train/Test Splits
# ==========================================================

for split_name in ["train", "test"]:

    split_dir = DATASET_PATH / split_name

    if not split_dir.exists():
        print(f"\nWarning: '{split_name}' folder not found.")
        continue

    print(f"\nDataset Split : {split_name}")
    print("-" * 60)

    split_total = 0
    class_counts = Counter()

    class_directories = sorted(
        [folder for folder in split_dir.iterdir() if folder.is_dir()]
    )

    for class_dir in class_directories:

        image_files = [
            image_path
            for image_path in class_dir.iterdir()
            if image_path.suffix.lower() in VALID_EXTENSIONS
        ]

        image_count = 0

        for image_path in tqdm(
            image_files,
            desc=f"{split_name}/{class_dir.name}",
            unit="img",
            leave=False,
        ):

            try:
                with Image.open(image_path) as img:
                    img.verify()

                with Image.open(image_path) as img:
                    image_sizes[img.size] += 1

                image_count += 1
                split_total += 1
                total_images += 1

            except Exception:
                corrupt_images.append(str(image_path))

        class_counts[class_dir.name] = image_count

    print(f"\nClasses Found : {len(class_counts)}")
    print(f"Images        : {split_total}")

    print("\nImages Per Class")
    print("-" * 30)

    for label, count in class_counts.items():
        print(f"{label:<12} {count}")

# ==========================================================
# Overall Summary
# ==========================================================

print("\n" + "=" * 60)
print("OVERALL SUMMARY")
print("=" * 60)

print(f"Total Images   : {total_images}")
print(f"Corrupt Images : {len(corrupt_images)}")

print("\nMost Common Image Sizes")
print("-" * 30)

for size, count in image_sizes.most_common(10):
    print(f"{size} : {count}")

if corrupt_images:
    print("\nFirst 10 Corrupt Images")
    print("-" * 30)

    for image in corrupt_images[:10]:
        print(image)

print("\nInspection Complete.")
print("=" * 60)