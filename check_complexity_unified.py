"""
==============================================================================
Kage OS データベース複雑度診断ツール
==============================================================================

目的:
  テーブル間の依存関係を数理的に分析し、スパゲッティ化を検出する

主要機能:
  1. グラフ密度の計算（疎結合度の評価）
  2. 伝播コストの計算（変更の影響範囲の評価）
  3. DSM（依存構造行列）の生成
  4. 島（モジュール）間の境界違反検出
  5. 中心性分析（最も依存されるテーブルの特定）

理論的背景:
  - グラフ理論（NetworkX）
  - Design Structure Matrix（DSM）手法
  - モジュラーアーキテクチャの原則

使用方法:
  python check_complexity_unified.py

出力:
  - 全体統計（密度、伝播コスト）
  - 島の健康診断（サイズ、絶縁率）
  - DSM行列（25×25）
  - 集約行列（10×10）
  - 境界違反の詳細
  - 最終判定

依存パッケージ:
  - networkx: グラフ理論計算
  - numpy: 行列演算
==============================================================================
"""

import networkx as nx
import numpy as np

# ==============================================================================
# Kage OS データベース複雑度診断ツール
# 目的: テーブル間の依存関係を数理的に分析し、スパゲッティ化を検出する
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. 島（集約）の定義
# 機能: 25テーブルを10の機能的な「島」にグループ化
# ------------------------------------------------------------------------------
islands = {
    "Core_Identity": ["auth.users", "profiles"],
    "Shared_Knowledge": ["compliance_knowledge_base", "accommodation_card_master"],
    "Evidence_Fortress": ["diagnosis_evidence"],
    "Measurement": ["assessment_results", "pulse_survey_results"],
    "Economics": ["subscriptions", "share_links", "link_access_logs"],
    "Game": ["user_items", "avatar_class_master"],
    "Org_Structure": ["organizations", "organization_members", "org_teams", "org_assignments"],
    "Recruitment": ["recruitment_campaigns", "assessment_invites", "candidate_profiles", "interview_questions", "interview_results"],
    "Support": ["accommodation_agreements", "accommodation_logs"],
    "Community": ["community_questions", "community_answers"],
}

# ------------------------------------------------------------------------------
# 2. 依存関係（REFERENCES：外部キー制約）
# 機能: SQLのFOREIGN KEY制約に基づく依存関係を定義
# ------------------------------------------------------------------------------
edges = [
    ("profiles", "auth.users"),
    ("diagnosis_evidence", "profiles"),
    ("share_links", "profiles"),
    ("subscriptions", "auth.users"),
    ("assessment_results", "auth.users"),
    ("pulse_survey_results", "auth.users"),
    ("user_items", "profiles"),
    ("user_items", "accommodation_card_master"),
    ("organizations", "auth.users"),
    ("organization_members", "organizations"),
    ("organization_members", "auth.users"),
    ("org_teams", "organizations"),
    ("org_teams", "org_teams"),  # 自己参照
    ("org_assignments", "org_teams"),
    ("org_assignments", "auth.users"),
    ("recruitment_campaigns", "organizations"),
    ("assessment_invites", "organizations"),
    ("assessment_invites", "recruitment_campaigns"),
    ("assessment_invites", "auth.users"),
    ("candidate_profiles", "organizations"),
    ("candidate_profiles", "profiles"),
    ("candidate_profiles", "recruitment_campaigns"),
    ("interview_results", "organizations"),
    ("interview_results", "profiles"),
    ("interview_results", "interview_questions"),
    ("interview_results", "auth.users"),
    ("accommodation_agreements", "organizations"),
    ("accommodation_agreements", "auth.users"),
    ("accommodation_logs", "organizations"),
    ("accommodation_logs", "auth.users"),
    ("community_questions", "auth.users"),
    ("community_answers", "community_questions"),
    ("community_answers", "auth.users"),
    ("link_access_logs", "share_links"),  # 境界違反候補
]

# ------------------------------------------------------------------------------
# 3. グラフ構築
# 機能: NetworkXの有向グラフとして依存関係をモデル化
# ------------------------------------------------------------------------------
G = nx.DiGraph()
for members in islands.values():
    G.add_nodes_from(members)
G.add_edges_from(edges)

