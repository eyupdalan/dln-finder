# DLN Finder - Web Madenciliği Projesi

Bu proje, web sayfalarından veri çekme, metin işleme ve arama algoritmaları uygulayan bir web madenciliği projesidir.

## Proje Yapısı

### Veri Toplama ve İşleme
- `download.py`: Web sayfalarından veri çekme işlemlerini gerçekleştirir
  - Veri kaynağı: CommonCrawl
  - İndirilen dosyalar: WARC formatında web arşivleri
  - İşlenen dosyalar: `warc.paths` ve `org.warc.paths` içindeki URL'ler
  - Kaynak URL'ler: `basin-ilan-kurumu-websites.txt` dosyasında saklanır
  - İşlem adımları:
    1. WARC dosyalarının indirilmesi ve işlenmesi
    2. HTML içeriklerinin çıkarılması ve temizlenmesi
    3. Metin içeriklerinin ayrıştırılması
- `preprocessing.py`: Ham metin verilerinin ön işleme adımlarını içerir
  - İşlem adımları:
    1. HTML etiketlerinin temizlenmesi
    2. Özel karakterlerin ve gereksiz boşlukların kaldırılması
    3. Türkçe karakterlerin normalleştirilmesi
    4. Noktalama işaretlerinin işlenmesi
    5. Küçük harfe dönüştürme
    6. Stop words (etkisiz kelimeler) temizleme
    7. Kelime köklerine indirgeme (stemming)
  - Özellikler:
    - Türkçe dil desteği
    - Özelleştirilebilir stop words listesi
    - Bellek optimizasyonu
    - Paralel işleme desteği
- `text_preprocessing.py`: Metin temizleme ve normalleştirme işlemleri
  - İşlem adımları:
    1. Metin tokenizasyonu
    2. Kelime frekanslarının hesaplanması
    3. TF-IDF değerlerinin hesaplanması
    4. Kelime vektörlerinin oluşturulması

### Arama ve Sıralama Algoritmaları
- `inverted_index.py`: Ters indeks yapısının implementasyonu
  - İşlem adımları:
    1. Kelime-doküman eşleştirme matrisinin oluşturulması
    2. Ters indeks yapısının oluşturulması
    3. Kelime frekanslarının hesaplanması
    4. Arama sorgularının işlenmesi
- `bm25_implementation.py`: BM25 arama algoritması implementasyonu
  - İşlem adımları:
    1. Doküman uzunluklarının hesaplanması
    2. Kelime frekanslarının hesaplanması
    3. BM25 skorlarının hesaplanması
    4. Sonuçların sıralanması
- `pagerank.py`: PageRank algoritması implementasyonu
  - İşlem adımları:
    1. Bağlantı matrisinin oluşturulması
    2. PageRank değerlerinin hesaplanması
    3. İteratif güncelleme
    4. Sonuçların sıralanması
- `hits.py`: HITS (Hyperlink-Induced Topic Search) algoritması implementasyonu
  - İşlem adımları:
    1. Hub ve Authority değerlerinin hesaplanması
    2. İteratif güncelleme
    3. Sonuçların sıralanması

### Kombinasyon Algoritmaları
- `bm25_and_pagerank.py`: BM25 ve PageRank algoritmalarının birleşimi
  - İşlem adımları:
    1. BM25 skorlarının hesaplanması
    2. PageRank değerlerinin hesaplanması
    3. Ağırlıklı birleştirme
    4. Sonuçların sıralanması
- `bm25_and_pagerank_and_hits.py`: BM25, PageRank ve HITS algoritmalarının birleşimi
  - İşlem adımları:
    1. BM25 skorlarının hesaplanması
    2. PageRank değerlerinin hesaplanması
    3. HITS değerlerinin hesaplanması
    4. Ağırlıklı birleştirme
    5. Sonuçların sıralanması

### API ve Arayüz
- `rest_api.py`: REST API implementasyonu
  - İşlem adımları:
    1. API endpoint'lerinin tanımlanması
    2. Arama sorgularının işlenmesi
    3. Sonuçların JSON formatında döndürülmesi
- `ui/`: Kullanıcı arayüzü dosyaları
  - Özellikler:
    - Arama kutusu
    - Sonuç listesi
    - Sayfalama
    - Filtreleme seçenekleri

### Yapılandırma ve Yardımcı Dosyalar
- `config.py`: Proje yapılandırma ayarları
  - İçerik:
    - Veritabanı bağlantı bilgileri
    - API ayarları
    - Algoritma parametreleri
- `requirements.txt`: Proje bağımlılıkları
- `run.sh`: Projeyi çalıştırmak için shell script

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

2. Projeyi çalıştırın:
```bash
./run.sh
```

## Kullanım

Proje, web sayfalarından veri çekme, metin işleme ve arama işlemlerini gerçekleştirir. Arama sonuçları, BM25, PageRank ve HITS algoritmalarının kombinasyonları kullanılarak sıralanır.

## Özellikler

- Web sayfalarından veri çekme
- Metin ön işleme ve temizleme
- Ters indeks oluşturma
- BM25 tabanlı arama
- PageRank ve HITS algoritmaları ile sayfa sıralama
- REST API üzerinden erişim
- Kullanıcı dostu web arayüzü

## Geliştirici

Bu proje BLM5121 Web Madenciliği dersi kapsamında geliştirilmiştir. 
