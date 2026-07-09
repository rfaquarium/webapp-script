file_path = "Tab_HR.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the incorrect closing bracket
target = "              }})"
replacement = "              ))}"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Brackets fixed!")
else:
    print("FAILED: Target bracket not found. Checking if it already contains the fix.")
    if "              ))}" in content:
        print("INFO: File already has the fix!")
    else:
        print("ERROR: Neither target nor replacement found.")
