import geopandas as gpd
import json
import os

# 1️⃣ Point this at your shapefile in data/
shapefile_path = os.path.join('data', 'lfsa000b21a_e.shp')

print(f"⚙️  Loading shapefile from {shapefile_path}…")
gdf = gpd.read_file(shapefile_path)

# 2️⃣ Reproject to WGS84 (lat/lon)
gdf = gdf.to_crs(epsg=4326)

# 3️⃣ Compute centroids
centroids = gdf.geometry.centroid

# 4️⃣ Build a CFSAUID → [lat, lon] map for **all** FSAs
canada_map = {
    row['CFSAUID']: [centroids.iloc[i].y, centroids.iloc[i].x]
    for i, row in gdf.iterrows()
    if isinstance(row.get('CFSAUID'), str)
}

# 5️⃣ Write out the full‐Canada map
out_path = os.path.join('src', 'data', 'postal_centroids_canada.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w') as f:
    json.dump(canada_map, f, indent=2)

print(f"✅  Wrote {len(canada_map)} Canadian FSA centroids to {out_path}")
