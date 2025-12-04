import os
from PIL import Image
import glob

# Configuration
SOURCE_DIR = 'public/image_original'
TARGET_DIR = 'public/image'
RESIZE_FACTOR = 0.25  # Resize to 25%
QUALITY = 60          # JPEG quality (if converting) or optimization level

def optimize_images():
    # Ensure target directory exists
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    # Get all PNG images from source
    files = glob.glob(os.path.join(SOURCE_DIR, '*.png'))
    
    print(f"Found {len(files)} images to process.")

    for file_path in files:
        try:
            filename = os.path.basename(file_path)
            target_path = os.path.join(TARGET_DIR, filename)
            
            with Image.open(file_path) as img:
                # Calculate new size
                new_width = int(img.width * RESIZE_FACTOR)
                new_height = int(img.height * RESIZE_FACTOR)
                
                # Resize
                # NEAREST to keep pixelated look if desired, or LANCZOS for quality
                # Since user wants speed and "low quality is fine", and the UI scales it up with pixelated rendering,
                # NEAREST might actually be better to preserve the "retro" feel when scaled up, 
                # but LANCZOS is safer for general downscaling. 
                # Let's use LANCZOS to avoid aliasing artifacts at small sizes, 
                # the CSS 'image-rendering: pixelated' will handle the upscaling look.
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Save optimized
                # Optimize=True for PNG
                resized_img.save(target_path, 'PNG', optimize=True)
                
                original_size = os.path.getsize(file_path)
                new_size = os.path.getsize(target_path)
                print(f"Processed {filename}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({new_size/original_size*100:.1f}%)")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    optimize_images()
