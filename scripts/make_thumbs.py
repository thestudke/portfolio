"""生成 7 张项目缩略图（纯 SVG，无外部依赖）。
每个项目一种视觉母题，统一暗色调 + 细线 + 单点冰青高光。
用法: python make_thumbs.py
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "thumbs"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 1000
BG = "#0a0c0f"
INK = "rgba(232,234,237,0.16)"
INK2 = "rgba(232,234,237,0.30)"
ACC = "#9be7ff"


def head(title, gid):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{title}">
<defs>
  <radialGradient id="glow{gid}" cx="50%" cy="42%" r="62%">
    <stop offset="0%" stop-color="{ACC}" stop-opacity="0.20"/>
    <stop offset="55%" stop-color="{ACC}" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="{ACC}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fade{gid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="{ACC}" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="{ACC}" stop-opacity="0.02"/>
  </linearGradient>
  <pattern id="grid{gid}" width="80" height="80" patternUnits="userSpaceOnUse">
    <path d="M80 0H0V80" fill="none" stroke="rgba(232,234,237,0.055)" stroke-width="1"/>
  </pattern>
</defs>
<rect width="{W}" height="{H}" fill="{BG}"/>
<rect width="{W}" height="{H}" fill="url(#grid{gid})"/>
<rect width="{W}" height="{H}" fill="url(#glow{gid})"/>
"""


def foot():
    return "</svg>\n"


def cap(text, num):
    return (f'<text x="72" y="{H-64}" font-family="ui-monospace,Consolas,monospace" font-size="22" '
            f'letter-spacing="6" fill="rgba(232,234,237,0.34)">{num} / {text}</text>')


def thumb_agents():
    """01 诊小通：7 个 Agent 节点环绕中心编排器。"""
    g = head("multi agent orchestration", 1)
    cx, cy, R = W / 2, H / 2 - 20, 300
    nodes = []
    for i in range(7):
        a = -math.pi / 2 + i * (2 * math.pi / 7)
        nodes.append((cx + R * math.cos(a), cy + R * math.sin(a)))
    for i, (x, y) in enumerate(nodes):
        mx, my = (cx + x) / 2, (cy + y) / 2
        g += f'<path d="M{cx} {cy} Q{mx + 30} {my - 30} {x:.1f} {y:.1f}" fill="none" stroke="{INK}" stroke-width="1.4"/>'
    # 环形轨道
    g += f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="3 9"/>'
    g += f'<circle cx="{cx}" cy="{cy}" r="{R*0.62}" fill="none" stroke="rgba(232,234,237,0.07)" stroke-width="1"/>'
    for i, (x, y) in enumerate(nodes):
        r = 13 if i % 3 else 17
        col = ACC if i == 0 else INK2
        g += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="#0e1216" stroke="{col}" stroke-width="1.6"/>'
        g += (f'<text x="{x:.1f}" y="{y+4:.1f}" font-family="ui-monospace,Consolas,monospace" font-size="12" '
              f'text-anchor="middle" fill="rgba(232,234,237,0.55)">{i+1:02d}</text>')
    g += (f'<circle cx="{cx}" cy="{cy}" r="46" fill="#0d1216" stroke="{ACC}" stroke-width="1.6" stroke-opacity="0.8"/>'
          f'<circle cx="{cx}" cy="{cy}" r="66" fill="none" stroke="{ACC}" stroke-width="1" stroke-opacity="0.18"/>'
          f'<text x="{cx}" y="{cy+7}" font-family="ui-monospace,Consolas,monospace" font-size="19" '
          f'text-anchor="middle" fill="{ACC}">ORCH</text>')
    g += cap("AGENT GRAPH", "01")
    return g + foot()


