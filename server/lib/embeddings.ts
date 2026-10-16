import { db } from '../db/client';

const VECTOR_DIM = 128;

// Deterministic semantic embedding generator with vocabulary & n-gram projection
export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = text.toLowerCase().trim();
  const tokens = normalized.match(/\w+/g) || [];

  // Generate 128-dimensional dense vector
  const vector = new Array(VECTOR_DIM).fill(0);

  // Bag-of-characters and token semantic hashing
  tokens.forEach((token, index) => {
    // Hash whole token
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % VECTOR_DIM;
    vector[bucket] += 1.0 / (index + 1);

    // Hash bi-grams for substring / typo tolerance
    for (let i = 0; i < token.length - 1; i++) {
      const biHash = (token.charCodeAt(i) * 31 + token.charCodeAt(i + 1)) % VECTOR_DIM;
      vector[biHash] += 0.5;
    }
  });

  // Normalize vector to unit length (L2 norm) for fast Cosine Similarity
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

// Cosine Similarity between two unit vectors (Dot Product)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// Vector RAG Search against PostgreSQL product_embeddings table
export async function searchVectorDatabase(params: {
  query: string;
  category?: string;
  maxPrice?: number;
  limit?: number;
}) {
  const { query, category, maxPrice, limit = 4 } = params;
  const queryEmbedding = await generateEmbedding(query);

  const storedEmbeddings = await db.productEmbedding.findMany({
    include: {
      product: true,
    },
  });

  const scored = storedEmbeddings
    .map((record) => {
      const similarity = cosineSimilarity(queryEmbedding, record.embedding);
      return {
        product: record.product,
        similarity,
      };
    })
    .filter((item) => {
      if (category && category !== 'All') {
        if (item.product.categoryName.toLowerCase() !== category.toLowerCase()) return false;
      }
      if (maxPrice && item.product.price > maxPrice) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, limit).map((s) => s.product);
}