# ------------------------------------------------------------------------------
# 4. 順序付きノードリスト（島ごとの並び）
# 機能: DSM行列作成のため、島の順序に従ってノードを並べる
# ------------------------------------------------------------------------------
ordered_nodes = []
island_boundaries = [0]  # 境界インデックス
for island, members in islands.items():
    ordered_nodes.extend(members)
    island_boundaries.append(island_boundaries[-1] + len(members))

# ------------------------------------------------------------------------------
# 5. DSM行列の作成
# 機能: 依存構造行列（Design Structure Matrix）を生成
# 説明: 行=Consumer（依存する側）、列=Provider（依存される側）
# ------------------------------------------------------------------------------
N = len(ordered_nodes)
matrix = np.zeros((N, N), dtype=int)
node_to_idx = {node: i for i, node in enumerate(ordered_nodes)}

for u, v in edges:
    row = node_to_idx[u]  # Consumer (依存する側)
    col = node_to_idx[v]  # Provider (依存される側)
    matrix[row, col] = 1

# ------------------------------------------------------------------------------
# 6. V1分析：全体統計
# 機能: グラフ密度、伝播コスト、中心性分析
# ------------------------------------------------------------------------------
E = len(edges)
density = nx.density(G)
tc = nx.transitive_closure(G)
propagation_cost = nx.density(tc)

in_degree = dict(G.in_degree())
out_degree = dict(G.out_degree())
most_depended = sorted(in_degree.items(), key=lambda x: x[1], reverse=True)[:5]
most_dependent = sorted(out_degree.items(), key=lambda x: x[1], reverse=True)[:5]

# ------------------------------------------------------------------------------
# 7. V2分析：島と境界違反
# 機能: 島間の逆流（上流が下流に依存する不正な依存）を検出
# ------------------------------------------------------------------------------
island_order = list(islands.keys())
node_to_island = {node: island for island, members in islands.items() for node in members}

violations = []
cross_island_edges = []
for u, v in edges:
    u_island = node_to_island[u]
    v_island = node_to_island[v]
    
    if u_island != v_island:
        cross_island_edges.append((u, v))
    
    u_island_idx = island_order.index(u_island)
    v_island_idx = island_order.index(v_island)
    
    if u_island_idx < v_island_idx:  # 上流が下流に依存（逆流）
        violations.append({
            'from': u, 
            'to': v, 
            'from_island': u_island, 
            'to_island': v_island,
            'row': node_to_idx[u],
            'col': node_to_idx[v]
        })

insulation_rate = (1 - len(cross_island_edges) / E) * 100 if E > 0 else 100

# ==============================================================================
# 診断結果の出力
# ==============================================================================

print("=" * 80)
print("【Kage OS データベース複雑度診断レポート】")
print("=" * 80)

# ------------------------------------------------------------------------------
# V1: 全体統計（グラフ理論による複雑度指標）
# ------------------------------------------------------------------------------
print("\n" + "=" * 80)
print("[全体統計分析：グラフ理論指標]")
print("=" * 80)
print(f"  ノード数 (N):      {N} テーブル")
print(f"  エッジ数 (E):      {E} 本の依存関係")
print(f"  平均次数:          {2*E/N:.2f} (1テーブルあたりの平均接続数)")
print(f"\n  グラフ密度 (D):    {density:.4f}  {'[OK] 疎結合' if density < 0.2 else '[WARNING] 密結合に注意'}")
print(f"                      (理想: 0.2以下, 警戒: 0.3以上)")
print(f"  伝播コスト (PC):   {propagation_cost:.4f}  {'[OK]' if propagation_cost < 0.1 else '[MODERATE]'}")
print(f"                      (理想: 0.1以下)")

print(f"\n  最も依存される TOP5 (多くのテーブルから参照される):")
for i, (table, degree) in enumerate(most_depended, 1):
    print(f"    {i}. {table:30s} <- {degree:2d}テーブルから参照")

print(f"\n  最も依存する TOP5 (多くのテーブルを参照する):")
for i, (table, degree) in enumerate(most_dependent, 1):
    print(f"    {i}. {table:30s} -> {degree:2d}テーブルを参照")

# --- V2: 島の分析 ---
print("\n" + "=" * 80)
print("[島（モジュール）の健康診断]")
print("=" * 80)

