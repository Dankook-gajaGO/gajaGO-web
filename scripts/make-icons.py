"""앱 아이콘 생성: 청록 배경 + 흰 종이비행기. 실행: python scripts/make-icons.py"""
import struct
import zlib
from pathlib import Path

TEAL = (20, 184, 166)
WHITE = (255, 255, 255)
SHADE = (204, 251, 241)   # 비행기 아래 날개
FOLD = (153, 246, 228)    # 접힌 면

# 종이비행기 (0~1 좌표, 오른쪽 위를 향함)
TIP, LEFT, CREASE, BOTTOM, FOLD_PT = (0.80, 0.22), (0.18, 0.50), (0.45, 0.57), (0.55, 0.82), (0.42, 0.70)
SHAPES = [
    ((LEFT, TIP, CREASE), WHITE),
    ((CREASE, TIP, BOTTOM), SHADE),
    ((CREASE, BOTTOM, FOLD_PT), FOLD),
]
TRAIL = [((0.30, 0.76), 0.022), ((0.21, 0.83), 0.018), ((0.13, 0.89), 0.014)]


def inside(pt, tri):
    (x, y), (a, b, c) = pt, tri
    def side(p, q):
        return (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])
    s1, s2, s3 = side(a, b), side(b, c), side(c, a)
    return (s1 >= 0 and s2 >= 0 and s3 >= 0) or (s1 <= 0 and s2 <= 0 and s3 <= 0)


def color_at(x, y, scale, bg):
    # scale < 1 이면 그림을 가운데로 축소 (적응형 아이콘 안전 영역)
    u, v = (x - 0.5) / scale + 0.5, (y - 0.5) / scale + 0.5
    for tri, col in SHAPES:
        if inside((u, v), tri):
            return col + (255,)
    for (cx, cy), r in TRAIL:
        if (u - cx) ** 2 + (v - cy) ** 2 <= r * r:
            return WHITE + (255,)
    return bg


def render(size, scale, bg, ss=2):
    rows = []
    for py in range(size):
        row = bytearray(b'\x00')
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    c = color_at((px + (sx + 0.5) / ss) / size, (py + (sy + 0.5) / ss) / size, scale, bg)
                    for i in range(4):
                        acc[i] += c[i]
            n = ss * ss
            a = acc[3] / n
            # 투명 배경과 섞일 때 색이 어두워지지 않게 알파 기준으로 색 보정
            rgb = [round(acc[i] * 255 / acc[3]) if acc[3] else 0 for i in range(3)]
            row += bytes(rgb + [round(a)])
        rows.append(bytes(row))
    return rows


def write_png(path, size, rows):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    raw = b''.join(rows)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    Path(path).write_bytes(png)


if __name__ == '__main__':
    out = Path(__file__).resolve().parent.parent / 'assets'
    out.mkdir(exist_ok=True)
    bg = TEAL + (255,)
    write_png(out / 'icon.png', 1024, render(1024, 0.86, bg))
    write_png(out / 'adaptive-icon.png', 1024, render(1024, 0.62, (0, 0, 0, 0)))
    write_png(out / 'favicon.png', 196, render(196, 0.9, bg, ss=4))
    print('assets/icon.png, adaptive-icon.png, favicon.png')
