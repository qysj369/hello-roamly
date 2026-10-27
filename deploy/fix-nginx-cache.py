# -*- coding: utf-8 -*-
# 为 index.html 增加 no-cache 响应头（两个 server 块的 location /）
import re, sys

p = '/etc/nginx/conf.d/hello-roamly.conf'
s = open(p, encoding='utf-8').read()

old = """    location / {
        try_files $uri $uri/ /index.html;
    }"""
new = """    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri $uri/ /index.html;
    }"""

cnt = s.count(old)
if cnt == 0:
    print('PATTERN_NOT_FOUND - abort')
    sys.exit(1)
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print(f'replaced {cnt} block(s)')

import subprocess
r = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
print(r.stdout)
print(r.stderr)
if r.returncode != 0:
    sys.exit(r.returncode)
r2 = subprocess.run(['systemctl', 'reload', 'nginx'], capture_output=True, text=True)
print('reload rc=', r2.returncode, r2.stderr[:200])
