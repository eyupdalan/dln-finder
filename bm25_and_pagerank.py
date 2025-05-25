from text_preprocessing import preprocess_text
from bm25_implementation import compute_bm25, get_titles_and_urls, normalize
from pagerank import get_pagerank_scores
from config import DB_CONFIG
import psycopg2
import numpy as np

def hybrid_search(query, conn, alpha=0.7):
    query_tokens = preprocess_text(query)
    
    bm25_results = compute_bm25(query_tokens, conn)
    bm25_dict = dict(bm25_results)
    
    doc_ids = list(bm25_dict.keys())
    pagerank_scores = get_pagerank_scores(conn, doc_ids)
    
    bm25_norm = normalize(bm25_dict)
    pagerank_norm = normalize(pagerank_scores)
    
    hybrid_scores = {
        doc_id: alpha * bm25_norm.get(doc_id, 0) + (1 - alpha) * pagerank_norm.get(doc_id, 0)
        for doc_id in bm25_dict
    }
    
    top_results = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    return top_results

if __name__ == "__main__":
    conn = psycopg2.connect(**DB_CONFIG)

    query = "çanakkalede orman yangını"
    results = hybrid_search(query, conn)
    doc_ids = [doc_id for doc_id, _ in results]

    print("doc_ids length: ", len(doc_ids))
    titles_and_urls = get_titles_and_urls(doc_ids=doc_ids[:10])
    print("titles_and_urls length: ", len(titles_and_urls))

    print("\nArama Sonuçları:")
    for item in titles_and_urls:
        print(item)
