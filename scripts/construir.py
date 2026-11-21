"""Atajo para VS Code: ejecuta `python scripts/construir.py` (o F5 con la configuración incluida).

Lee datos/macro_colombia.csv (o el tablero que pases con --tablero), corre el
modelo y regenera web/data/datos.js, la plantilla en Excel y el HTML único.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from nutresa_sim.__main__ import main  # noqa: E402

if __name__ == "__main__":
    if len(sys.argv) == 1:
        sys.argv.append("construir")
    main()
