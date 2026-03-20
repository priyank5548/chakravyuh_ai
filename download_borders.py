#!/usr/bin/env python3
"""
Download high-resolution Natural Earth geographical data for perfect country borders.
Uses 1:10m Natural Earth dataset instead of 1:50m for much better border detail.
"""

import urllib.request
import json
import os
from pathlib import Path

# Create maps directory if it doesn't exist
maps_dir = Path('public/maps')
maps_dir.mkdir(parents=True, exist_ok=True)

# URL for high-resolution (1:10m) Natural Earth country borders
# This has MUCH more detail than the 1:50m version
url = "https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip"

# Alternative direct GeoJSON URL (no zip, pure JSON)
geojson_url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"

print("🌍 Downloading high-resolution world borders...")
print(f"Source: Natural Earth 1:10m (much more detailed than 1:50m)")

try:
    # Try direct GeoJSON first
    filepath = maps_dir / 'ne_10m_admin_0_countries.json'
    print(f"Downloading from: {geojson_url}")
    
    urllib.request.urlretrieve(geojson_url, filepath)
    
    # Verify the file was downloaded
    if filepath.exists():
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        feature_count = len(data.get('features', []))
        print(f"✅ Success! Downloaded {feature_count} countries with detailed borders")
        print(f"📁 Saved to: {filepath}")
        print(f"📊 File size: {filepath.stat().st_size / 1024 / 1024:.2f} MB")
        print("\n✨ Next steps:")
        print("1. Update App.jsx to use 'ne_10m_admin_0_countries.json' instead of 'ne_50m_admin_0_countries.json'")
        print("2. Refresh your browser to see perfect borders worldwide!")
    else:
        print("❌ Download failed")
        
except Exception as e:
    print(f"❌ Error downloading: {e}")
    print("\nManual fallback:")
    print("Visit: https://naciscdn.org/naturalearth/10m/cultural/")
    print("Download: ne_10m_admin_0_countries.zip")
    print("Extract and place ne_10m_admin_0_countries.geojson in public/maps/")
