import zipfile
import os

zip_filename = "submission.zip"

files_to_zip = [
    ("Technical-Design-Document.pdf", "Technical-Design-Document.pdf"),
    ("deployment.md", "deployment.md")
]

with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zf:
    for src_path, arc_name in files_to_zip:
        if os.path.exists(src_path):
            zf.write(src_path, arc_name)
            print(f"Added {src_path} as {arc_name}")
        else:
            print(f"Warning: {src_path} not found")

size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"Created {zip_filename} ({size_mb:.2f} MB)")
