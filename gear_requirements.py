"""
gear_requirements.py
────────────────────
Smart gear dependency engine. Given a list of selected items,
returns structured suggestions for what else should be packed.

All logic is based on the actual DJMAudio inventory categories
and real-world AV production requirements.
"""

# ─── CATEGORY RULES ──────────────────────────────────────────────────────────
# Maps category keywords → what it needs (by category name, qty multiplier, reason)
# Format: { trigger_category: [(needs_category, qty_per_unit, note)] }

CATEGORY_NEEDS = {
    # ── PA / Speakers ─────────────────────────────────────────────────────────
    "PA Systems": [
        ("XLR Cables",   2,  "XLR from mixer to speaker (signal in)"),
        ("Power",        1,  "Power cable for powered speaker"),
        ("Stands",       0,  "Speaker stands if using as front fill/PA top"),  # 0 = advisory
    ],
    # ── Mixers ────────────────────────────────────────────────────────────────
    "Mixers": [
        ("XLR Cables",   4,  "XLR runs from mixer to PA, monitors, and sources"),
        ("Power",        1,  "Power cable for mixer"),
        ("TRS Cables",   2,  "TRS insert/send cables for mixer I/O"),
    ],
    # ── Microphones (wired) ───────────────────────────────────────────────────
    "Microphones": [
        ("XLR Cables",   1,  "One XLR cable per microphone"),
        ("Stands",       1,  "Mic stand per microphone"),
    ],
    # ── Wireless systems ──────────────────────────────────────────────────────
    "Wireless": [
        ("XLR Cables",   1,  "XLR from wireless receiver to mixer"),
        ("Power",        1,  "Power cable for receiver"),
        ("Stands",       0,  "Mic stand if using handheld on stand"),
    ],
    # ── Lighting (moving heads, wash, LED) ───────────────────────────────────
    "Lighting": [
        ("DMX Cables",   1,  "DMX cable per fixture for control chain"),
        ("Power",        1,  "Power cable per fixture"),
        ("Hardware",     0,  "Truss clamps or safety cables if rigging lights"),
    ],
    # ── DI Boxes / Signal ─────────────────────────────────────────────────────
    "DI / Signal": [
        ("XLR Cables",   1,  "XLR out of DI to mixer"),
        ("TRS Cables",   1,  "TRS/instrument cable into DI input"),
    ],
}

# ─── ITEM-SPECIFIC NAME RULES ────────────────────────────────────────────────
# Extra rules triggered by keywords in the item name (case-insensitive)
# Format: { keyword: [(needs_category, qty, note)] }

NAME_KEYWORD_NEEDS = {
    "subwoofer": [
        ("Power",       1, "Subwoofer power cable (Powercon or IEC)"),
        ("XLR Cables",  1, "XLR from mixer/crossover to sub"),
    ],
    "evolve": [
        ("XLR Cables",  1, "XLR into Evolve column system"),
        ("Power",       1, "Power cable for Evolve base unit"),
    ],
    "xdj": [
        ("XLR Cables",  2, "XLR master outputs from DJ controller to mixer/PA"),
        ("Power",       1, "Power cable for DJ controller"),
        ("TRS Cables",  1, "TRS for booth output or headphone monitoring"),
    ],
    "sq-5": [
        ("XLR Cables",  6, "XLR for inputs and main outputs on the SQ-5"),
        ("Power",       1, "Power cable for Allen & Heath SQ-5"),
        ("TRS Cables",  2, "TRS for inserts or group sends"),
    ],
    "moving head": [
        ("DMX Cables",  1, "DMX per moving head in chain"),
        ("Power",       1, "Powercon or AC cable per moving head"),
        ("Hardware",    0, "Safety cable + truss clamp if rigged"),
    ],
    "condenser": [
        ("XLR Cables",  1, "XLR cable (phantom power carried over XLR)"),
        ("Stands",      1, "Mic stand for condenser placement"),
    ],
    "wireless": [
        ("Power",       1, "Receiver power supply"),
        ("XLR Cables",  1, "XLR from receiver output to mixer"),
    ],
}

# ─── ENGINE ───────────────────────────────────────────────────────────────────

