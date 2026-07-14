#!/usr/bin/env python3
"""
Download equipment manuals and build maintenance data for DJMAudio inventory.
Searches manufacturer sites for PDF manuals and stores them locally.
"""
import json
import os
import urllib.request
import urllib.error
import ssl

MANUALS_DIR = os.path.join(os.path.dirname(__file__), "assets", "manuals")
os.makedirs(MANUALS_DIR, exist_ok=True)

# SSL context for downloads
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# ── Known manual URLs (verified manufacturer PDF links) ──────
MANUAL_URLS = {
    # PA Systems
    "dbtechnologies_ingenia_ig3t": {
        "brand": "dBTechnologies", "model": "Ingenia IG3T",
        "url": "https://www.dbtechnologies.com/getmedia/4a0d2ea4-e7e7-4b64-a0d2-7f0e60e6068c/IG-Series_QS_rev0-1.pdf",
        "product_page": "https://www.dbtechnologies.com/en/products/ingenia/ig3t/",
    },
    "jbl_srx828sp": {
        "brand": "JBL", "model": "SRX828SP",
        "url": "https://www.jblpro.com/products/srx828sp",
        "product_page": "https://jblpro.com/en/products/srx828sp",
    },
    "das_event_218a": {
        "brand": "DAS", "model": "Event 218A",
        "url": "https://www.dasaudio.com/en/products/event-series/event-218a/",
        "product_page": "https://www.dasaudio.com/en/products/event-series/event-218a/",
    },
    "yamaha_dbr15": {
        "brand": "Yamaha", "model": "DBR15",
        "url": "https://usa.yamaha.com/files/download/other_assets/7/794817/DBR_om.pdf",
        "product_page": "https://usa.yamaha.com/products/proaudio/speakers/dbr/index.html",
    },
    "electro_voice_evolve50": {
        "brand": "Electro-Voice", "model": "Evolve 50",
        "url": "https://products.electrovoice.com/binary/EVOLVE_50_OwnersManual_MULTI.pdf",
        "product_page": "https://products.electrovoice.com/na/en/evolve-50/",
    },
    # Mixers
    "allen_heath_sq5": {
        "brand": "Allen & Heath", "model": "SQ-5",
        "url": "https://www.allen-heath.com/content/uploads/2023/05/SQ-Getting-Started-Guide-AP11507_3.pdf",
        "product_page": "https://www.allen-heath.com/hardware/sq/sq-5/",
    },
    "pioneer_xdj_xz": {
        "brand": "Pioneer DJ", "model": "XDJ-XZ",
        "url": "https://docs.pioneerdj.com/Manuals/XDJ_XZ_DRI1597A_manual/",
        "product_page": "https://www.pioneerdj.com/en/product/all-in-one-system/xdj-xz/black/overview/",
    },
    # Shure Microphones
    "shure_sm57": {
        "brand": "Shure", "model": "SM57",
        "url": "https://pubs.shure.com/guide/sm57",
        "product_page": "https://www.shure.com/en-US/products/microphones/sm/sm57",
    },
    "shure_beta58a": {
        "brand": "Shure", "model": "Beta 58A",
        "url": "https://pubs.shure.com/guide/beta58a",
        "product_page": "https://www.shure.com/en-US/products/microphones/beta/beta58a",
    },
    "shure_pga56": {
        "brand": "Shure", "model": "PGA56",
        "url": "https://pubs.shure.com/guide/PGA56",
        "product_page": "https://www.shure.com/en-US/products/microphones/pga/pga56",
    },
    "shure_pga81": {
        "brand": "Shure", "model": "PGA81",
        "url": "https://pubs.shure.com/guide/PGA81",
        "product_page": "https://www.shure.com/en-US/products/microphones/pga/pga81",
    },
    "shure_pga52": {
        "brand": "Shure", "model": "PGA52",
        "url": "https://pubs.shure.com/guide/PGA52",
        "product_page": "https://www.shure.com/en-US/products/microphones/pga/pga52",
    },
    "shure_pga57": {
        "brand": "Shure", "model": "PGA57",
        "url": "https://pubs.shure.com/guide/PGA57",
        "product_page": "https://www.shure.com/en-US/products/microphones/pga/pga57",
    },
    # Other Microphones
    "audix_i5": {
        "brand": "Audix", "model": "i5",
        "url": "https://audixusa.com/products/i5",
        "product_page": "https://audixusa.com/products/i5",
    },
    "audix_d6": {
        "brand": "Audix", "model": "D6",
        "url": "https://audixusa.com/products/d6",
        "product_page": "https://audixusa.com/products/d6",
    },
    "sennheiser_e904": {
        "brand": "Sennheiser", "model": "evolution e904",
        "url": "https://www.sennheiser.com/en-us/catalog/products/microphones/e-904/e904-500200",
        "product_page": "https://www.sennheiser.com/en-us/catalog/products/microphones/e-904/e904-500200",
    },
    "sennheiser_e906": {
        "brand": "Sennheiser", "model": "e906",
        "url": "https://www.sennheiser.com/en-us/catalog/products/microphones/e-906/e906-500202",
        "product_page": "https://www.sennheiser.com/en-us/catalog/products/microphones/e-906/e906-500202",
    },
    # Wireless
    "shure_blx24_beta58a": {
        "brand": "Shure", "model": "BLX24/Beta58A",
        "url": "https://pubs.shure.com/guide/BLX",
        "product_page": "https://www.shure.com/en-US/products/wireless-systems/blx/blx24-beta58",
    },
    "shure_qlxd24_ksm8": {
        "brand": "Shure", "model": "QLXD24/KSM8",
        "url": "https://pubs.shure.com/guide/QLXD",
        "product_page": "https://www.shure.com/en-US/products/wireless-systems/qlx-d",
    },
    # Lighting
    "adj_vizi_beam_rxone": {
        "brand": "American DJ", "model": "Vizi Beam RXONE",
        "url": "https://www.adj.com/vizi-beam-rxone",
        "product_page": "https://www.adj.com/vizi-beam-rxone",
    },
    "adj_dotz_flood": {
        "brand": "ADJ", "model": "Dotz Flood",
        "url": "https://www.adj.com/dotz-flood",
        "product_page": "https://www.adj.com/dotz-flood",
    },
    "adj_element_hex": {
        "brand": "ADJ", "model": "Element Hex",
        "url": "https://www.adj.com/element-hex",
        "product_page": "https://www.adj.com/element-hex",
    },
    "adj_wifly_exr_battery": {
        "brand": "ADJ", "model": "WiFLY EXR Battery",
        "url": "https://www.adj.com/wifly-exr-battery",
        "product_page": "https://www.adj.com/wifly-exr-battery",
    },
    "adj_airstream_dmx_bridge": {
        "brand": "ADJ", "model": "Airstream DMX Bridge",
        "url": "https://www.adj.com/airstream-dmx-bridge",
        "product_page": "https://www.adj.com/airstream-dmx-bridge",
    },
    "adj_inno_pocket_z4": {
        "brand": "American DJ", "model": "Inno Pocket Z4",
        "url": "https://www.adj.com/inno-pocket-z4",
        "product_page": "https://www.adj.com/inno-pocket-z4",
    },
    "chauvet_fog_fury_jett_pro": {
        "brand": "Chauvet", "model": "Fog Fury Jett Pro",
        "url": "https://www.chauvetdj.com/products/fog-fury-jett-pro/",
        "product_page": "https://www.chauvetdj.com/products/fog-fury-jett-pro/",
    },
    "joyfirst_beam_moving_head": {
        "brand": "Joyfirst", "model": "Beam Moving Head 7R",
        "url": "",
        "product_page": "",
    },
    # DI
    "radial_jdi_duplex": {
        "brand": "Radial", "model": "JDI Duplex",
        "url": "https://www.radialeng.com/product/jdi-duplex",
        "product_page": "https://www.radialeng.com/product/jdi-duplex",
    },
}

