import os
base = r"e:\Nam_3_HK2\ThiGiac\Fitness\src"
os.makedirs(os.path.join(base, "components"), exist_ok=True)
os.makedirs(os.path.join(base, "utils"), exist_ok=True)
os.makedirs(os.path.join(base, "hooks"), exist_ok=True)
print("Directories created including hooks")
