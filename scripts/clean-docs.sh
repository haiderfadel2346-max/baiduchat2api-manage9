#!/bin/bash

# 清理所有 Markdown 文档中的敏感信息

echo "开始清理文档中的敏感信息..."

# 替换密钥为示例值
find . -name "*.md" -type f -exec sed -i 's/5e7fhiQY9aO8Eyoifn\/OVF+A7vy7muzIONptZJAXPkY=/your-secret-key-here-use-openssl-rand-base64-32/g' {} \;

# 替换本地路径
find . -name "*.md" -type f -exec sed -i 's/E:\\AI\\baiduchat2api-manage/\/path\/to\/baiduchat2api-manage/g' {} \;
find . -name "*.md" -type f -exec sed -i 's/E:\/AI\/baiduchat2api-manage/\/path\/to\/baiduchat2api-manage/g' {} \;

echo "清理完成！"
