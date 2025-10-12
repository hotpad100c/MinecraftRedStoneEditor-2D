import os
import json

# 你的模型目录
BASE_DIR = "mcAssets/blockstates"
OUTPUT_FILE = os.path.join(BASE_DIR, "_all.json")

def main():
    data = {}

    # 遍历 block 下的所有文件
    for filename in os.listdir(BASE_DIR):
        if not filename.endswith(".json"):
            continue
        if filename == "blockstate_all.json":
            continue  # 避免读到自己

        path = os.path.join(BASE_DIR, filename)
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = json.load(f)
        except Exception as e:
            print(f"读取失败: {filename} -> {e}")
            continue

        key = filename[:-5]  # 去掉 .json
        data[key] = content

    # 写入 blockstate_all.json
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ 已生成 {OUTPUT_FILE}，共 {len(data)} 个方块状态索引")

if __name__ == "__main__":
    main()
