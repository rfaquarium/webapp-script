import re

file_path = "Tab_HR.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Target broken block
target = """                                           <span className={"text-rose-500 font-black text-[13px]"}>-{formatMoney(p.tongGiamTru)}đ</span>
                                              <i className={`fas fa-chevron-${openSection[`${p.user}_penalty`] ? 'up' : 'down'} text-gray-500 text-[10px] w-4 text-right transition-transform`}></i>
                                          </div>
                                      {openSection[`${p.user}_penalty`] && ("""

replacement = """                                           <span className={"text-rose-500 font-black text-[13px]"}>-{formatMoney(p.tongGiamTru)}đ</span>
                                              <i className={`fas fa-chevron-${openSection[`${p.user}_penalty`] ? 'up' : 'down'} text-gray-500 text-[10px] w-4 text-right transition-transform`}></i>
                                          </div>
                                      </div>
                                      {openSection[`${p.user}_penalty`] && ("""

# Replace
if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS")
else:
    # Try with flexible whitespace
    print("TARGET NOT FOUND. Trying flexible replacement...")
    # Let's search with regex
    pattern = r'(<span className=\{"text-rose-500 font-black text-\[13px\]"\}>-\{formatMoney\(p\.tongGiamTru\)\}đ<\/span>\s*<i className=\{`fas fa-chevron-\$\{openSection\[`\$\{p\.user\}_penalty`\] \? \'up\' : \'down\'\} text-gray-500 text-\[10px\] w-4 text-right transition-transform`\}><\/i>\s*<\/div>)(\s*\{openSection\[`\$\{p\.user\}_penalty`\] && \()'
    
    new_content, count = re.subn(pattern, r'\1</div>\2', content)
    if count > 0:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"SUCCESS: replaced {count} occurrences")
    else:
        print("FAILED TO MATCH PATTERN")