def get_suggestions(selected_items: list[dict], all_available: list[dict]) -> dict:
    """
    Given selected_items (list of item dicts with 'category', 'name'),
    and all_available items, return structured suggestions.

    Returns:
        {
          "warnings": [str],        # critical missing items
          "suggestions": [          # grouped by category
              {
                "reason": str,
                "category": str,
                "qty_needed": int,
                "qty_available": int,
                "items": [item_dict],  # available matching items
                "already_selected": int,
              }
          ]
        }
    """
    # Count already-selected by category
    selected_cats = {}
    for item in selected_items:
        cat = item.get("category", "")
        selected_cats[cat] = selected_cats.get(cat, 0) + 1

    # Build requirement map: category → (total_qty_needed, [reasons])
    needs: dict[str, dict] = {}

    for item in selected_items:
        cat = item.get("category", "")
        name = item.get("name", "").lower()

        # Category-level rules
        for rule_cat, rules in CATEGORY_NEEDS.items():
            if rule_cat.lower() == cat.lower():
                for need_cat, qty, reason in rules:
                    if need_cat not in needs:
                        needs[need_cat] = {"qty": 0, "reasons": [], "advisory": False}
                    if qty == 0:
                        needs[need_cat]["advisory"] = True
                        needs[need_cat]["reasons"].append(f"Advisory: {reason}")
                    else:
                        needs[need_cat]["qty"] += qty
                        needs[need_cat]["reasons"].append(reason)

        # Name keyword rules
        for keyword, rules in NAME_KEYWORD_NEEDS.items():
            if keyword in name:
                for need_cat, qty, reason in rules:
                    if need_cat not in needs:
                        needs[need_cat] = {"qty": 0, "reasons": [], "advisory": False}
                    if qty == 0:
                        needs[need_cat]["advisory"] = True
                        needs[need_cat]["reasons"].append(f"Advisory: {reason}")
                    else:
                        needs[need_cat]["qty"] += qty
                        needs[need_cat]["reasons"].append(reason)

    # Build available lookup by category
    avail_by_cat: dict[str, list] = {}
    for item in all_available:
        c = item.get("category", "")
        avail_by_cat.setdefault(c, []).append(item)

    suggestions = []
    warnings = []

    for need_cat, info in needs.items():
        already = selected_cats.get(need_cat, 0)
        qty_needed = max(0, info["qty"] - already)
        avail_items = avail_by_cat.get(need_cat, [])
        qty_avail = len(avail_items)
        unique_reasons = list(dict.fromkeys(info["reasons"]))  # deduplicate

        if info["advisory"]:
            # Just a reminder note
            suggestions.append({
                "reason": " · ".join(unique_reasons),
                "category": need_cat,
                "qty_needed": 0,
                "qty_available": qty_avail,
                "items": avail_items[:5],
                "already_selected": already,
                "advisory": True,
            })
            continue

        if qty_needed == 0:
            continue  # already covered

        if qty_avail == 0:
            warnings.append(f"⚠️ **{need_cat}** needed ({qty_needed}x) but NONE available in inventory!")
        else:
            suggestions.append({
                "reason": " · ".join(unique_reasons),
                "category": need_cat,
                "qty_needed": qty_needed,
                "qty_available": qty_avail,
                "items": avail_items[:8],
                "already_selected": already,
                "advisory": False,
            })

    # Sort: critical first, then advisory
    suggestions.sort(key=lambda s: s.get("advisory", False))
    return {"warnings": warnings, "suggestions": suggestions}


def get_item_spec_sheet(item: dict) -> list[str]:
    """
    Returns a list of spec notes/requirements for a single inventory item.
    Used on inventory detail views.
    """
    cat = item.get("category", "")
    name = item.get("name", "").lower()
    specs = []

    # Category specs
    cat_specs = {
        "PA Systems":    ["Requires: 1x power cable", "Requires: 1–2x XLR cables (signal in)", "Recommend: speaker stand if used as front fill"],
        "Mixers":        ["Requires: 1x power cable", "Requires: XLR cables for all inputs/outputs", "Optional: TRS cables for inserts"],
        "Microphones":   ["Requires: 1x XLR cable per mic", "Requires: 1x mic stand per mic", "Optional: mic clip if not included"],
        "Wireless":      ["Requires: 1x power cable (receiver)", "Requires: 1x XLR cable (receiver → mixer)", "Battery: AA batteries in transmitter"],
        "Lighting":      ["Requires: 1x power cable per fixture", "Requires: 1x DMX cable per fixture", "Safety: safety cable if rigging on truss"],
        "DI / Signal":   ["Requires: 1x XLR cable (out → mixer)", "Requires: 1x TRS or instrument cable (source → in)"],
    }
    if cat in cat_specs:
        specs.extend(cat_specs[cat])

    # Name-specific extras
    if "subwoofer" in name or "sub" in name:
        specs.append("Requires: Powercon or IEC power cable (sub-specific)")
    if "condenser" in name:
        specs.append("Requires: Phantom power (+48V) from mixer")
    if "moving head" in name:
        specs.append("Requires: Powercon cable + DMX cable")
        specs.append("Safety: steel safety cable when rigged on truss")
    if "wireless" in name or "qlxd" in name or "blx" in name:
        specs.append("Includes: receiver, transmitter, antennas")
        specs.append("Needs: fresh AA batteries before every event")

    return specs
