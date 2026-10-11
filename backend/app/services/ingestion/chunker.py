from typing import List, Dict, Any

CHUNK_SIZE_DEFAULT = 800
CHUNK_OVERLAP_DEFAULT = 100

def generate_document_chunks(
    text: str,
    page_number: int = 1,
    content_id: str = None,
    chunk_size: int = CHUNK_SIZE_DEFAULT,
    chunk_overlap: int = CHUNK_OVERLAP_DEFAULT
) -> List[Dict[str, Any]]:
    if not text or not text.strip():
        return []

    words = text.split()
    chunks = []
    start_idx = 0
    total_words = len(words)
    chunk_index = 0

    # Approximate ~5 characters per word for character-based window
    words_per_chunk = max(10, chunk_size // 5)
    words_overlap = max(2, chunk_overlap // 5)

    while start_idx < total_words:
        end_idx = min(start_idx + words_per_chunk, total_words)
        chunk_words = words[start_idx:end_idx]
        chunk_text = " ".join(chunk_words)

        chunks.append({
            "chunk_index": chunk_index,
            "content_id": content_id,
            "text": chunk_text,
            "page_number": page_number,
            "token_count": len(chunk_words),
            "char_count": len(chunk_text)
        })

        chunk_index += 1
        if end_idx >= total_words:
            break
        start_idx += (words_per_chunk - words_overlap)

    return chunks
