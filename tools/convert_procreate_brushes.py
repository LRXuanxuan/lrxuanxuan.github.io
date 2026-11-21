#!/usr/bin/env python3
"""Convert supplied Procreate brush definitions to lightweight, local data.

This reads ZIP/plist data only; it does not execute brush files or reproduce
Procreate's renderer. Requires Python 3.10+ and Pillow. Examples from repo root:

  python tools/convert_procreate_brushes.py --series chuishi /path/to/*.brush
  python tools/convert_procreate_brushes.py --series haiguai /path/to/set.brushset
  python tools/convert_procreate_brushes.py --series dongdong /path/to/set.brushset

Only the generated JS and a text provenance manifest are written. Original
archives, reset settings, portraits, signatures and previews are not copied.
Use --check to verify that checked-in outputs match a fresh conversion.
"""

from __future__ import annotations

import argparse
import base64
import collections
import hashlib
import io
import json
from pathlib import Path
import plistlib
import re
import zipfile

from PIL import Image, ImageOps, __version__ as PILLOW_VERSION


ROOT = Path(__file__).resolve().parents[1]
MAX_MASK_DIMENSION = 256
GROUPS = {"chuishi": "吹石", "haiguai": "海怪", "dongdong": "东东"}
EXPORTS = {"chuishi": "DrawingChuishiData", "haiguai": "DrawingHaiguaiData", "dongdong": "DrawingDongdongData"}

