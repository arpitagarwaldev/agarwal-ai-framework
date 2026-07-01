/**
 * @agarwal-ai/knowledge
 * Knowledge Management — RAG pipeline, vector store abstraction, chunking, embedding, semantic search
 */

import { generateId } from "@agarwal-ai/core";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  source?: string;
  createdAt: number;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  distance: number;
}

export interface ChunkingConfig {
  strategy: "fixed" | "sentence" | "paragraph" | "semantic" | "recursive";
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export type EmbeddingFunction = (texts: string[]) => Promise<number[][]>;

export interface VectorStoreConfig {
  dimensions: number;
  metric: "cosine" | "euclidean" | "dot";
}

export interface RAGConfig {
  topK: number;
  scoreThreshold?: number;
  includeMetadata?: boolean;
  reranker?: (results: SearchResult[], query: string) => SearchResult[];
}

// ─── Text Chunker ────────────────────────────────────────────────────────────

export class TextChunker {
  private config: ChunkingConfig;

  constructor(config?: Partial<ChunkingConfig>) {
    this.config = {
      strategy: config?.strategy || "recursive",
      chunkSize: config?.chunkSize || 1000,
      chunkOverlap: config?.chunkOverlap || 200,
      separators: config?.separators || ["\n\n", "\n", ". ", " "],
    };
  }

  /** Chunk a document into pieces */
  chunk(document: Document): Chunk[] {
    switch (this.config.strategy) {
      case "fixed": return this.fixedChunk(document);
      case "sentence": return this.sentenceChunk(document);
      case "paragraph": return this.paragraphChunk(document);
      case "recursive": return this.recursiveChunk(document);
      default: return this.recursiveChunk(document);
    }
  }

  private fixedChunk(doc: Document): Chunk[] {
    const chunks: Chunk[] = [];
    const { chunkSize, chunkOverlap } = this.config;
    let start = 0;
    let index = 0;

    while (start < doc.content.length) {
      const end = Math.min(start + chunkSize, doc.content.length);
      chunks.push({
        id: generateId("chunk"),
        documentId: doc.id,
        content: doc.content.slice(start, end),
        index: index++,
        metadata: { ...doc.metadata, chunkStrategy: "fixed" },
      });
      start += chunkSize - chunkOverlap;
    }
    return chunks;
  }

  private sentenceChunk(doc: Document): Chunk[] {
    const sentences = doc.content.match(/[^.!?]+[.!?]+/g) || [doc.content];
    return this.mergeToChunks(sentences, doc);
  }

  private paragraphChunk(doc: Document): Chunk[] {
    const paragraphs = doc.content.split(/\n\n+/).filter(p => p.trim());
    return this.mergeToChunks(paragraphs, doc);
  }

  private recursiveChunk(doc: Document): Chunk[] {
    const separators = this.config.separators || ["\n\n", "\n", ". ", " "];
    const pieces = this.recursiveSplit(doc.content, separators, this.config.chunkSize);
    return this.mergeToChunks(pieces, doc);
  }

  private recursiveSplit(text: string, separators: string[], maxSize: number): string[] {
    if (text.length <= maxSize) return [text];
    const sep = separators.find(s => text.includes(s)) || separators[separators.length - 1];
    const parts = text.split(sep).filter(p => p.trim());
    const results: string[] = [];

    for (const part of parts) {
      if (part.length <= maxSize) {
        results.push(part);
      } else {
        const remaining = separators.slice(separators.indexOf(sep) + 1);
        results.push(...this.recursiveSplit(part, remaining.length > 0 ? remaining : [" "], maxSize));
      }
    }
    return results;
  }

  private mergeToChunks(pieces: string[], doc: Document): Chunk[] {
    const chunks: Chunk[] = [];
    let current = "";
    let index = 0;

    for (const piece of pieces) {
      if (current.length + piece.length > this.config.chunkSize && current.length > 0) {
        chunks.push({
          id: generateId("chunk"),
          documentId: doc.id,
          content: current.trim(),
          index: index++,
          metadata: { ...doc.metadata, chunkStrategy: this.config.strategy },
        });
        // Keep overlap
        const words = current.split(" ");
        const overlapWords = Math.floor(this.config.chunkOverlap / 5); // approx words
        current = words.slice(-overlapWords).join(" ") + " " + piece;
      } else {
        current += (current ? " " : "") + piece;
      }
    }

    if (current.trim()) {
      chunks.push({
        id: generateId("chunk"),
        documentId: doc.id,
        content: current.trim(),
        index: index++,
        metadata: { ...doc.metadata, chunkStrategy: this.config.strategy },
      });
    }

    return chunks;
  }
}

// ─── In-Memory Vector Store ──────────────────────────────────────────────────

export class VectorStore {
  private config: VectorStoreConfig;
  private entries: Array<{ chunk: Chunk; embedding: number[] }> = [];

