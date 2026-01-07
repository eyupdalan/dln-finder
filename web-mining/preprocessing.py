from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import html.entities  # html modülünü doğru şekilde import ediyoruz
import psycopg2
from tqdm import tqdm
from config import DB_CONFIG
from text_preprocessing import preprocess_text

def extract_text_and_links(html_content, base_url):
    soup = BeautifulSoup(html_content, "html.parser")

    # Metin çıkarımı
    for tag in soup(["script", "style", "noscript"]):
        tag.extract()

    text = soup.get_text(separator=' ', strip=True)

    # Hyperlink çıkarımı
    links = []
    for a_tag in soup.find_all("a", href=True):
        href = urljoin(base_url, a_tag['href'])  # relative → absolute
        if urlparse(href).scheme in ['http', 'https']:
            links.append(href)

    return text, links

def safe_encode_decode(text):
    """
    Metni güvenli bir şekilde encode ve decode eder
    """
    if not text:
        return ""
    
    try:
        # Önce HTML karakterlerini decode et
        decoded = html.unescape(text)
        
        # UTF-8'e çevir ve hatalı karakterleri atla
        encoded = decoded.encode('utf-8', errors='ignore')
        
        # Tekrar decode et
        return encoded.decode('utf-8')
    except Exception as e:
        print(f"Metin dönüştürme hatası: {e}")
        return ""

def process_in_chunks(batch_size=1000):
    # Veritabanı bağlantısı
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Toplam kayıt sayısını al
        cursor.execute("SELECT COUNT(*) FROM pages")
        total_records = cursor.fetchone()[0]
        
        # Offset ile parça parça veri çek
        offset = 0
        with tqdm(total=total_records, desc="İşlenen Kayıtlar") as pbar:
            while True:
                # Belirli sayıda kayıt çek
                cursor.execute(f"SELECT id, url, title, html FROM pages LIMIT {batch_size} OFFSET {offset}")
                rows = cursor.fetchall()
                
                if not rows:
                    break
                    
                # Her bir kayıt için işlem yap
                for row in rows:
                    id = row[0]
                    url = row[1]
                    title = row[2]
                    html = safe_encode_decode(row[3])
                    text, links = extract_text_and_links(html, url)
                    tokens = preprocess_text(text)
                    cursor.execute("""
                        INSERT INTO pages_cleaned (id, url, text, links, tokens)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE
                        SET text = EXCLUDED.text, links = EXCLUDED.links, tokens = EXCLUDED.tokens;
                    """, (id, url, text, links, tokens))

                    pass
                
                # İlerleme çubuğunu güncelle
                pbar.update(len(rows))
                
                # Offset'i güncelle
                offset += batch_size
                
                # Her batch'te commit yap
                conn.commit()
        
        print(f"Toplam {total_records} kayıt işlendi.")
        
    except Exception as e:
        print(f"Hata oluştu: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    process_in_chunks(batch_size=1000)