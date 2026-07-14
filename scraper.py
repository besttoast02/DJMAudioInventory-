"""
scraper.py — Smart URL scraper for Quick Add.

Scrapes product pages for images and metadata, removes image backgrounds,
and uses AI to estimate rental pricing.
"""

import re
import os
import json
import requests
from io import BytesIO
from urllib.parse import urlparse
from PIL import Image
import streamlit as st

# ── Constants ────────────────────────────────────────────────
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36"
}

IMAGE_DIR = "assets/inventory_images"


# ── URL Scraping ─────────────────────────────────────────────

def scrape_product(url: str) -> dict:
    """
    Scrape a product page and return:
      - name: product name
      - brand: best-guess brand
      - image_url: URL to the main product image
      - source_domain: the domain we scraped from
    """
    from bs4 import BeautifulSoup

    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    domain = urlparse(url).netloc.lower().replace("www.", "")

    # ── Product name ─────────────────────────────────────
    name = ""
    # Try og:title first
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        name = og_title["content"].strip()
    # Fallback to <title>
    if not name and soup.title:
        name = soup.title.string.strip() if soup.title.string else ""
    # Strip common suffixes like " | Sweetwater" or " - B&H"
    for sep in [" | ", " - ", " – ", " — ", " :: "]:
        if sep in name:
            name = name.split(sep)[0].strip()

    # ── Brand detection ──────────────────────────────────
    brand = _guess_brand(name, soup)

    # ── Product image ────────────────────────────────────
    image_url = ""
    # og:image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image_url = og_image["content"]
    # Fallback: largest image on the page
    if not image_url:
        image_url = _find_largest_image(soup, url)

    return {
        "name": name,
        "brand": brand,
        "image_url": image_url,
        "source_domain": domain,
    }


def _guess_brand(name: str, soup) -> str:
    """Attempt to extract brand from product name or page metadata."""
    KNOWN_BRANDS = [
        "Shure", "Sennheiser", "Audix", "Audio-Technica", "Electro-Voice",
        "Allen & Heath", "Pioneer DJ", "Pioneer", "Yamaha", "QSC", "JBL",
        "DAS Audio", "Chauvet", "ADJ", "Martin", "Behringer", "Mackie",
        "Radial", "Whirlwind", "Hosa", "Neutrik", "dbx", "Crown",
        "ETC", "Elation", "Avolites", "ChamSys", "Roland", "Midas",
        "RCF", "Turbosound", "PreSonus", "Focusrite", "Rode", "AKG",
        "Neumann", "Beyerdynamic", "EV", "Bose", "Denon DJ", "Denon",
        "Rane", "Native Instruments", "Numark",
    ]
    name_lower = name.lower()
    for b in KNOWN_BRANDS:
        if b.lower() in name_lower:
            return b

    # Try schema.org brand
    brand_tag = soup.find("meta", {"itemprop": "brand"})
    if brand_tag and brand_tag.get("content"):
        return brand_tag["content"].strip()

    # Try JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                b = data.get("brand", {})
                if isinstance(b, dict):
                    return b.get("name", "")
                if isinstance(b, str):
                    return b
        except (json.JSONDecodeError, TypeError):
            pass

    return ""


def _find_largest_image(soup, base_url: str) -> str:
    """Find the largest product image on the page."""
    from urllib.parse import urljoin
    candidates = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src or src.startswith("data:"):
            continue
        src = urljoin(base_url, src)
        # Heuristic: prefer images with 'product', 'main', 'hero' in the URL
        w = int(img.get("width", 0) or 0)
        h = int(img.get("height", 0) or 0)
        score = w * h if w and h else 0
        for kw in ["product", "main", "hero", "large", "zoom"]:
            if kw in src.lower():
                score += 100000
        # Skip tiny icons, logos, badges
        for skip in ["icon", "logo", "badge", "sprite", "avatar", "rating", "star"]:
            if skip in src.lower():
                score = -1
                break
        if score >= 0:
            candidates.append((score, src))

    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1] if candidates else ""


# ── Image Processing ─────────────────────────────────────────

def download_image(image_url: str) -> Image.Image | None:
    """Download an image from a URL and return a PIL Image."""
    try:
        resp = requests.get(image_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert("RGBA")
    except Exception as e:
        st.warning(f"Could not download image: {e}")
        return None


def remove_background(img: Image.Image) -> Image.Image:
    """Remove image background using rembg."""
    try:
        from rembg import remove
        result = remove(img)
        return result
    except ImportError:
        st.warning("rembg not installed — using original image.")
        return img
    except Exception as e:
        st.warning(f"Background removal failed: {e}. Using original image.")
        return img


def save_inventory_image(img: Image.Image, item_name: str) -> str:
    """Save a processed image to assets/inventory_images/ and return the path."""
    os.makedirs(IMAGE_DIR, exist_ok=True)
    safe_name = item_name.replace(" ", "_").replace("/", "_")
    path = os.path.join(IMAGE_DIR, f"{safe_name}.png")
    img.save(path, "PNG")
    return path


# ── AI Pricing Estimation ───────────────────────────────────

def estimate_pricing(product_name: str, brand: str, category: str) -> dict:
    """
    Use the OpenRouter LLM to estimate rental pricing for a product.
    Returns a dict with: purchase_price, current_value, rate_half_day, rate_daily, rate_weekend.
    """
    import db
    from openai import OpenAI

    openrouter_key = db.get_secret("OPENROUTER_API_KEY", "")
    if not openrouter_key:
        return _fallback_pricing()

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
    )

    MODELS = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
    ]

    prompt = f"""You are an AV rental pricing expert. Given this equipment, estimate pricing in USD.

Product: {product_name}
Brand: {brand}
Category: {category}

Return ONLY a JSON object with these exact keys (no markdown, no explanation):
{{
  "purchase_price": <retail price in USD>,
  "current_value": <used/depreciated value, roughly 60-70% of purchase>,
  "rate_half_day": <half-day rental rate, roughly 3-5% of purchase price>,
  "rate_daily": <daily rental rate, roughly 5-8% of purchase price>,
  "rate_weekend": <weekend rental rate, roughly 8-12% of purchase price>
}}"""

    for model in MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
            )
            content = response.choices[0].message.content
            # Extract JSON from response
            json_match = re.search(r'\{[^{}]+\}', content, re.DOTALL)
            if json_match:
                pricing = json.loads(json_match.group())
                # Validate keys
                required = ["purchase_price", "current_value", "rate_half_day", "rate_daily", "rate_weekend"]
                if all(k in pricing for k in required):
                    return {k: float(pricing[k]) for k in required}
        except Exception:
            continue

    return _fallback_pricing()


def _fallback_pricing() -> dict:
    """Return safe default pricing if AI fails."""
    return {
        "purchase_price": 0,
        "current_value": 0,
        "rate_half_day": 0,
        "rate_daily": 0,
        "rate_weekend": 0,
    }
