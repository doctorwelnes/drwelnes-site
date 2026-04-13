import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/app/admin/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add Gallery button before Upload Media
# Find the exact string by looking for upload button context near Markdown editor
marker = 'onClick={handleUploadMedia}\n                          title="'

idx = content.find(marker)
print(f'Found upload button at idx: {idx}')
if idx > 0:
    # Find the containing div className="flex gap-3"
    div_start = content.rfind('                      <div className="flex gap-3">', 0, idx)
    div_end_marker = '                        </div>'
    div_end = content.find(div_end_marker, idx) + len(div_end_marker)
    old_block = content[div_start:div_end]
    print('Old block:')
    print(repr(old_block[:200]))
    
    new_block = '''                      <div className="flex gap-3">
                          <button
                            onClick={openGallery}
                            title="Медиа-галерея"
                            className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 px-4 py-2 rounded-xl cursor-pointer transition-all shadow-lg active:scale-95"
                          >
                            <Image className="w-4 h-4" />
                            <span className="font-bold">Галерея</span>
                          </button>
                          <button
                            onClick={handleUploadMedia}
                            title="Картинки или Видео"
                            className="flex items-center gap-2 text-[11px] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-4 py-2 rounded-xl cursor-pointer transition-all shadow-lg active:scale-95 group/btn"
                          >
                            <Video className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-bold">Загрузить Медиа</span>
                          </button>
                        </div>'''
    
    content = content.replace(old_block, new_block, 1)
    print('Fix1 Gallery button: OK')
else:
    print('ERROR: marker not found')

# Fix 2: Ensure sidebar tree area has overflow-y-auto (it should already have it)
# Check if the aside container needs fixing - look at the aside wrapper
# The sidebar already has overflow-y-auto in the div.flex-1 - just verify
if 'flex-1 overflow-y-auto custom-scrollbar p-2' in content:
    print('Fix2: Sidebar scroll already has overflow-y-auto - OK')
else:
    print('Fix2: WARNING - sidebar scroll class not found')

# Additionally make sure the aside has overflow-hidden so children can scroll
old_aside = 'className="border-r border-neutral-800 bg-[#0c0c0c] flex flex-col shrink-0"'
new_aside = 'className="border-r border-neutral-800 bg-[#0c0c0c] flex flex-col shrink-0 overflow-hidden"'
if old_aside in content:
    content = content.replace(old_aside, new_aside, 1)
    print('Fix2: Added overflow-hidden to aside')
else:
    print('Fix2: aside class not found, checking current state')
    idx_aside = content.find('border-r border-neutral-800 bg-[#0c0c0c]')
    print(repr(content[idx_aside:idx_aside+120]))

with open('src/app/admin/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('DONE')