  constructor(config?: Partial<VectorStoreConfig>) {
    this.config = { dimensions: config?.dimensions || 1536, metric: config?.metric || "cosine" };
  }

  /** Add chunks with embeddings */
  async add(chunks: Chunk[], embeddings: number[][]): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i];
      this.entries.push({ chunk: chunks[i], embedding: embeddings[i] });
    }
  }

  /** Search by embedding vector */
  search(queryEmbedding: number[], topK = 5, threshold?: number): SearchResult[] {
    const scored = this.entries.map(entry => {
      const distance = this.computeDistance(queryEmbedding, entry.embedding);
      const score = this.config.metric === "cosine" ? 1 - distance : 1 / (1 + distance);
      return { chunk: entry.chunk, score, distance };
    });

    scored.sort((a, b) => b.score - a.score);

    let results = scored.slice(0, topK);
    if (threshold !== undefined) {
      results = results.filter(r => r.score >= threshold);
    }

    return results;
  }

  /** Delete chunks by document ID */
  delete(documentId: string): number {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => e.chunk.documentId !== documentId);
    return before - this.entries.length;
  }

  /** Get store stats */
  get stats(): { totalChunks: number; totalDocuments: number } {
    const docIds = new Set(this.entries.map(e => e.chunk.documentId));
    return { totalChunks: this.entries.length, totalDocuments: docIds.size };
  }

  private computeDistance(a: number[], b: number[]): number {
    switch (this.config.metric) {
      case "cosine": return this.cosineDistance(a, b);
      case "euclidean": return this.euclideanDistance(a, b);
      case "dot": return -this.dotProduct(a, b);
    }
  }

  private cosineDistance(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 1 : 1 - dot / denom;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
    return Math.sqrt(sum);
  }

  private dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
  }
}

// ─── RAG Pipeline ────────────────────────────────────────────────────────────

export class RAGPipeline {
  private chunker: TextChunker;
  private store: VectorStore;
  private embedFn: EmbeddingFunction;
  private config: RAGConfig;

  constructor(
    embedFn: EmbeddingFunction,
    config?: Partial<RAGConfig>,
    chunkingConfig?: Partial<ChunkingConfig>,
    storeConfig?: Partial<VectorStoreConfig>
  ) {
    this.embedFn = embedFn;
    this.config = { topK: config?.topK || 5, scoreThreshold: config?.scoreThreshold, reranker: config?.reranker };
    this.chunker = new TextChunker(chunkingConfig);
    this.store = new VectorStore(storeConfig);
  }

  /** Ingest a document into the knowledge base */
  async ingest(content: string, metadata?: Record<string, unknown>, source?: string): Promise<{ documentId: string; chunks: number }> {
    const doc: Document = { id: generateId("doc"), content, metadata: metadata || {}, source, createdAt: Date.now() };
    const chunks = this.chunker.chunk(doc);
    const embeddings = await this.embedFn(chunks.map(c => c.content));
    await this.store.add(chunks, embeddings);
    return { documentId: doc.id, chunks: chunks.length };
  }

  /** Ingest multiple documents */
  async ingestBatch(documents: Array<{ content: string; metadata?: Record<string, unknown>; source?: string }>): Promise<{ total: number; chunks: number }> {
    let totalChunks = 0;
    for (const d of documents) {
      const result = await this.ingest(d.content, d.metadata, d.source);
      totalChunks += result.chunks;
    }
    return { total: documents.length, chunks: totalChunks };
  }

  /** Retrieve relevant context for a query */
  async retrieve(query: string): Promise<SearchResult[]> {
    const [queryEmbedding] = await this.embedFn([query]);
    let results = this.store.search(queryEmbedding, this.config.topK, this.config.scoreThreshold);

    if (this.config.reranker) {
      results = this.config.reranker(results, query);
    }

    return results;
  }

  /** Full RAG: retrieve context + format for LLM */
  async getContext(query: string): Promise<string> {
    const results = await this.retrieve(query);
    if (results.length === 0) return "No relevant context found.";

    return results
      .map((r, i) => `[Source ${i + 1}] (relevance: ${(r.score * 100).toFixed(0)}%)\n${r.chunk.content}`)
      .join("\n\n---\n\n");
  }

  /** Delete a document from the knowledge base */
  delete(documentId: string): number {
    return this.store.delete(documentId);
  }

  /** Get pipeline stats */
  get stats() { return this.store.stats; }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createChunker(config?: Partial<ChunkingConfig>): TextChunker { return new TextChunker(config); }
export function createVectorStore(config?: Partial<VectorStoreConfig>): VectorStore { return new VectorStore(config); }
export function createRAG(embedFn: EmbeddingFunction, config?: Partial<RAGConfig>): RAGPipeline { return new RAGPipeline(embedFn, config); }

/** Create a document object */
export function createDocument(content: string, metadata?: Record<string, unknown>, source?: string): Document {
  return { id: generateId("doc"), content, metadata: metadata || {}, source, createdAt: Date.now() };
}
