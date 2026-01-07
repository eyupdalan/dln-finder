from bm25_implementation import compute_bm25, get_titles_and_urls, normalize
from collections import defaultdict
import psycopg2
from config import DB_CONFIG
from text_preprocessing import preprocess_text

def compute_hybrid_bm25_pagerank_hits(query, conn, alpha=0.6, beta=0.3, gamma=0.1):
    query_tokens = preprocess_text(query)

    # 1. BM25
    bm25_results = compute_bm25(query_tokens, conn)
    bm25_dict = dict(bm25_results)
    doc_ids = tuple(bm25_dict.keys())

    if not doc_ids:
        return []

    # 2. PageRank skorlarını al
    cursor = conn.cursor()
    cursor.execute(
        f"SELECT doc_id, score FROM pagerank WHERE doc_id IN %s;",
        (doc_ids,)
    )
    pagerank_scores = dict(cursor.fetchall())

    # 3. HITS authority skorlarını al
    cursor.execute(
        f"SELECT doc_id, authority_score FROM hits WHERE doc_id IN %s;",
        (doc_ids,)
    )
    hits_scores = dict(cursor.fetchall())
    cursor.close()

    # 4. Normalize
    bm25_norm = normalize(bm25_dict)
    pagerank_norm = normalize(pagerank_scores)
    hits_norm = normalize(hits_scores)

    # 5. Hibrit skor hesapla
    hybrid_scores = {}
    for doc_id in bm25_dict:
        score = (
            alpha * bm25_norm.get(doc_id, 0) +
            beta * pagerank_norm.get(doc_id, 0) +
            gamma * hits_norm.get(doc_id, 0)
        )
        hybrid_scores[doc_id] = score

    return sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)

if __name__ == "__main__":
    conn = psycopg2.connect(**DB_CONFIG)

    query = "çanakkalede orman yangını"
    results = compute_hybrid_bm25_pagerank_hits(query, conn, 0.1, 0.1, 0.8)
    doc_ids = [doc_id for doc_id, _ in results]

    print("doc_ids length: ", len(doc_ids))
    titles_and_urls = get_titles_and_urls(doc_ids=doc_ids[:10])
    print("titles_and_urls length: ", len(titles_and_urls))

    print("\nArama Sonuçları:")
    for item in titles_and_urls:
        print(item)