# Recommended web pixel sizes are choices for this canvas, not conversions of
# Procreate's normalized paintSize/maxSize values. Original values stay in source.
PRESETS = {
    "chuishi": [
        ("吹石-加油勾线笔", "jiayou-inking", 8, "细线随压感收放，带少量颗粒。"),
        ("吹石-加油勾线笔2.0自用版", "jiayou-inking-2", 8, "较扁笔尖，适合细线与收尖。"),
        ("吹石-多功能 勾线上色两用", "multipurpose-inking-color", 18, "轻压勾线、重压铺色，叶形笔尖。"),
        ("吹石-多功能二号", "multipurpose-2", 24, "椭圆笔腹，适合勾线和较宽铺色。"),
        ("吹石-学生钢笔", "student-fountain", 8, "压力与速度影响笔宽和浓淡。"),
        ("吹石-手稿笔", "manuscript", 8, "细线与侧锋，倾斜时笔幅变大。"),
        ("吹石-排线", "hatching", 36, "六路并行排线，随走向转动。"),
        ("吹石-排线 颗粒", "hatching-grain", 36, "六路颗粒排线，保留纸纹空隙。"),
        ("吹石-方形画笔 自用版", "square", 32, "扁方笔尖，可从当前图层带起颜色。"),
        ("吹石-水星 改", "mercury", 12, "双笔尖颗粒线条，支持压感与倾斜。"),
        ("吹石-画线条", "linework", 8, "圆头线条，收笔逐渐变细。"),
        ("吹石-薄荷涂色 自用版", "mint-color", 36, "宽幅不规则笔尖，适合铺色。"),
        ("吹石-速度铅笔", "speed-pencil", 8, "三角笔尖，快慢改变笔幅与浓淡。"),
    ],
    "haiguai": [
        ("海怪-勾线笔", "inking", 8, "细勾线，压感控制笔幅。"),
        ("海怪-碳铅", "carbon-pencil", 12, "炭铅颗粒，适合轻铺与叠色。"),
        ("海怪-铅笔（硬）", "pencil-hard", 6, "较硬的颗粒铅笔，适合细节。"),
        ("海怪-铅笔（软)", "pencil-soft", 12, "较淡的软铅笔，适合轻铺与叠色。"),
        ("海怪-万能笔", "all-purpose", 20, "平笔尖，线条与铺色兼顾。"),
        ("海怪-圆头笔 实", "round-solid", 24, "实心圆头，压感改变粗细。"),
        ("海怪-圆头 虚", "round-soft", 24, "圆头收尖，浓淡随压感变化。"),
        ("海怪-平头笔", "flat", 32, "平头笔尖，转向时线宽变化。"),
        ("海怪-上色笔", "coloring", 36, "宽幅墨感笔尖，适合铺色。"),
        ("海怪-针管笔", "fineliner", 4, "细圆头线条，适合轮廓。"),
        ("海怪-喷枪", "airbrush", 80, "柔边喷涂，可轻压叠加。"),
        ("海怪-发光喷枪", "glow-airbrush", 80, "提亮当前图层，空白处留下柔光；会合成该层笔迹，之后用局部橡皮。"),
        ("海怪-描边笔刷", "outline", 30, "粗边空心笔画，内芯透明。"),
        ("海怪-描边笔刷(细)", "outline-fine", 30, "细边空心笔画，内芯透明。"),
        ("海怪-实心笔无压感", "solid-no-pressure", 24, "实心圆头，保持等宽。"),
    ],
    "dongdong": [
        ("勾线笔-滑", "smooth-inking", 8, "平滑勾线，压力控制粗细。"),
        ("勾线/草稿-铅笔", "sketch-pencil", 8, "较淡的颗粒线条，适合起稿。"),
        ("随笔勾线-6号", "casual-inking-6", 8, "轻淡墨线，适合随手勾勒。"),
        ("随笔勾线-18号", "casual-inking-18", 8, "墨感勾线，保留轻重变化。"),
        ("勾线-粗糙", "rough-inking", 16, "双笔尖配合砂砾纹理，产生粗糙线条。"),
        ("页岩画笔", "shale", 24, "较淡的干涩笔触，适合纹理铺色。"),
        ("东东-上色/磨洋工", "slow-coloring", 36, "低浓度圆笔，逐笔积累颜色。"),
        ("普通圆头画笔", "round", 24, "圆头铺色，粗细和浓淡随压感变化。"),
        ("极滑-填色 2", "smooth-fill-2", 32, "实心笔尖，适合平滑填色。"),
        ("极滑-填色 1", "smooth-fill-1", 32, "双点笔尖，拖动形成两路线条。"),
        ("极滑-填色", "smooth-fill", 24, "圆头实色，适合连续填色。"),
        ("光滑-纹理版", "smooth-textured", 24, "平滑笔腹中带细纹理。"),
        ("蜡笔-粗糙", "rough-crayon", 24, "粗颗粒蜡笔感，轻压保留空隙。"),
        ("上色/细化-粗糙", "rough-detail", 20, "干笔边缘，适合铺色与细化。"),
        ("上色-细微颗粒", "fine-grain-coloring", 32, "细颗粒圆笔，适合渐层铺色。"),
        ("上色-柔和", "soft-coloring", 40, "低浓度柔和铺色，可逐笔叠加。"),
        ("上色-柔和机理", "soft-texture", 40, "双笔尖柔和铺色，边缘带不规则纹理。"),
        ("东东-上色/柔和", "soft-coloring-dongdong", 40, "宽幅柔和铺色，压感主要改变浓淡。"),
        ("上色-用力炸开", "pressure-burst", 36, "轻压细画，重压扩大笔幅。"),
        ("尖角 27 1 1", "sharp-corner", 24, "圆形原笔尖，压感控制笔幅。"),
    ],
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compact(value) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def unarchive(data: bytes) -> dict:
    """Decode NSKeyedArchiver references without instantiating native classes."""
    archive = plistlib.loads(data)
    objects = archive["$objects"]

    def decode(value, stack=()):
        if isinstance(value, plistlib.UID):
            index = value.data
            if index == 0:
                return None
            if index in stack:
                return {"$ref": index}
            return decode(objects[index], stack + (index,))
        if isinstance(value, bytes):
            # Color/native binary state is not needed by the web brush engine.
            return {"$omittedBytes": len(value), "sha256": sha256(value)}
        if isinstance(value, list):
            return [decode(item, stack) for item in value]
        if isinstance(value, dict):
            class_info = decode(value.get("$class"), stack)
            class_name = class_info.get("$classname") if isinstance(class_info, dict) else None
            if class_name in ("NSArray", "NSMutableArray"):
                return decode(value["NS.objects"], stack)
            if class_name in ("NSDictionary", "NSMutableDictionary"):
                return dict(zip(decode(value["NS.keys"], stack), decode(value["NS.objects"], stack)))
            result = {key: decode(item, stack) for key, item in value.items() if key != "$class"}
            if class_name:
                result["$class"] = class_name
            if class_name == "ValkyrieMagnitudinalCurve":
                result["xy"] = [
                    [float(number) for number in re.findall(r"[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?", point)]
                    for point in result["points"]
                ]
                if any(len(point) != 2 for point in result["xy"]):
                    raise ValueError("Unexpected pressure curve point format")
            return result
        return value

    root = decode(archive["$top"]["root"])
    if not isinstance(root, dict):
        raise ValueError("Expected brush object in archive root")
    return root


def runtime_source(raw: dict) -> dict:
    """Preserve all scalar parameters and exact recovered pressure points."""
    source = {}
    for key, value in sorted(raw.items()):
        if key == "$class":
            continue
        if isinstance(value, (bool, int, float, str)) or value is None:
            source[key] = value
        elif isinstance(value, dict) and "xy" in value:
            source[key] = value["xy"]
    return source


def encode_rle(alpha: bytes) -> bytes:
    """Pairs of run length (1..255) and alpha (0..255), across row boundaries."""
    output = bytearray()
    if not alpha:
        return bytes(output)
    previous, length = alpha[0], 1
    for value in alpha[1:]:
        if value == previous and length < 255:
            length += 1
        else:
            output.extend((length, previous))
            previous, length = value, 1
    output.extend((length, previous))
    return bytes(output)


def convert_mask(blob: bytes, inverted: bool, inferred_inversion: bool):
    image = Image.open(io.BytesIO(blob)).convert("L")
    original_size = image.size
    if inverted or inferred_inversion:
        image = ImageOps.invert(image)
    scale = min(1.0, MAX_MASK_DIMENSION / max(image.size))
    size = tuple(max(1, round(dimension * scale)) for dimension in image.size)
    image = image.resize(size, Image.Resampling.LANCZOS)
    alpha = bytes(((value + 8) // 17) * 17 for value in image.tobytes())
    encoded = encode_rle(alpha)
    # Validate actual decoded content, including runs that cross a row boundary.
    recovered = bytes(value for count, value in zip(encoded[::2], encoded[1::2]) for _ in range(count))
    if recovered != alpha or len(alpha) != size[0] * size[1]:
        raise ValueError("Mask RLE round trip failed")
    key = "shape-" + sha256(alpha)[:16]
    return key, {"width": size[0], "height": size[1], "encoding": "rle8", "data": base64.b64encode(encoded).decode("ascii")}, {
        "sourceShapeSHA256": sha256(blob),
        "sourceShapeDimensions": list(original_size),
        "maskAlphaSHA256": sha256(alpha),
        "maskInvertedByFlag": inverted,
        "maskInferredInversion": inferred_inversion,
    }


def make_component(zfile, prefix, filename, file_hash, raw, slug, masks, archive_blob):
    member = prefix + "Shape.png"
    provenance = {
        "sourceFilename": filename,
        "sourceSHA256": file_hash,
        "sourceArchivePath": prefix + "Brush.archive",
        "sourceArchiveSHA256": sha256(archive_blob),
        "sourceName": raw.get("name"),
        "sourceAuthor": raw.get("authorName"),
        "maskInferredInversion": False,
    }
    mask = None
    if member in zfile.namelist():
        inferred = slug == "manuscript" and not raw.get("shapeInverted", False)
        mask, encoded, image_info = convert_mask(zfile.read(member), bool(raw.get("shapeInverted", False)), inferred)
        if mask in masks and masks[mask] != encoded:
            raise ValueError("Unexpected mask hash collision")
        masks[mask] = encoded
        provenance.update(image_info)
        if inferred:
            provenance["maskInversionReason"] = (
                "源笔尖为白底黑椭圆，shapeInverted=false；本适配按常规实心笔尖反相。"
                "这是结合笔刷用途和原预览作出的推断，不是原引擎行为的确认。"
            )
    grain_mask = None
    grain_member = prefix + "Grain.png"
    if grain_member in zfile.namelist():
        grain_blob = zfile.read(grain_member)
        # Texture inversion is a rendering parameter: keep the actual source
        # grayscale here so the engine applies textureInverted exactly once.
        grain_key, encoded, image_info = convert_mask(grain_blob, False, False)
        grain_mask = grain_key.replace("shape-", "grain-", 1)
        if grain_mask in masks and masks[grain_mask] != encoded:
            raise ValueError("Unexpected grain hash collision")
        masks[grain_mask] = encoded
        provenance.update({
            "sourceGrainSHA256": image_info["sourceShapeSHA256"],
            "sourceGrainDimensions": image_info["sourceShapeDimensions"],
            "grainAlphaSHA256": image_info["maskAlphaSHA256"],
            "grainInversionApplied": False,
        })
    return {
        "source": runtime_source(raw),
        "mask": mask,
        "grainMask": grain_mask,
        "shapeFallback": raw.get("bundledShapePath"),
        "grainFallback": raw.get("bundledGrainPath"),
        "provenance": provenance,
    }


def convert(paths, series):
    presets = {name: (slug, size, hint) for name, slug, size, hint in PRESETS[series]}
    brushes, masks, entries, input_files = [], {}, [], []
    seen_ids = set()
    for path in paths:
        blob = path.read_bytes()
        file_hash = sha256(blob)
        input_files.append({"filename": path.name, "sha256": file_hash, "bytes": len(blob)})
        with zipfile.ZipFile(io.BytesIO(blob)) as zfile:
            members = zfile.namelist()
            if "brushset.plist" in members:
                manifest = plistlib.loads(zfile.read("brushset.plist"))
                prefixes = [root + "/" for root in manifest["brushes"]]
            elif "Brush.archive" in members:
                prefixes = [""]
            else:
                raise ValueError(f"No brush archive or brushset manifest in {path.name}")
            for prefix in prefixes:
                archive_blob = zfile.read(prefix + "Brush.archive")
                raw = unarchive(archive_blob)
                name = raw["name"].strip()
                if name not in presets:
                    raise ValueError(f"Unknown {series} brush: {name!r}; add an explicit stable preset mapping")
                slug, size, hint = presets[name]
                brush_id = series + "-" + slug
                if brush_id in seen_ids:
                    raise ValueError(f"Duplicate brush id: {brush_id}")
                seen_ids.add(brush_id)
                component = make_component(zfile, prefix, path.name, file_hash, raw, slug, masks, archive_blob)
                brush = {
                    "id": brush_id, "name": name, "group": GROUPS[series],
                    "size": size,
                    "opacity": raw.get("paintOpacity", 1.0),
                    "stabilizer": round(raw.get("plotSmoothing", 0.0) * 100),
                    "hint": hint,
                    **component,
                    "secondary": None,
                }
                if brush_id in ("chuishi-square", "haiguai-glow-airbrush"):
                    brush["samplesLayer"] = True
                entry = {"id": brush_id, "provenance": component["provenance"], "activeParameters": raw}
                secondary_path = prefix + "Sub01/Brush.archive"
                if secondary_path in members:
                    secondary_blob = zfile.read(secondary_path)
                    secondary_raw = unarchive(secondary_blob)
                    secondary = make_component(zfile, prefix + "Sub01/", path.name, file_hash,
                                               secondary_raw, slug + "-secondary", masks, secondary_blob)
                    brush["secondary"] = secondary
                    entry["secondary"] = {"provenance": secondary["provenance"], "activeParameters": secondary_raw}
                brushes.append(brush)
                entries.append(entry)
    if len(brushes) != len(PRESETS[series]):
        raise ValueError(f"Expected {len(PRESETS[series])} {series} brushes, received {len(brushes)}")
    sources = [component["source"] for brush in brushes for component in (brush, brush["secondary"]) if component]
    common_keys = sorted(set.intersection(*(set(source) for source in sources)))
    # Preserve exact floating-point values while avoiding repeated default names.
    defaults = {
        key: json.loads(collections.Counter(compact(source[key]) for source in sources).most_common(1)[0][0])
        for key in common_keys
    }
    for source in sources:
        for key in list(source):
            if key in defaults and compact(source[key]) == compact(defaults[key]):
                del source[key]
    data = {"brushes": brushes, "masks": masks}
    module = (
        "/* Generated by tools/convert_procreate_brushes.py. Source values are retained;\n"
        "   Canvas behavior is an adaptation, not the Procreate rendering engine.\n"
        "   Only supplied quantized tips/grains are embedded. See docs/drawing-" + series + "-brush-source.json. */\n"
        "(function (root, factory) {\n  'use strict';\n"
        "  const data = factory();\n"
        "  if (typeof module === 'object' && module.exports) module.exports = data;\n"
        "  else root." + EXPORTS[series] + " = data;\n"
        "})(typeof globalThis !== 'undefined' ? globalThis : this, function () {\n  'use strict';\n"
        "  const defaults = " + compact(defaults) + ";\n"
        "  const data = " + compact(data) + ";\n"
        "  data.brushes.forEach(function (brush) {\n"
        "    brush.source = Object.assign({}, defaults, brush.source);\n"
        "    if (brush.secondary) brush.secondary.source = Object.assign({}, defaults, brush.secondary.source);\n"
        "  });\n  return data;\n});\n"
    )
    provenance = {
        "series": series,
        "inputs": input_files,
        "conversion": {
            "converterVersion": 1,
            "pillowVersion": PILLOW_VERSION,
            "format": "NSKeyedArchiver inside ZIP; active Brush.archive and optional Sub01 only",
            "maskMaxDimension": MAX_MASK_DIMENSION,
            "maskResize": "Pillow LANCZOS, aspect ratio and full source extents retained; no enlargement",
            "maskQuantization": "nearest multiple of 17, 16 alpha levels",
            "maskEncoding": "base64 of run-length/alpha byte pairs; run length 1..255",
            "grainInversion": "Embedded grain grayscale is preserved; renderer applies textureInverted once",
            "sourceParameters": "all scalar parameters and pressure curves retained without rounding in JS; complete decoded active parameters below",
            "omitted": "Original files, Reset, author portraits, signatures, QuickLook previews and native binary color payloads",
            "sourceOrder": "brushset.plist order for a set; command-line input order for individual files",
            "limitations": [
                "No bundled Procreate grain or shape bitmap is reconstructed from its filename.",
                "Source enum values, size/count normalization and rendering equations are not claimed to be verified.",
                "Web pixel sizes and fallback textures are adaptation choices; original values remain available.",
                "Any maskInferredInversion is an explicit inferred correction, not a source flag; see component provenance.",
            ],
        },
        "brushes": entries,
        "module": {"bytes": len(module.encode("utf-8")), "sha256": sha256(module.encode("utf-8")), "maskCount": len(masks)},
    }
    return module, json.dumps(provenance, ensure_ascii=False, indent=2, allow_nan=False) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("inputs", nargs="+", type=Path, help="Supplied .brush or .brushset files")
    parser.add_argument("--series", required=True, choices=sorted(PRESETS))
    parser.add_argument("--output", type=Path, help="JS module destination")
    parser.add_argument("--manifest", type=Path, help="Text-only source provenance destination")
    parser.add_argument("--check", action="store_true", help="Check outputs without modifying them")
    args = parser.parse_args()
    output = args.output or ROOT / "assets/drawing-studio" / f"brushes-{args.series}-data.js"
    manifest = args.manifest or ROOT / "docs" / f"drawing-{args.series}-brush-source.json"
    module_text, manifest_text = convert(args.inputs, args.series)
    for path, text in ((output, module_text), (manifest, manifest_text)):
        encoded = text.encode("utf-8")
        if args.check:
            if not path.exists() or path.read_bytes() != encoded:
                raise SystemExit(f"Generated output differs: {path}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(encoded)
        print(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}: {len(encoded)} bytes; sha256 {sha256(encoded)}")


if __name__ == "__main__":
    main()
