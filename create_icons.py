#!/usr/bin/env python3
"""
Simple icon generator for Kalshi Twitter Extension
Creates placeholder icons with a "K" on Twitter blue background
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create a square icon with specified size"""
    
    # Create image with Twitter blue background (#1DA1F2)
    # Convert hex to RGB: (29, 161, 242)
    img = Image.new('RGB', (size, size), color=(29, 161, 242))
    draw = ImageDraw.Draw(img)
    
    # Add white "K" letter
    text = "K"
    font_size = int(size * 0.6)
    
    # Try to use a nice font, fall back to default if not available
    try:
        # Try common font paths (works on Mac/Linux/Windows)
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",  # Mac
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
            "C:\\Windows\\Fonts\\Arial.ttf",  # Windows
        ]
        
        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, font_size)
                break
        
        if font is None:
            # If no font found, use default
            font = ImageFont.load_default()
    except Exception as e:
        print(f"Note: Using default font ({e})")
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    # Get bounding box of the text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw the text in white
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the icon
    filename = f'icons/icon{size}.png'
    img.save(filename)
    print(f"✓ Created {filename}")

def main():
    """Main function to create all icons"""
    
    print("Creating icons for Kalshi Twitter Extension...")
    print("-" * 50)
    
    # Create icons directory if it doesn't exist
    if not os.path.exists('icons'):
        os.makedirs('icons')
        print("✓ Created icons/ directory")
    
    # Generate icons in required sizes
    sizes = [16, 48, 128]
    for size in sizes:
        create_icon(size)
    
    print("-" * 50)
    print("✓ All icons created successfully!")
    print("\nIcons are located in the icons/ directory:")
    print("  - icons/icon16.png")
    print("  - icons/icon48.png")
    print("  - icons/icon128.png")

if __name__ == "__main__":
    main()