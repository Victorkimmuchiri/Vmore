import urllib.request
import xml.etree.ElementTree as ET
import json
import re

url = 'https://www.pinterest.com/odhisam1/african-jewelry.rss'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    response = urllib.request.urlopen(req)
    root = ET.fromstring(response.read())
    
    products = []
    for i, item in enumerate(root.findall('.//item')):
        title_elem = item.find('title')
        title = title_elem.text if title_elem is not None and title_elem.text else f"African Jewelry Piece {i+1}"
        
        desc_elem = item.find('description')
        desc_html = desc_elem.text if desc_elem is not None and desc_elem.text else ""
        
        # Extract image
        img_match = re.search(r'src="([^"]+)"', desc_html)
        img_url = img_match.group(1) if img_match else "/images/logo.jpg"
        
        # Pinterest returns 236x images, let's get 736x
        img_url = img_url.replace("236x", "736x")
        
        # Extract text description by stripping tags
        clean_desc = re.sub(r'<[^>]+>', '', desc_html).strip()
        if not clean_desc:
            clean_desc = title
            
        # Assign price between 1500 and 8500
        price = 1500 + ((i * 350) % 7000)
        
        products.append({
            "id": i + 1,
            "name": title[:50] + ("..." if len(title) > 50 else ""),
            "price": price,
            "currency": "KSh",
            "category": "Jewelry",
            "tag": "Pinterest",
            "featured": i < 6,
            "image": img_url,
            "images": [img_url],
            "description": clean_desc if clean_desc else "Beautiful African jewelry piece.",
            "material": "Assorted",
            "artisan": "African Artisans"
        })
        
    with open('src/data/pinterest_data.js', 'w', encoding='utf-8') as f:
        f.write("export const PINTEREST_PRODUCTS = " + json.dumps(products, indent=2) + ";\n")
        
    print(f"Saved {len(products)} products to src/data/pinterest_data.js")
except Exception as e:
    print("Error:", e)
