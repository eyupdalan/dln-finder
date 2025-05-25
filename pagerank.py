import psycopg2
import networkx as nx
from bm25_implementation import get_links
from config import DB_CONFIG
from tqdm import tqdm

def calculate_pagerank(conn):
    links = get_links(conn)
    G = nx.DiGraph()

    # URL → ID eşlemesi (linkler URL bazlı olduğundan)
    url_to_id = dict(zip(links['url'], links['id']))

    # Her sayfanın linklerinden kenarlar ekleniyor
    for _, row in links.iterrows():
        source_id = row['id']
        out_links = row['links']

        if not out_links:
            continue

        for target_url in out_links:
            target_id = url_to_id.get(target_url)
            if target_id:
                G.add_edge(source_id, target_id)
    
    pagerank_scores = nx.pagerank(G, alpha=0.85)  # Damping factor 0.85 genellikle kullanılır

    return pagerank_scores

def save_pagerank_scores(conn, pagerank_scores):
    cursor = conn.cursor()
    
    # Önce tabloyu temizleyelim
    cursor.execute("TRUNCATE TABLE pagerank")
    
    for doc_id, score in tqdm(pagerank_scores.items(), desc="Saving PageRank scores"):
        cursor.execute("""
            INSERT INTO pagerank (doc_id, score)
            VALUES (%s, %s)
            ON CONFLICT (doc_id) DO UPDATE SET score = EXCLUDED.score;
        """, (doc_id, score))

    conn.commit()
    cursor.close()
    conn.close()

def get_pagerank_scores(conn, doc_ids):
    cursor = conn.cursor()
    # Convert list to tuple for proper SQL IN clause syntax
    doc_ids_tuple = tuple(doc_ids)
    cursor.execute(
        "SELECT doc_id, score FROM pagerank WHERE doc_id IN %s;",
        (doc_ids_tuple,)
    )
    pagerank_scores = dict(cursor.fetchall())
    return pagerank_scores

if __name__ == "__main__":
    conn = psycopg2.connect(**DB_CONFIG)
    pagerank_scores = calculate_pagerank(conn)
    save_pagerank_scores(conn, pagerank_scores)
    