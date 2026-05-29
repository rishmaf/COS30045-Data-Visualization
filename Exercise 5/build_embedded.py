import pathlib

base = pathlib.Path(__file__).parent
root = base.parent

prices = (base / "Ex5_ARE_Spot_Prices.csv").read_text(encoding="utf-8").strip()
tv_models = (base / "Ex5_TV_energy.csv").read_text(encoding="utf-8").strip()
tv_55 = (base / "Ex5_TV_energy_55inchtv_byScreenType.csv").read_text(encoding="utf-8").strip()
tv_all = (base / "Ex5_TV_energy_Allsizes_byScreenType.csv").read_text(encoding="utf-8").strip()

ex6_path = root / "exercise 6.2" / "Ex6_TVdata.csv" / "Ex6_TVdata.csv"
if not ex6_path.exists():
    ex6_path = root / "exercise 6.2" / "Ex6_TVdata.csv"
ex6_tv = ex6_path.read_text(encoding="utf-8").strip() if ex6_path.exists() else ""

parts = [
    "// Embedded CSV for file:// (W5 + scatter)\n",
    f"window.EMBEDDED_PRICES_CSV = {prices!r};\n\n",
    f"window.EMBEDDED_TV_CSV = {tv_models!r};\n\n",
    f"window.EMBEDDED_TV_55 = {tv_55!r};\n\n",
    f"window.EMBEDDED_TV_ALL = {tv_all!r};\n",
]
if ex6_tv:
    parts.append(f"\nwindow.EMBEDDED_TV_DATA = {ex6_tv!r};\n")

(base / "embeddedData.js").write_text("".join(parts), encoding="utf-8")
print("embeddedData.js written", "(with scatter data)" if ex6_tv else "(scatter CSV not found)")
