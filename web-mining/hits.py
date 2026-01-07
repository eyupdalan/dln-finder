import psycopg2
from config import DB_CONFIG
from bm25_implementation import get_links
import networkx as nx
from tqdm import tqdm

def calculate_hits(conn):
    df = get_links(conn)
    G = nx.DiGraph()
    url_to_id = dict(zip(df['url'], df['id']))

    for _, row in df.iterrows():
        source_id = row['id']
        links = row['links']
        if not links:
            continue

        for target_url in links:
            target_id = url_to_id.get(target_url)
            if target_id:
                G.add_edge(source_id, target_id)
                
    hubs, authorities = nx.hits(G, max_iter=1000, normalized=True)
    return hubs, authorities

def save_hits_scores(conn, hubs, authorities):
    cursor = conn.cursor()
    
    # Önce tabloyu temizleyelim
    cursor.execute("TRUNCATE TABLE hits")
    
    doc_ids = list(hubs.keys())
    for doc_id in tqdm(doc_ids, desc="Saving HITS scores"):
        hub_score = hubs[doc_id]
        authority_score = authorities[doc_id]
        cursor.execute("INSERT INTO hits (doc_id, hub_score, authority_score) VALUES (%s, %s, %s)", (doc_id, hub_score, authority_score))
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    conn = psycopg2.connect(**DB_CONFIG)
    hubs, authorities = calculate_hits(conn)
    save_hits_scores(conn, hubs, authorities)