for i, (island, members) in enumerate(islands.items()):
    size = len(members)
    status = "[SAFE]" if size <= 5 else "[WARNING: TOO BIG]"
    print(f"  [{i}] {island:20s}: {size:2d} tables {status}")
    for member in members:
        idx = ordered_nodes.index(member)
        print(f"      [{idx:2d}] {member}")
    print()

print(f"\n  絶縁率（島間の分離度）:")
print(f"    島を跨ぐ接続:     {len(cross_island_edges)} / {E}")
print(f"    島内の接続:       {E - len(cross_island_edges)} / {E}")
print(f"    絶縁率:           {insulation_rate:.1f}%")

# --- 境界違反の詳細 ---
print("\n" + "=" * 80)
print("[境界違反の監視：逆流依存の検出]")
print("=" * 80)

if violations:
    print(f"  [ALERT] {len(violations)}個の逆流（右上の1）を発見しました！")
    print(f"  これは「上流が下流に依存している」ことを意味します。\n")
    for v in violations:
        print(f"    - {v['from']:30s} ({v['from_island']})")
        print(f"      └-> {v['to']:30s} ({v['to_island']})")
        print(f"          [行列位置: 行{v['row']} 列{v['col']} = 右上領域]\n")
else:
    print(f"  [CLEAN] 全ての島が正しい方向（一方通行）へ並んでいます。")
    print(f"  依存関係は「下三角行列」を形成しています。")

# ------------------------------------------------------------------------------
# DSM行列の出力（依存構造行列）
# ------------------------------------------------------------------------------
print("\n" + "=" * 80)
print("[DSM（依存構造行列）: 25テーブル完全版]")
print("=" * 80)
print("説明:")
print("  - 縦軸(Y): Consumer（依存する側）")
print("  - 横軸(X): Provider（依存される側）")
print("  - 「1」  : Y が X に依存している")
print("  - 「X」  : 逆流（境界違反）← 上流が下流に依存！")
print("  - 左下   : 正常な依存（下流→上流）")
print("  - 右上   : 逆流（上流→下流）")
print("  - 対角   : 自己参照")
print("  - [===] : 島の境界線")
print("\n")

# 島の境界を明示
print("【島の構成】")
current_idx = 0
for island_name, members in islands.items():
    end_idx = current_idx + len(members) - 1
    print(f"  [{current_idx:2d}-{end_idx:2d}] {island_name:20s} ({len(members)} tables)")
    current_idx = end_idx + 1
print("\n")

# ヘッダー（列番号） - 2行で表示
print("      ", end="")
for i in range(N):
    print(f" {i//10:1d}", end="  ")
print()
print("      ", end="")
for i in range(N):
    print(f" {i%10:1d}", end="  ")
print("    Provider (依存される側) →")
print("     +" + "---" * N)

# 行列本体
current_island_idx = 0
for i, node in enumerate(ordered_nodes):
    # 島の境界線を表示（上部）
    if i in island_boundaries[1:-1]:
        print("     +" + "===" * N + "  [島の境界]")
        current_island_idx += 1
    
    # 行番号とデータ
    print(f" {i:2d} |", end="")
    for j in range(N):
        # 島の境界を縦線で表示
        is_island_boundary_col = j in island_boundaries[1:-1]
        
        if matrix[i, j] == 1:
            # 逆流の場合は強調
            is_violation = any(v['row'] == i and v['col'] == j for v in violations)
            if is_violation:
                print(" X", end="")  # 逆流を「X」で表示
            else:
                print(" 1", end="")
        else:
            print(" .", end="")
        
        # 島の境界を縦線で表示
        if is_island_boundary_col:
            print("|", end="")
        else:
            print(" ", end="")
    
    # ノード名を短縮表示
    island_name = node_to_island[node]
    short_island = island_name[:4]
    print(f"  [{i:2d}] {short_island}")

print("     +" + "---" * N)
print(" ↓")
print("Consumer")
print("(依存する側)")

# 列のフッター（完全版）
print("\n" + "=" * 80)
print("[番号とテーブル名の完全対応表]")
print("=" * 80)
print(f"{'No.':<5} {'テーブル名':<35} {'所属する島':<20}")
print("-" * 80)
for i, node in enumerate(ordered_nodes):
    island_name = node_to_island[node]
    print(f"{i:<5} {node:<35} {island_name:<20}")