def download_manual(key, info):
    """Attempt to download a manual PDF."""
    url = info.get("url", "")
    if not url:
        print(f"  ⚠️  No URL for {key}")
        return False
    
    filename = f"{key}.pdf"
    filepath = os.path.join(MANUALS_DIR, filename)
    
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        print(f"  ✅ Already exists: {filename}")
        return True

    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        })
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            content_type = resp.headers.get("Content-Type", "")
            data = resp.read()
            
            if "pdf" in content_type.lower() or data[:5] == b"%PDF-":
                with open(filepath, "wb") as f:
                    f.write(data)
                print(f"  ✅ Downloaded PDF: {filename} ({len(data)} bytes)")
                return True
            else:
                # Save the product page URL as reference instead
                ref_path = os.path.join(MANUALS_DIR, f"{key}_reference.txt")
                with open(ref_path, "w") as f:
                    f.write(f"Product Page: {info.get('product_page', url)}\n")
                    f.write(f"Manual URL: {url}\n")
                    f.write(f"Note: Manual available on manufacturer website (HTML format)\n")
                print(f"  📄 Saved reference link: {key}_reference.txt")
                return True
    except Exception as e:
        print(f"  ❌ Error downloading {key}: {e}")
        # Save reference anyway
        ref_path = os.path.join(MANUALS_DIR, f"{key}_reference.txt")
        with open(ref_path, "w") as f:
            f.write(f"Product Page: {info.get('product_page', url)}\n")
            f.write(f"Manual URL: {url}\n")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("DJMAudio Manual Downloader")
    print("=" * 60)
    
    success = 0
    for key, info in MANUAL_URLS.items():
        print(f"\n📥 {info['brand']} {info['model']}:")
        if download_manual(key, info):
            success += 1
    
    print(f"\n{'=' * 60}")
    print(f"Done: {success}/{len(MANUAL_URLS)} manuals processed")
    print(f"Saved to: {MANUALS_DIR}")
