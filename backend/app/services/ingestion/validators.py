import os
import uuid
import hashlib
from fastapi import HTTPException

ALLOWED_EXTENSIONS = {".pdf", ".csv", ".txt", ".docx"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 # 50 MB limit

def validate_uploaded_file(filename: str, file_size: int):
    # 1. Filename presence
    if not filename or not filename.strip():
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    # 2. Path traversal defense
    safe_basename = os.path.basename(filename)
    if safe_basename != filename and ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename or path traversal detected")

    # 3. File extension check
    ext = os.path.splitext(safe_basename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # 4. File size check
    if file_size <= 0:
        raise HTTPException(status_code=400, detail="File is empty (0 bytes)")
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum limit of 50 MB")

    return safe_basename, ext

def generate_safe_storage_path(storage_dir: str, original_filename: str) -> tuple[str, str]:
    safe_name = os.path.basename(original_filename)
    ext = os.path.splitext(safe_name)[1].lower()
    storage_uuid = str(uuid.uuid4())
    safe_filename = f"{storage_uuid}{ext}"
    target_path = os.path.join(storage_dir, safe_filename)
    return target_path, storage_uuid

def calculate_sha256(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