# ------------------------------------------------------------------------------
# 集約行列の出力（島から島への依存関係）
# ------------------------------------------------------------------------------
print("\n" + "=" * 80)
print("[集約行列: 島から島への依存関係（10×10）]")
print("=" * 80)

island_list = list(islands.keys())
island_matrix = np.zeros((len(island_list), len(island_list)), dtype=int)

# 島間の依存関係をカウント
island_violations = []
for u, v in edges:
    u_island = node_to_island[u]
    v_island = node_to_island[v]
    u_island_idx = island_list.index(u_island)
    v_island_idx = island_list.index(v_island)
    island_matrix[u_island_idx, v_island_idx] = 1
    
    # 逆流チェック
    if u_island_idx < v_island_idx:
        island_violations.append({
            'from_island': u_island,
            'to_island': v_island,
            'row': u_island_idx,
            'col': v_island_idx,
            'example': f"{u} -> {v}"
        })

print("\n説明:")
print("  - 「1」: 正常な依存（下流の島→上流の島）")
print("  - 「X」: 逆流（上流の島→下流の島）← 境界違反！")
print("  - 左下: 正常エリア")
print("  - 右上: 危険エリア（逆流）")
print("\n")

# ヘッダー（列番号）
print("       ", end="")
for i in range(len(island_list)):
    print(f"  {i:1d}", end="")
print("    Provider島 (依存される側) →")
print("      +" + "---" * len(island_list))

# 行列本体
for i, island_from in enumerate(island_list):
    print(f"  {i:1d} |", end="")
    for j, island_to in enumerate(island_list):
        if island_matrix[i, j] == 1:
            # 逆流チェック
            if i < j:  # 上流が下流に依存
                print("  X", end="")
            elif i == j:  # 自己参照
                print("  o", end="")
            else:
                print("  1", end="")
        else:
            print("  .", end="")
    print(f"  | [{i:1d}] {island_from}")

print("      +" + "---" * len(island_list))
print("   ↓")
print("Consumer島")
print("(依存する側)")

# 島の番号と名前の対応表
print("\n" + "-" * 80)
print("[島の番号と名前の対応表]")
print("-" * 80)
print(f"{'No.':<5} {'島の名前':<25} {'テーブル数':<10} {'含まれるテーブル'}")
print("-" * 80)
for i, island in enumerate(island_list):
    members = islands[island]
    member_names = ", ".join(members[:3])  # 最初の3つを表示
    if len(members) > 3:
        member_names += f", ... ({len(members)}個)"
    print(f"{i:<5} {island:<25} {len(members):<10} {member_names}")

# 逆流の詳細
if island_violations:
    print("\n" + "=" * 80)
    print("[島レベルでの逆流（境界違反）の詳細]")
    print("=" * 80)
    for v in island_violations:
        print(f"  [{v['row']}] {v['from_island']:20s}")
        print(f"    └─X─> [{v['col']}] {v['to_island']:20s}")
        print(f"           例: {v['example']}")
        print()
else:
    print("\n  [CLEAN] 島レベルでの逆流はありません！")

# ------------------------------------------------------------------------------
# 最終判定（総合評価）
# ------------------------------------------------------------------------------
print("\n" + "=" * 80)
print("[最終判定]")
print("=" * 80)

if density < 0.2 and propagation_cost < 0.1 and len(violations) == 0:
    print("  [極めて優秀] 数学的な要塞が完成しています！")
    print("  - 疎結合が保たれている")
    print("  - 変更の影響が局所化されている")
    print("  - 依存関係が一方向（下三角行列）")
elif density < 0.2 and len(violations) <= 1:
    print("  [合格] 境界は数学的に守られています。")
    print("  - 全体的な設計は健全")
    if violations:
        print(f"  - {len(violations)}個の軽微な逆流がありますが、対処可能なレベル")
elif density < 0.3:
    print("  [注意] 密度がやや高い。依存関係を再確認してください。")
else:
    print("  [警告] スパゲッティ化の兆候。リファクタリングを検討してください。")

print("=" * 80)
print("\n診断完了。")
print("このファイルを毎回実行するだけで、V1+V2の両方の診断が完了します。")
print("=" * 80)

