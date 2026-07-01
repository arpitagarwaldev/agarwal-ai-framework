"""Knowledge module — RAG pipeline, chunking, vector store, semantic search."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Callable, Optional

from .core import generate_id


@dataclass
class Document:
    id: str
    content: str
    metadata: dict = field(default_factory=dict)
    source: Optional[str] = None


@dataclass
class Chunk:
    id: str
    document_id: str
    content: str
    index: int
    metadata: dict = field(default_factory=dict)
    embedding: Optional[list[float]] = None


@dataclass
class SearchResult:
    chunk: Chunk
    score: float
    distance: float


EmbeddingFunction = Callable[[list[str]], list[list[float]]]


class TextChunker:
    """Split documents into chunks using various strategies."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200, strategy: str = "recursive"):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.strategy = strategy

    def chunk(self, doc: Document) -> list[Chunk]:
        if self.strategy == "paragraph":
            pieces = [p.strip() for p in doc.content.split("\n\n") if p.strip()]
        elif self.strategy == "sentence":
            import re
            pieces = re.findall(r"[^.!?]+[.!?]+", doc.content) or [doc.content]
        else:  # recursive / fixed
            pieces = self._recursive_split(doc.content)

        return self._merge_pieces(pieces, doc)

    def _recursive_split(self, text: str) -> list[str]:
        if len(text) <= self.chunk_size:
            return [text]
        separators = ["\n\n", "\n", ". ", " "]
        for sep in separators:
            if sep in text:
                parts = [p for p in text.split(sep) if p.strip()]
                result = []
                for part in parts:
                    if len(part) <= self.chunk_size:
                        result.append(part)
                    else:
                        result.extend(self._recursive_split(part))
                return result
        # Fallback: hard split
        return [text[i:i + self.chunk_size] for i in range(0, len(text), self.chunk_size - self.chunk_overlap)]

    def _merge_pieces(self, pieces: list[str], doc: Document) -> list[Chunk]:
        chunks = []
        current = ""
        idx = 0
        for piece in pieces:
            if len(current) + len(piece) > self.chunk_size and current:
                chunks.append(Chunk(id=generate_id("chunk"), document_id=doc.id, content=current.strip(), index=idx, metadata=doc.metadata))
                idx += 1
                words = current.split()
                overlap_words = max(1, self.chunk_overlap // 5)
                current = " ".join(words[-overlap_words:]) + " " + piece
            else:
                current += (" " if current else "") + piece
        if current.strip():
            chunks.append(Chunk(id=generate_id("chunk"), document_id=doc.id, content=current.strip(), index=idx, metadata=doc.metadata))
        return chunks


class VectorStore:
    """In-memory vector store with cosine/euclidean/dot similarity."""

    def __init__(self, metric: str = "cosine"):
        self.metric = metric
        self._entries: list[tuple[Chunk, list[float]]] = []

    def add(self, chunks: list[Chunk], embeddings: list[list[float]]):
        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb
            self._entries.append((chunk, emb))

    def search(self, query_embedding: list[float], top_k: int = 5, threshold: Optional[float] = None) -> list[SearchResult]:
        scored = []
        for chunk, emb in self._entries:
            dist = self._distance(query_embedding, emb)
            score = 1 - dist if self.metric == "cosine" else 1 / (1 + dist)
            scored.append(SearchResult(chunk=chunk, score=score, distance=dist))
        scored.sort(key=lambda x: x.score, reverse=True)
        results = scored[:top_k]
        if threshold is not None:
            results = [r for r in results if r.score >= threshold]
        return results

    def delete(self, document_id: str) -> int:
        before = len(self._entries)
        self._entries = [(c, e) for c, e in self._entries if c.document_id != document_id]
        return before - len(self._entries)

    @property
    def size(self) -> int: return len(self._entries)

    def _distance(self, a: list[float], b: list[float]) -> float:
        if self.metric == "cosine":
            dot = sum(x * y for x, y in zip(a, b))
            norm_a = math.sqrt(sum(x * x for x in a))
            norm_b = math.sqrt(sum(x * x for x in b))
            return 1 - dot / (norm_a * norm_b) if norm_a * norm_b > 0 else 1
        elif self.metric == "euclidean":
            return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))
        else:  # dot
            return -sum(x * y for x, y in zip(a, b))


class RAGPipeline:
    """Complete RAG pipeline: ingest → chunk → embed → store → retrieve."""

    def __init__(self, embed_fn: EmbeddingFunction, chunk_size: int = 1000, top_k: int = 5, metric: str = "cosine"):
        self._embed_fn = embed_fn
        self._chunker = TextChunker(chunk_size=chunk_size)
        self._store = VectorStore(metric=metric)
        self._top_k = top_k

    async def ingest(self, content: str, metadata: Optional[dict] = None, source: Optional[str] = None) -> dict:
        """Ingest a document."""
        doc = Document(id=generate_id("doc"), content=content, metadata=metadata or {}, source=source)
        chunks = self._chunker.chunk(doc)
        embeddings = self._embed_fn([c.content for c in chunks])
        self._store.add(chunks, embeddings)
        return {"document_id": doc.id, "chunks": len(chunks)}

    async def retrieve(self, query: str, top_k: Optional[int] = None) -> list[SearchResult]:
        """Retrieve relevant chunks."""
        [query_emb] = self._embed_fn([query])
        return self._store.search(query_emb, top_k=top_k or self._top_k)

    async def get_context(self, query: str) -> str:
        """Get formatted context for LLM."""
        results = await self.retrieve(query)
        if not results:
            return "No relevant context found."
        return "\n\n---\n\n".join(
            f"[Source {i+1}] (relevance: {r.score*100:.0f}%)\n{r.chunk.content}"
            for i, r in enumerate(results)
        )

    def delete(self, document_id: str) -> int:
        return self._store.delete(document_id)

    @property
    def stats(self) -> dict:
        return {"total_chunks": self._store.size}


# ─── Factory ──────────────────────────────────────────────────────────────────

def create_chunker(chunk_size: int = 1000, overlap: int = 200, strategy: str = "recursive") -> TextChunker:
    return TextChunker(chunk_size, overlap, strategy)

def create_vector_store(metric: str = "cosine") -> VectorStore:
    return VectorStore(metric)

def create_rag(embed_fn: EmbeddingFunction, chunk_size: int = 1000, top_k: int = 5) -> RAGPipeline:
    return RAGPipeline(embed_fn, chunk_size, top_k)