def thumb_rag():
    """02 年报 RAG：页面→切片→向量→带页码引用。"""
    g = head("retrieval augmented generation", 2)
    random.seed(7)
    # 左侧文档页
    for p in range(3):
        x = 150 + p * 96
        y = 250 + p * 16
        g += (f'<rect x="{x}" y="{y}" width="180" height="470" rx="6" fill="#0d1014" stroke="{INK}"/>')
        for ln in range(11):
            w = random.randint(70, 140)
            g += (f'<rect x="{x+22}" y="{y+34+ln*38}" width="{w}" height="3" rx="1.5" '
                  f'fill="rgba(232,234,237,{0.10 + random.random()*0.14:.2f})"/>')
        if p == 0:
            g += f'<rect x="{x+22}" y="{y+196}" width="132" height="66" fill="none" stroke="{ACC}" stroke-opacity="0.45" stroke-dasharray="4 4"/>'
    # 中间流向
    for i in range(9):
        y = 300 + i * 46
        g += (f'<path d="M420 {y} C560 {y}, 620 {y-30}, 740 {y-16}" fill="none" stroke="{INK}" '
              f'stroke-width="1.2" stroke-dasharray="2 6"/>')
    # 右侧向量点阵
    random.seed(3)
    for i in range(8):
        for j in range(6):
            x, y = 800 + i * 78, 250 + j * 78
            r = 2.6 if random.random() > 0.25 else 4.6
            op = random.choice([0.16, 0.22, 0.3, 0.42])
            g += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{ACC}" fill-opacity="{op}"/>'
    for i in range(5):
        a = (800 + random.randint(0, 7) * 78, 250 + random.randint(0, 5) * 78)
        b = (800 + random.randint(0, 7) * 78, 250 + random.randint(0, 5) * 78)
        g += f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{ACC}" stroke-opacity="0.14" stroke-width="1"/>'
    # 引用标签
    g += (f'<rect x="1180" y="560" width="300" height="120" rx="8" fill="#0d1216" stroke="rgba(155,231,255,0.35)"/>'
          f'<text x="1210" y="606" font-family="ui-monospace,Consolas,monospace" font-size="17" fill="{ACC}">[第 7 页]</text>'
          f'<rect x="1210" y="626" width="200" height="3" rx="1.5" fill="rgba(232,234,237,0.22)"/>'
          f'<rect x="1210" y="644" width="150" height="3" rx="1.5" fill="rgba(232,234,237,0.14)"/>')
    g += cap("HYBRID RETRIEVAL", "02")
    return g + foot()


def thumb_ecom():
    """03 电商：漏斗 + RFM 散点。"""
    g = head("behavior funnel analytics", 3)
    steps = [("VIEW", 1.0), ("CLICK", 0.534), ("CART", 0.266), ("BUY", 0.162), ("REVIEW", 0.066)]
    top, rowh = 200, 96
    for i, (name, ratio) in enumerate(steps):
        w = 620 * ratio
        x = 120 + (620 - w) / 2
        y = top + i * (rowh + 14)
        op = 0.5 - i * 0.075
        g += (f'<rect x="{x:.0f}" y="{y}" width="{w:.0f}" height="{rowh}" rx="3" fill="url(#fade3)" '
              f'fill-opacity="{op:.2f}" stroke="rgba(155,231,255,{0.30 - i*0.045:.2f})"/>')
        g += (f'<text x="{x-18:.0f}" y="{y+rowh/2+6}" font-family="ui-monospace,Consolas,monospace" font-size="15" '
              f'text-anchor="end" fill="rgba(232,234,237,0.55)">{name}</text>')
        g += (f'<text x="{x+w+16:.0f}" y="{y+rowh/2+6}" font-family="ui-monospace,Consolas,monospace" font-size="15" '
              f'fill="rgba(232,234,237,{0.85-i*0.12:.2f})">{ratio*100:.1f}%</text>')
    # 右侧 RFM 散点
    random.seed(11)
    for _ in range(210):
        cx = 900 + random.gauss(0, 1) * 150 + 190
        cy = 540 - random.gauss(0, 1) * 130
        if not (780 < cx < 1490 and 250 < cy < 830):
            continue
        r = random.choice([1.8, 2.2, 2.8, 3.6])
        op = random.choice([0.2, 0.3, 0.45, 0.6])
        g += f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r}" fill="{ACC}" fill-opacity="{op}"/>'
    g += (f'<line x1="780" y1="860" x2="1500" y2="860" stroke="{INK}"/>'
          f'<line x1="780" y1="230" x2="780" y2="860" stroke="{INK}"/>'
          f'<text x="780" y="196" font-family="ui-monospace,Consolas,monospace" font-size="15" '
          f'fill="rgba(232,234,237,0.4)">RFM × 31,984 USERS</text>')
    g += cap("FUNNEL + SEGMENTATION", "03")
    return g + foot()


