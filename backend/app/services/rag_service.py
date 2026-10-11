import re
import math
from typing import List, Dict, Any

class LocalRAGService:
    def __init__(self):
        # Lightweight local vector store using TF-IDF / Cosine Similarity / Sentence Transformers embeddings
        try:
            from sentence_transformers import SentenceTransformer
            self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
            self.has_st = True
        except Exception:
            self.embedder = None
            self.has_st = False

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
        """
        Splits text into overlapping chunks and tracks estimated page numbers.
        """
        chunks = []
        # Split text by page markers if available
        page_splits = re.split(r'--- Page (\d+) ---', text)
        
        current_page = 1
        raw_chunks = []

        if len(page_splits) > 1:
            for i in range(1, len(page_splits), 2):
                p_num = int(page_splits[i])
                p_content = page_splits[i+1]
                words = p_content.split()
                for j in range(0, len(words), chunk_size - overlap):
                    chunk_words = words[j:j+chunk_size]
                    if chunk_words:
                        raw_chunks.append({
                            "content": " ".join(chunk_words),
                            "page_number": p_num
                        })
        else:
            words = text.split()
            for j in range(0, max(1, len(words)), max(1, chunk_size - overlap)):
                chunk_words = words[j:j+chunk_size]
                if chunk_words:
                    est_page = (j // 400) + 1
                    raw_chunks.append({
                        "content": " ".join(chunk_words),
                        "page_number": est_page
                    })

        return raw_chunks

    def calculate_similarity(self, query: str, text: str) -> float:
        """
        Calculates match score between query and chunk.
        """
        query_words = set(re.findall(r'\w+', query.lower()))
        text_words = re.findall(r'\w+', text.lower())
        if not query_words or not text_words:
            return 0.0
        
        matches = sum(1 for word in text_words if word in query_words)
        # Score combining keyword frequency and coverage
        coverage = len(query_words.intersection(set(text_words))) / len(query_words)
        return (matches / math.sqrt(len(text_words))) * 0.5 + coverage * 0.5

rag_service = LocalRAGService()
