import pathlib

base = pathlib.Path(__file__).parent
csv_path = base / "Ex6_TVdata.csv" / "Ex6_TVdata.csv"
if not csv_path.exists():
    csv_path = base / "Ex6_TVdata.csv"
csv_text = csv_path.read_text(encoding="utf-8").strip()
(base / "embeddedData.js").write_text(
    "// Embedded CSV for file:// (avoids CORS)\n"
    f"window.EMBEDDED_TV_DATA = {csv_text!r};\n",
    encoding="utf-8",
)
print("embeddedData.js written", len(csv_text), "chars")
