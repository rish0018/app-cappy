from pathlib import Path
from collections import Counter
from PIL import Image

DATASET_PATH = Path(__file__).resolve().parent.parent / "datasets" / "raw" / "asl_alphabet"

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png"}

total_images = 0
corrupt_images = []
class_counts = Counter()
image_sizes = Counter()

print("=" * 60)
print("CAPPY DATASET INSPECTION")
print("=" * 60)

for class_dir in sorted(DATASET_PATH.iterdir()):
    if not class_dir.is_dir():
        continue

    image_count = 0

    for image_path in class_dir.iterdir():
        if image_path.suffix.lower() not in VALID_EXTENSIONS:
            continue

        try:
            with Image.open(image_path) as img:
                img.verify()

            with Image.open(image_path) as img:
                image_sizes[img.size] += 1

            image_count += 1
            total_images += 1

        except Exception:
            corrupt_images.append(str(image_path))

    class_counts[class_dir.name] = image_count

print(f"\nDataset Location : {DATASET_PATH}")
print(f"Classes Found    : {len(class_counts)}")
print(f"Total Images     : {total_images}")

print("\nImages Per Class")
print("-" * 30)

for label, count in class_counts.items():
    print(f"{label:<10} {count}")

print("\nMost Common Image Sizes")
print("-" * 30)

for size, count in image_sizes.most_common(10):
    print(f"{size} -> {count}")

print(f"\nCorrupt Images : {len(corrupt_images)}")

if corrupt_images:
    print("\nFirst 10 corrupt files:")
    for image in corrupt_images[:10]:
        print(image)

print("\nInspection Complete.")
print("=" * 60)