def thumb_pipeline():
    """04 实习：分层架构 + 工作流节点。"""
    g = head("llm application engineering", 4)
    layers = [("ROUTER", 0.9), ("SERVICE", 0.75), ("DAO", 0.55), ("STORAGE", 0.35)]
    for i, (name, op) in enumerate(layers):
        x = 140 + i * 62
        y = 230 + i * 34
        w, h = 520 - i * 26, 140
        g += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="#0c1014" stroke="rgba(232,234,237,{0.10+op*0.16:.2f})"/>'
        g += (f'<text x="{x+24}" y="{y+40}" font-family="ui-monospace,Consolas,monospace" font-size="15" '
              f'letter-spacing="5" fill="rgba(232,234,237,{0.25+op*0.5:.2f})">{name}</text>')
        for k in range(4):
            g += f'<rect x="{x+24+k*84}" y="{y+72}" width="58" height="4" rx="2" fill="rgba(232,234,237,{0.06+op*0.12:.2f})"/>'
    # 右侧 LangGraph 流程
    nodes = [(1080, 300), (1260, 420), (1080, 540), (1260, 660)]
    for i in range(len(nodes) - 1):
        g += (f'<path d="M{nodes[i][0]} {nodes[i][1]} C{(nodes[i][0]+nodes[i+1][0])/2} {nodes[i][1]}, '
              f'{(nodes[i][0]+nodes[i+1][0])/2} {nodes[i+1][1]}, {nodes[i+1][0]} {nodes[i+1][1]}" '
              f'fill="none" stroke="{INK2}" stroke-width="1.3"/>')
    for i, (x, y) in enumerate(nodes):
        col = ACC if i == 0 else "rgba(232,234,237,0.5)"
        g += f'<rect x="{x-72}" y="{y-26}" width="144" height="52" rx="26" fill="#0d1216" stroke="{col}" stroke-width="1.4"/>'
        g += (f'<text x="{x}" y="{y+5}" font-family="ui-monospace,Consolas,monospace" font-size="13" '
              f'text-anchor="middle" fill="rgba(232,234,237,0.6)">NODE {i+1}</text>')
    g += cap("STATEGRAPH WORKFLOW", "04")
    return g + foot()


def thumb_crawl():
    """05 采集：蛛网 + 数据流。"""
    g = head("web scraping infrastructure", 5)
    cx, cy = 520, 520
    for ring in range(1, 8):
        r = ring * 62
        g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="rgba(232,234,237,{0.16-ring*0.016:.2f})"/>'
    for i in range(14):
        a = i * (2 * math.pi / 14)
        g += (f'<line x1="{cx}" y1="{cy}" x2="{cx+7*62*math.cos(a):.1f}" y2="{cy+7*62*math.sin(a):.1f}" '
              f'stroke="rgba(232,234,237,0.10)"/>')
    random.seed(21)
    for _ in range(40):
        ring = random.randint(1, 7)
        a = random.random() * 2 * math.pi
        g += f'<circle cx="{cx+ring*62*math.cos(a):.1f}" cy="{cy+ring*62*math.sin(a):.1f}" r="2.4" fill="{ACC}" fill-opacity="0.45"/>'
    g += f'<circle cx="{cx}" cy="{cy}" r="9" fill="{ACC}" fill-opacity="0.7"/>'
    # 右侧落库
    for i in range(12):
        y = 250 + i * 42
        w = 380 - (i % 5) * 46
        g += f'<rect x="1010" y="{y}" width="{w}" height="{16 if i%3 else 26}" rx="3" fill="rgba(232,234,237,{0.05+ (i%4)*0.03:.2f})" stroke="{INK}"/>'
    g += (f'<text x="1010" y="212" font-family="ui-monospace,Consolas,monospace" font-size="15" '
          f'letter-spacing="4" fill="rgba(232,234,237,0.4)">548 NODES / 594 EDGES</text>')
    g += cap("SPIDER + GRAPH", "05")
    return g + foot()


