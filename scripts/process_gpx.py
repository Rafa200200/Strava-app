"""
import gpxpy
import gpxpy.gpx
import json
import os
import sys
from datetime import timedelta

def process_gpx_files(gpx_directory):
    all_data = []
    try:
        for filename in os.listdir(gpx_directory):
            if filename.endswith(".gpx"):
                file_path = os.path.join(gpx_directory, filename)
                print(f"Processing file: {file_path}")
                with open(file_path, 'r') as gpx_file:
                    gpx_content = gpx_file.read()
                    print(f"GPX content: {gpx_content}")
                    gpx = gpxpy.parse(gpx_content)
                    for track in gpx.tracks:
                        for segment in track.segments:
                            last_point_time = None
                            for point in segment.points:
                                if last_point_time is None or (point.time - last_point_time) >= timedelta(minutes=5):
                                    all_data.append({
                                        'latitude': point.latitude,
                                        'longitude': point.longitude,
                                        'time': point.time.isoformat()
                                    })
                                    last_point_time = point.time
                print(f"Extracted {len(all_data)} points from {file_path}")
    except Exception as e:
        print(f"Error processing GPX files: {str(e)}", file=sys.stderr)
        sys.exit(1)

    return all_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_gpx.py <gpx_directory>", file=sys.stderr)
        sys.exit(1)

    gpx_directory = sys.argv[1]
    data = process_gpx_files(gpx_directory)
    print(json.dumps(data))
"""