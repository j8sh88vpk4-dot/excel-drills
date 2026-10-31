"""Kleiner QR-Code-Encoder ohne Abhängigkeiten (für die Formelkarten, scripts/handouts/build.py).

Umfang nach ISO/IEC 18004, nur was die Formelkarten brauchen:
  Byte-Modus, Fehlerkorrektur M, Version 1 bis 4 (automatisch, max. 62 Bytes),
  Reed-Solomon über GF(256) (Polynom 0x11D), alle 8 Masken mit Strafpunkt-Bewertung.
Ab Version 5 kämen Versionsinformation und mehr Blöcke dazu; das ist bewusst nicht umgesetzt.

  from qr import svg
  svg("https://excel-drills.ch/artikel/sverweis.html", title="QR-Code ...")
Selbsttest: python3 scripts/handouts/qr.py "https://excel-drills.ch/"  (gibt das SVG aus)
"""
import html

# Version: (Datenkodewörter gesamt, EC-Kodewörter pro Block, Anzahl Blöcke) für Level M
_M = {1: (16, 10, 1), 2: (28, 16, 1), 3: (44, 26, 1), 4: (64, 18, 2)}
_ALIGN = {1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26]}
_REMAINDER = {1: 0, 2: 7, 3: 7, 4: 7}

# GF(256) Tabellen
_EXP = [0] * 512
_LOG = [0] * 256
_x = 1
for _i in range(255):
    _EXP[_i] = _x
    _LOG[_x] = _i
    _x <<= 1
    if _x & 0x100:
        _x ^= 0x11D
for _i in range(255, 512):
    _EXP[_i] = _EXP[_i - 255]


def _mul(a, b):
    return 0 if a == 0 or b == 0 else _EXP[_LOG[a] + _LOG[b]]


def _rs_generator(n):
    g = [1]
    for i in range(n):
        # g(x) *= (x - a^i), Koeffizienten höchste Potenz zuerst
        ng = [0] * (len(g) + 1)
        for j, c in enumerate(g):
            ng[j] ^= c
            ng[j + 1] ^= _mul(c, _EXP[i])
        g = ng
    return g


def _rs_remainder(data, n):
    g = _rs_generator(n)
    rem = [0] * n
    for b in data:
        f = b ^ rem[0]
        rem = rem[1:] + [0]
        for i in range(n):
            rem[i] ^= _mul(g[i + 1], f)
    return rem