def thumb_fullstack():
    """06 宠物平台：双端界面 + 对话气泡。"""
    g = head("full stack platform", 6)
    g += ('<rect x="140" y="220" width="560" height="560" rx="10" fill="#0c1014" stroke="{ink}"/>'
          '<rect x="140" y="220" width="560" height="46" rx="10" fill="#11161b"/>'
          '<circle cx="172" cy="243" r="6" fill="rgba(232,234,237,0.2)"/>'
          '<circle cx="194" cy="243" r="6" fill="rgba(232,234,237,0.13)"/>').format(ink=INK)
    for i in range(3):
        for j in range(2):
            g += (f'<rect x="{176+i*172}" y="{300+j*168}" width="148" height="140" rx="6" fill="#0f1419" stroke="{INK}"/>'
                  f'<circle cx="{250+i*172}" cy="{356+j*168}" r="24" fill="none" stroke="rgba(232,234,237,0.22)"/>'
                  f'<rect x="{196+i*172}" y="{398+j*168}" width="86" height="4" rx="2" fill="rgba(232,234,237,0.16)"/>')
    # 对话面板
    g += (f'<rect x="760" y="300" width="560" height="380" rx="10" fill="#0c1014" stroke="{INK}"/>'
          f'<rect x="792" y="344" width="300" height="52" rx="8" fill="#10161b" stroke="rgba(232,234,237,0.10)"/>'
          f'<rect x="880" y="420" width="408" height="86" rx="8" fill="rgba(155,231,255,0.06)" stroke="rgba(155,231,255,0.28)"/>'
          f'<rect x="792" y="530" width="240" height="46" rx="8" fill="#10161b" stroke="rgba(232,234,237,0.10)"/>'
          f'<circle cx="1288" cy="596" r="7" fill="{ACC}" fill-opacity="0.65"/>')
    g += (f'<text x="880" y="470" font-family="ui-monospace,Consolas,monospace" font-size="15" '
          f'fill="rgba(232,234,237,0.55)">recommend(pet) → 橘宝 · 3个月</text>')
    g += cap("FULL STACK + CHAT", "06")
    return g + foot()


def thumb_viz():
    """07 可视化：地理散点 + 热力矩阵。"""
    g = head("data visualization", 7)
    random.seed(33)
    # 左：地图散点近似中国轮廓分布
    pts = []
    for _ in range(320):
        x = 160 + random.random() * 520
        y = 260 + random.random() * 460
        # 粗略的东密西疏
        if (x - 160) / 520 > random.random() * 0.85 + 0.1:
            continue
        pts.append((x, y))
    for x, y in pts:
        r = random.choice([1.6, 2.2, 3.0])
        g += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{ACC}" fill-opacity="{random.choice([0.18,0.28,0.4,0.55])}"/>'
    g += (f'<rect x="150" y="240" width="540" height="500" fill="none" stroke="{INK}" stroke-dasharray="5 7"/>')
    # 右：热力矩阵
    rows, cols = 9, 12
    for i in range(rows):
        for j in range(cols):
            v = random.random()
            g += (f'<rect x="{800+j*56}" y="{270+i*56}" width="52" height="52" rx="2" '
                  f'fill="{ACC}" fill-opacity="{0.04 + v*0.42:.2f}"/>')
    g += (f'<text x="800" y="244" font-family="ui-monospace,Consolas,monospace" font-size="15" '
          f'letter-spacing="4" fill="rgba(232,234,237,0.4)">COHORT × SEASONALITY</text>')
    g += cap("GEO + HEATMAP", "07")
    return g + foot()


writers = [
    ("01-agents.svg", thumb_agents),
    ("02-rag.svg", thumb_rag),
    ("03-ecom.svg", thumb_ecom),
    ("04-intern.svg", thumb_pipeline),
    ("05-crawl.svg", thumb_crawl),
    ("06-fullstack.svg", thumb_fullstack),
    ("07-viz.svg", thumb_viz),
]

for name, fn in writers:
    svg = fn()
    (OUT / name).write_text(svg, encoding="utf-8")
    print(f"{name:18s} {(OUT / name).stat().st_size / 1024:6.1f} KB")

print("done ->", OUT)
