import math
from collections import defaultdict
import pandas as pd
import psycopg2
from config import DB_CONFIG
from text_preprocessing import preprocess_text
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np

def normalize(scores_dict):
    values = np.array(list(scores_dict.values()))
    if len(values) == 0:
        return {}
    min_v, max_v = values.min(), values.max()
    if max_v == min_v:
        return {k: 0.0 for k in scores_dict}
    return {k: (v - min_v) / (max_v - min_v) for k, v in scores_dict.items()}

def get_links(conn):
    cur = conn.cursor()
    cur.execute("SELECT id, url, links FROM pages_cleaned")
    columns = ['id', 'url', 'links']
    data = cur.fetchall()
    return pd.DataFrame(data, columns=columns)

def compute_bm25(query_tokens, conn, k1=1.5, b=0.75):
    scores = defaultdict(float)
    cursor = conn.cursor()

    # Toplam doküman sayısı
    cursor.execute("SELECT COUNT(*) FROM doc_lengths;")
    N = cursor.fetchone()[0]

    # Ortalama doküman uzunluğu
    cursor.execute("SELECT AVG(length) FROM doc_lengths;")
    avgdl = float(cursor.fetchone()[0])

    for term in query_tokens:
        # Belge frekansı (df)
        cursor.execute("SELECT COUNT(*) FROM inverted_index WHERE term = %s;", (term,))
        df = cursor.fetchone()[0]
        if df == 0:
            continue

        idf = math.log(1 + (N - df + 0.5) / (df + 0.5))

        # Terimi içeren dokümanları ve frekanslarını getir
        cursor.execute("""
            SELECT ii.doc_id, ii.freq, dl.length
            FROM inverted_index ii
            JOIN doc_lengths dl ON ii.doc_id = dl.doc_id
            WHERE ii.term = %s;
        """, (term,))
        results = cursor.fetchall()

        for doc_id, freq, doc_len in results:
            denom = freq + k1 * (1 - b + b * doc_len / avgdl)
            score = idf * (freq * (k1 + 1)) / denom
            scores[doc_id] += score

    cursor.close()
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)

def get_titles_and_urls(doc_ids):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    # doc_ids bir liste olmalı, ör: [1, 2, 3]
    sql = "SELECT id, title, url FROM pages WHERE id = ANY(%s) ORDER BY id"
    cur.execute(sql, (doc_ids,))
    results = cur.fetchall()
    cur.close()
    conn.close()
    return results

def calculate_metrics(y_true, y_pred):
    """
    Doğruluk, precision, recall ve F1-score hesaplar
    
    Args:
        y_true: Gerçek değerler (1: ilgili, 0: ilgisiz)
        y_pred: Tahmin edilen değerler (1: ilgili, 0: ilgisiz)
    
    Returns:
        dict: Metrik değerlerini içeren sözlük
    """
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, zero_division=0),
        'recall': recall_score(y_true, y_pred, zero_division=0),
        'f1': f1_score(y_true, y_pred, zero_division=0)
    }
    return metrics

def evaluate_search_results(results, relevant_doc_ids, k=10):
    """
    Arama sonuçlarını değerlendirir
    
    Args:
        results: (doc_id, score) çiftlerinden oluşan liste
        relevant_doc_ids: İlgili doküman ID'lerinin listesi
        k: Değerlendirilecek sonuç sayısı
    
    Returns:
        dict: Metrik değerlerini içeren sözlük
    """
    # İlk k sonucu al
    top_k_docs = [doc_id for doc_id, _ in results[:k]]
    
    # Gerçek değerler ve tahminler için binary vektörler oluştur
    y_true = np.array([1 if doc_id in relevant_doc_ids else 0 for doc_id in top_k_docs])
    y_pred = np.ones(k)  # Tüm sonuçları ilgili olarak işaretle
    
    return calculate_metrics(y_true, y_pred)

if __name__ == "__main__":
    query = "çanakkalede orman yangını"
    query_tokens = preprocess_text(query)

    conn = psycopg2.connect(**DB_CONFIG)
    results = compute_bm25(query_tokens, conn)
    doc_ids = [doc_id for doc_id, _ in results]

    print("doc_ids length: ", len(doc_ids))
    titles_and_urls = get_titles_and_urls(doc_ids=doc_ids[:10])
    print("titles_and_urls length: ", len(titles_and_urls))

    # Örnek olarak ilk 3 dokümanı ilgili olarak işaretleyelim
    # Gerçek uygulamada bu değerler manuel olarak veya başka bir kaynaktan gelmelidir
    # relevant_doc_ids = doc_ids[:3]
    
    # Metrikleri hesapla
    # metrics = evaluate_search_results(results, relevant_doc_ids)
    
    # print("\nDeğerlendirme Metrikleri:")
    # print(f"Doğruluk (Accuracy): {metrics['accuracy']:.4f}")
    # print(f"Precision: {metrics['precision']:.4f}")
    # print(f"Recall: {metrics['recall']:.4f}")
    # print(f"F1-Score: {metrics['f1']:.4f}")
    
    print("\nArama Sonuçları:")
    for item in titles_and_urls:
        print(item)

    # for doc_id, score in results[:10]:
    #     if doc_id in titles_and_urls:
    #         item = titles_and_urls[doc_id]
    #         print(item)
    #         title = item[1];
    #         url = item[2];
    #         print(f"Doc ID: {doc_id}, Score: {score:.4f}, Title: {title}, URL: {url}")