def _codewords(payload):
    for ver in (1, 2, 3, 4):
        ndata, nec, nblocks = _M[ver]
        if 4 + 8 + 8 * len(payload) <= ndata * 8:
            break
    else:
        raise ValueError(f"Text zu lang für Version 4-M ({len(payload)} Bytes, max. 62)")
    bits = [0, 1, 0, 0] + [int(c) for c in f"{len(payload):08b}"]
    for b in payload:
        bits += [int(c) for c in f"{b:08b}"]
    cap = ndata * 8
    bits += [0] * min(4, cap - len(bits))  # Terminator
    bits += [0] * (-len(bits) % 8)
    data = [int("".join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
    pad = 0
    while len(data) < ndata:
        data.append((0xEC, 0x11)[pad % 2]); pad += 1
    size = ndata // nblocks
    blocks = [data[i * size:(i + 1) * size] for i in range(nblocks)]
    ecs = [_rs_remainder(b, nec) for b in blocks]
    out = [b[i] for i in range(size) for b in blocks] + [e[i] for i in range(nec) for e in ecs]
    return ver, out


_MASKS = [
    lambda x, y: (x + y) % 2 == 0,
    lambda x, y: y % 2 == 0,
    lambda x, y: x % 3 == 0,
    lambda x, y: (x + y) % 3 == 0,
    lambda x, y: (x // 3 + y // 2) % 2 == 0,
    lambda x, y: (x * y) % 2 + (x * y) % 3 == 0,
    lambda x, y: ((x * y) % 2 + (x * y) % 3) % 2 == 0,
    lambda x, y: ((x + y) % 2 + (x * y) % 3) % 2 == 0,
]


class _Grid:
    def __init__(self, ver):
        self.size = n = ver * 4 + 17
        self.m = [[False] * n for _ in range(n)]
        self.fn = [[False] * n for _ in range(n)]
        self._functions(ver)

    def set(self, x, y, dark):
        self.m[y][x] = dark
        self.fn[y][x] = True

    def _functions(self, ver):
        n = self.size
        for i in range(n):  # Timing
            self.set(6, i, i % 2 == 0)
            self.set(i, 6, i % 2 == 0)
        for cx, cy in ((3, 3), (n - 4, 3), (3, n - 4)):  # Finder + Trennlinien
            for dy in range(-4, 5):
                for dx in range(-4, 5):
                    x, y = cx + dx, cy + dy
                    if 0 <= x < n and 0 <= y < n:
                        self.set(x, y, max(abs(dx), abs(dy)) not in (2, 4))
        pos = _ALIGN[ver]
        for cy in pos:
            for cx in pos:
                if (cx, cy) in ((6, 6), (6, pos[-1]), (pos[-1], 6)):
                    continue
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        self.set(cx + dx, cy + dy, max(abs(dx), abs(dy)) != 1)
        self.format_bits(0)  # reserviert, wird nach der Maskierung überschrieben

    def format_bits(self, mask):
        n = self.size
        data = (0b00 << 3) | mask  # Level M = 00
        rem = data
        for _ in range(10):
            rem = (rem << 1) ^ ((rem >> 9) * 0x537)
        bits = ((data << 10) | rem) ^ 0x5412
        bit = lambda i: (bits >> i) & 1 == 1
        for i in range(6):
            self.set(8, i, bit(i))
        self.set(8, 7, bit(6))
        self.set(8, 8, bit(7))
        self.set(7, 8, bit(8))
        for i in range(9, 15):
            self.set(14 - i, 8, bit(i))
        for i in range(8):
            self.set(n - 1 - i, 8, bit(i))
        for i in range(8, 15):
            self.set(8, n - 15 + i, bit(i))
        self.set(8, n - 8, True)  # dunkles Modul

    def place(self, codewords):
        n = self.size
        total = len(codewords) * 8
        i = 0
        right = n - 1
        while right >= 1:
            if right == 6:
                right = 5
            upward = ((right + 1) & 2) == 0
            for vert in range(n):
                y = n - 1 - vert if upward else vert
                for j in range(2):
                    x = right - j
                    if not self.fn[y][x] and i < total:
                        self.m[y][x] = (codewords[i >> 3] >> (7 - (i & 7))) & 1 == 1
                        i += 1
            right -= 2

    def apply_mask(self, k):
        f = _MASKS[k]
        for y in range(self.size):
            for x in range(self.size):
                if not self.fn[y][x] and f(x, y):
                    self.m[y][x] = not self.m[y][x]

    def penalty(self):
        n, m = self.size, self.m
        score = 0
        lines = [row[:] for row in m] + [[m[y][x] for y in range(n)] for x in range(n)]
        for line in lines:
            run, prev = 0, None
            for v in line:  # N1: 5+ gleiche in Folge
                if v == prev:
                    run += 1
                else:
                    if run >= 5:
                        score += run - 2
                    run, prev = 1, v
            if run >= 5:
                score += run - 2
            s = "".join("1" if v else "0" for v in line)  # N3: Finder-ähnliche Muster
            padded = "0000" + s + "0000"
            for pat in ("10111010000", "00001011101"):
                start = padded.find(pat)
                while start != -1:
                    score += 40
                    start = padded.find(pat, start + 1)
        for y in range(n - 1):  # N2: 2x2-Blöcke
            for x in range(n - 1):
                if m[y][x] == m[y][x + 1] == m[y + 1][x] == m[y + 1][x + 1]:
                    score += 3
        dark = sum(v for row in m for v in row)  # N4: Verhältnis hell/dunkel
        score += (abs(dark * 20 - n * n * 10) + n * n - 1) // (n * n) * 10
        return score


def matrix(text):
    """Gibt die Modulmatrix (Liste von Zeilen, True = dunkel) zurück."""
    ver, cw = _codewords(text.encode("utf-8"))
    best = None
    for k in range(8):
        g = _Grid(ver)
        g.place(cw)
        g.apply_mask(k)
        g.format_bits(k)
        p = g.penalty()
        if best is None or p < best[0]:
            best = (p, g)
    return best[1].m


def svg(text, title=None, quiet=4):
    m = matrix(text)
    n = len(m) + 2 * quiet
    d = "".join(f"M{x + quiet} {y + quiet}h1v1h-1z" for y, row in enumerate(m) for x, v in enumerate(row) if v)
    label = html.escape(title or f"QR-Code: {text}", quote=True)
    return (f'<svg class="qr-code" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" role="img" aria-label="{label}" shape-rendering="crispEdges">'
            f'<rect width="{n}" height="{n}" fill="#fff"/><path fill="#000" d="{d}"/></svg>')


if __name__ == "__main__":
    import sys
    print(svg(sys.argv[1] if len(sys.argv) > 1 else "https://excel-drills.ch/"))
