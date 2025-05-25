import os
import requests
from tqdm import tqdm
import gzip
from warcio.archiveiterator import ArchiveIterator
import psycopg2
from psycopg2.extras import execute_values
import re
from datetime import datetime
from bs4 import BeautifulSoup
from config import DB_CONFIG

def download_file(url, filename):
    """
    Download a file from a URL with progress bar
    """
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as file, tqdm(
        desc=filename,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)

def get_target_urls():
    """
    Read target URLs from the text file
    """
    with open("basin-ilan-kurumu-websites.txt", "r") as f:
        return [line.strip() for line in f.readlines()]

def process_warc_file(warc_file, target_urls, conn):
    """
    Process a WARC file and save matching pages to PostgreSQL
    """
    print(f"\nProcessing {warc_file}...")
    
    with gzip.open(warc_file, 'rb') as stream:
        for record in ArchiveIterator(stream):
            if record.rec_type == 'response':
                url = record.rec_headers.get_header('WARC-Target-URI')
                
                # Check if URL matches any of our target URLs
                if any(target_url in url for target_url in target_urls):
                    try:
                        # Get HTML content
                        html = record.content_stream().read().decode('utf-8', errors='ignore')
                        
                        # remove null characters
                        html = html.replace('\x00', '')

                        soup = BeautifulSoup(html, 'html.parser')
                        title = soup.title.string if soup.title else ''
                        
                        # Save to PostgreSQL
                        with conn.cursor() as cur:
                            cur.execute("""
                                INSERT INTO pages (url, title, html)
                                VALUES (%s, %s, %s)
                            """, (url, title, html))
                            conn.commit()
                            
                        print(f"Saved page: {url}")
                    except Exception as e:
                        print(f"Error processing {url}: {str(e)}")

def main():
    # Base URL for the WARC files
    base_url = "https://data.commoncrawl.org/"
    
    # Create downloads directory if it doesn't exist
    if not os.path.exists("downloads"):
        os.makedirs("downloads")
    
    # Read target URLs
    target_urls = get_target_urls()
    print(f"Loaded {len(target_urls)} target URLs")
    
    # Read the lines from warc.paths
    with open("warc.paths", "r") as f:
        warc_files = [line.strip() for line in f.readlines()]
    
    # Connect to PostgreSQL
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Download and process each file
        for warc_file in warc_files:
            url = base_url + warc_file
            filename = os.path.join("downloads", os.path.basename(warc_file))
            
            print(f"\nDownloading {warc_file}...")
            try:
                download_file(url, filename)
                print(f"Successfully downloaded {filename}")
                
                # Process the downloaded file
                process_warc_file(filename, target_urls, conn)
                
                # Delete the file after processing
                os.remove(filename)
                print(f"Deleted {filename}")
                
            except Exception as e:
                print(f"Error processing {warc_file}: {str(e)}")
                # Try to delete the file even if there was an error
                if os.path.exists(filename):
                    os.remove(filename)
                    print(f"Deleted {filename} after error")
        
    except Exception as e:
        print(f"Database connection error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
        
        # Clean up downloads directory if it's empty
        if os.path.exists("downloads") and not os.listdir("downloads"):
            os.rmdir("downloads")
            print("Removed empty downloads directory")

if __name__ == "__main__":
    main()

# Downloaded files:
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101020153-00156.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101055537-00157.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101083312-00158.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101110352-00159.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101133323-00160.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101160900-00161.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101182853-00162.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101204758-00163.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250101233509-00164.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102025043-00165.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102053830-00166.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102074538-00167.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102092617-00168.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102110149-00169.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102122438-00170.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102140759-00171.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102155145-00172.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102173620-00173.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102192440-00174.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250102214004-00175.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103000559-00176.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103031223-00177.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103060152-00178.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103080404-00179.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103095544-00180.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103114344-00181.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103131849-00182.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103145501-00183.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103163233-00184.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103181014-00185.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103195451-00186.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250103220150-00187.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104002739-00188.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104032018-00189.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104055301-00190.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104075536-00191.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104100949-00192.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104121819-00193.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104141737-00194.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104161433-00195.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104183333-00196.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104205009-00197.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250104232817-00198.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105025119-00199.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105061508-00200.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105090322-00201.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105112239-00202.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105133021-00203.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105152502-00204.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105172944-00205.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105193355-00206.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250105215240-00207.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106002452-00208.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106031035-00209.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106053829-00210.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106074344-00211.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106092808-00212.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106105942-00213.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106122824-00214.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106135553-00215.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106152425-00216.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106165553-00217.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106182925-00218.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106200446-00219.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250106215614-00220.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107001200-00221.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107024016-00222.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107051809-00223.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107072746-00224.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107091515-00225.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107105242-00226.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107121839-00227.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107134141-00228.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107150611-00229.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107163145-00230.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107175935-00231.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107193415-00232.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107212053-00233.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250107231841-00234.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108014519-00235.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108040237-00236.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108060338-00237.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108074344-00238.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108092449-00239.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108105830-00240.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108121827-00241.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108133550-00242.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108145715-00243.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108161658-00244.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108173904-00245.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108190231-00246.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108203346-00247.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250108222824-00248.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250109004458-00249.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250109030030-00250.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250109050818-00251.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250109070557-00252.warc.gz
# crawl-data/CC-NEWS/2025/01/CC-NEWS-20250109085231-00253.warc.gz