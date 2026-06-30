import urllib.request
import json
import re

url = "https://www.pinterest.com/odhisam1/african-jewelry/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        
        img_matches = re.finditer(r'<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"', html)
        products = []
        seen = set()
        for m in img_matches:
            src = m.group(1)
            alt = m.group(2)
            if ("236x" in src or "736x" in src or "originals" in src) and alt.strip() and "profile" not in src:
                src = src.replace("236x", "736x")
                if src not in seen:
                    seen.add(src)
                    products.append({
                        "id": len(products) + 1,
                        "name": alt.strip()[:50] + "...", 
                        "price": 2500 + (len(products) * 500), 
                        "currency": "KSh",
                        "category": "Jewelry",
                        "tag": "Pinterest",
                        "featured": True,
                        "image": src,
                        "description": alt,
                        "material": "Assorted African materials",
                        "artisan": "Various Artisans"
                    })
        
        if products:
            with open('pinterest_products.json', 'w', encoding='utf-8') as f:
                json.dump(products, f, indent=2)
            print(f"Successfully saved {len(products)} products to pinterest_products.json")
        else:
            print("No products found.")
except Exception as e:
    print(f"Error: {e}")
