import numpy as np

def generate_local_embedding(text: str, dimension: int = 384) -> list[float]:
    if not text or not text.strip():
        return [0.0] * dimension

    # Deterministic local hash-vectorizer for offline environment
    words = text.lower().split()
    vec = np.zeros(dimension, dtype=np.float32)

    for word in words:
        # Hashing trick to map words to dimension slots
        idx = hash(word) % dimension
        vec[idx] += 1.0

    # L2 Normalization
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm

    return vec.tolist()

def calculate_cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    a = np.array(vec1, dtype=np.float32)
    b = np.array(vec2, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    dot = np.dot(a, b)
    similarity = float(dot / (norm_a * norm_b))
    return max(0.0, min(1.0, similarity))
