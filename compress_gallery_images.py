"""
Script to compress gallery images to WebP format.
Converts all JPG/JPEG images in Gallery Images folder to compressed webp equivalents.
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'Pillow'])
    from PIL import Image

def convert_to_webp(source_path: Path, quality: int = 80) -> Path:
    """Convert an image to WebP format with compression."""
    # Create output path with .webp extension
    output_path = source_path.with_suffix('.webp')
    
    try:
        with Image.open(source_path) as img:
            # Convert to RGB if necessary (for RGBA or palette images)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Save as WebP with compression
            img.save(output_path, 'WEBP', quality=quality, method=6)
            
            # Get file sizes for comparison
            original_size = source_path.stat().st_size
            new_size = output_path.stat().st_size
            savings = (1 - new_size / original_size) * 100
            
            print(f"✓ {source_path.name} -> {output_path.name}")
            print(f"  Original: {original_size / 1024:.1f}KB, WebP: {new_size / 1024:.1f}KB ({savings:.1f}% smaller)")
            
            return output_path
    except Exception as e:
        print(f"✗ Error converting {source_path.name}: {e}")
        return None

def main():
    # Gallery Images directory
    gallery_dir = Path(__file__).parent / "Gallery Images"
    
    if not gallery_dir.exists():
        print(f"Error: Gallery Images directory not found at {gallery_dir}")
        return
    
    print("=" * 60)
    print("Gallery Image Compression to WebP")
    print("=" * 60)
    
    # Find all jpg/jpeg files
    image_extensions = ('.jpg', '.jpeg', '.JPG', '.JPEG')
    converted_count = 0
    skipped_count = 0
    
    for folder in gallery_dir.iterdir():
        if folder.is_dir():
            print(f"\nProcessing: {folder.name}")
            print("-" * 40)
            
            for image_file in folder.iterdir():
                if image_file.suffix in image_extensions:
                    # Check if webp already exists
                    webp_path = image_file.with_suffix('.webp')
                    if webp_path.exists():
                        print(f"  Skipping {image_file.name} (webp already exists)")
                        skipped_count += 1
                        continue
                    
                    result = convert_to_webp(image_file)
                    if result:
                        converted_count += 1
    
    print("\n" + "=" * 60)
    print(f"Conversion complete! Converted: {converted_count}, Skipped: {skipped_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
