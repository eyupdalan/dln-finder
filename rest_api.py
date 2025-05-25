from bm25_implementation import compute_bm25, normalize
from config import DB_CONFIG
from flask import Flask, request, jsonify
import psycopg2
import numpy as np
from collections import defaultdict

from text_preprocessing import preprocess_text

app = Flask(__name__)

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.route("/are-you-alive", methods=["GET"])
def are_you_alive():
    return jsonify({"message": "I'm alive!"})

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("query")
    alpha = float(request.args.get("alpha", 0.6))
    beta = float(request.args.get("beta", 0.3))
    gamma = float(request.args.get("gamma", 0.1))
    page = int(request.args.get("page", 1))
    per_page = 10

    if not query:
        return jsonify({"error": "Query parametresi gerekli."}), 400

    if not abs((alpha + beta + gamma) - 1.0) < 1e-5:
        return jsonify({"error": "alpha + beta + gamma = 1 olmalıdır."}), 400

    if page < 1:
        return jsonify({"error": "Sayfa numarası 1'den küçük olamaz."}), 400

    conn = get_db_connection()
    query_tokens = preprocess_text(query)
    bm25_results = compute_bm25(query_tokens, conn)
    bm25_dict = dict(bm25_results)
    doc_ids = tuple(bm25_dict.keys())

    if not doc_ids:
        return jsonify([])

    cursor = conn.cursor()

    # 2. PageRank skorlarını al
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

    # Title ve URL (isteğe bağlı)
    cursor.execute(
        f"SELECT id, url, title FROM pages WHERE id IN %s;",
        (doc_ids,)
    )
    doc_meta = {row[0]: {"url": row[1], "title": row[2]} for row in cursor.fetchall()}
    cursor.close()
    conn.close()

    # Normalize
    bm25_norm = normalize(bm25_dict)
    pagerank_norm = normalize(pagerank_scores)
    hits_norm = normalize(hits_scores)

    # Hybrid skor hesapla
    hybrid_results = []
    for doc_id in bm25_dict:
        score = (
            alpha * bm25_norm.get(doc_id, 0) +
            beta * pagerank_norm.get(doc_id, 0) +
            gamma * hits_norm.get(doc_id, 0)
        )
        hybrid_results.append({
            "doc_id": doc_id,
            "score": score,
            "url": doc_meta.get(doc_id, {}).get("url"),
            "title": doc_meta.get(doc_id, {}).get("title")
        })

    hybrid_results.sort(key=lambda x: x["score"], reverse=True)

    # Pagination hesapla
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    total_results = len(hybrid_results)
    total_pages = (total_results + per_page - 1) // per_page

    paginated_results = hybrid_results[start_idx:end_idx]

    return jsonify({
        "results": paginated_results,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_results": total_results,
            "per_page": per_page
        }
    })
