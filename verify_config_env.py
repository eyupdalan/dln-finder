from config import DB_CONFIG
import os

print("Checking DB_CONFIG...")
expected_config = {
    'dbname': 'dln-finder',
    'user': 'postgres',
    'password': '7121988',
    'host': 'localhost',
    'port': '5432'
}

for key, value in expected_config.items():
    if DB_CONFIG.get(key) == value:
        print(f"✅ {key} matches")
    else:
        print(f"❌ {key} mismatch: expected '{value}', got '{DB_CONFIG.get(key)}'")

if DB_CONFIG == expected_config:
    print("\nSUCCESS: Configuration loaded correctly.")
else:
    print("\nFAILURE: Configuration mismatch.")
