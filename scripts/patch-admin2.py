import codecs
import re

path = r'f:\OneDrive\Desktop\Dr_Welnes\src\app\admin\AdminDashboard.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    c = f.read()

# 1. Imports
c = c.replace(
    "PanelLeftClose,\n  PanelLeft,",
    "PanelLeftClose,\n  PanelLeft,\n  PanelRightClose,\n  PanelRight,"
)
c = c.replace(
    "PanelLeftClose,\r\n  PanelLeft,",
    "PanelLeftClose,\r\n  PanelLeft,\r\n  PanelRightClose,\r\n  PanelRight,"
)

# 2. State
c = c.replace(
    "const [isExplorerVisible, setIsExplorerVisible] = useState(true);",
    "const [isExplorerVisible, setIsExplorerVisible] = useState(true);\n  const [isPreviewVisible, setIsPreviewVisible] = useState(true);"
)

# 3. Header toggle button
c = re.sub(
    r'(<button\s+onClick=\{\(\) => setIsExplorerVisible\(!isExplorerVisible\)\}.*?</button>)',
    r'\1\n          <button\n            onClick={() => setIsPreviewVisible(!isPreviewVisible)}\n            className="text-neutral-400 hover:text-white transition-colors ml-2"\n            title="Показать/скрыть превью"\n          >\n            {isPreviewVisible ? <PanelRightClose size={18} /> : <PanelRight size={18} />}\n          </button>',
    c,
    flags=re.DOTALL
)

# 4. Textarea height
c = c.replace("className=\"w-full min-h-[800px] bg-[#0c0c0c]", "className=\"w-full min-h-[300px] bg-[#0c0c0c]")

# 5. Title label
c = re.sub(
    r'(\{\/\*\s*Title Area - Textarea for wrapping\s*\*\/.*?<div className="space-y-6">)(.*?<textarea.*?placeholder="Заголовок рецепта/статьи".*?/>)',
    r'\1\n                    <div className="flex flex-col gap-2 items-start">\n                      <label className="text-[10px] uppercase text-neutral-600 font-black tracking-widest pl-1">\n                        Название\n                      </label>\2\n                    </div>',
    c,
    flags=re.DOTALL
)

# 6. Video Field
c = re.sub(
    r'(</div>\s*</div>\s*\{\/\*\s*КБЖУ Блоки - Скрыты для теории\s*\*\/)',
    r'\1'.replace(r'\1', '</div>\n                      </div>\n\n                      {/* Видео */}\n                      <div className="flex flex-col gap-2 mt-2 border-t border-neutral-800/30 pt-4">\n                        <label className="text-[10px] uppercase text-neutral-600 font-black tracking-widest">\n                          Ссылка на видео / Путь к видеофайлу\n                        </label>\n                        <input\n                          type="text"\n                          value={frontmatter.videoFile || ""}\n                          onChange={(e) =>\n                            setFrontmatter({ ...frontmatter, videoFile: e.target.value })\n                          }\n                          className="bg-[#0c0c0c] border border-neutral-800 focus:border-amber-500/50 text-[13px] text-neutral-200 outline-none p-2 rounded-lg transition-all"\n                          placeholder="/uploads/videos/video.mp4 или внешняя ссылка"\n                        />\n                      </div>\n\n                      {/* КБЖУ Блоки - Скрыты для теории */}\n'),
    c,
    flags=re.DOTALL
)
if "Ссылка на видео" not in c:
    # try slightly different pattern
    c = re.sub(
        r'(</div>\s*</div>\s*\{\/\*\s*КБЖУ Блоки)',
        r'</div>\n                      </div>\n\n                      {/* Видео */}\n                      <div className="flex flex-col gap-2 mt-2 border-t border-neutral-800/30 pt-4">\n                        <label className="text-[10px] uppercase text-neutral-600 font-black tracking-widest">\n                          Ссылка на видео / Путь к видеофайлу\n                        </label>\n                        <input\n                          type="text"\n                          value={frontmatter.videoFile || ""}\n                          onChange={(e) =>\n                            setFrontmatter({ ...frontmatter, videoFile: e.target.value })\n                          }\n                          className="bg-[#0c0c0c] border border-neutral-800 focus:border-amber-500/50 text-[13px] text-neutral-200 outline-none p-2 rounded-lg transition-all"\n                          placeholder="/uploads/videos/video.mp4 или внешняя ссылка"\n                        />\n                      </div>\n\n                      {/* КБЖУ Блоки',
        c,
        flags=re.DOTALL
    )

# 7. Preview Wrap
# Look for RESIZER PREVIEW
resizer_preview_start = c.find('        {/* RESIZER PREVIEW */}')
aside_end = c.find('        </aside>')

if resizer_preview_start != -1 and aside_end != -1:
    before = c[:resizer_preview_start]
    # Find exact insertion index for wrap end
    end_tag_str = '        </aside>'
    exact_aside_end = c.find(end_tag_str) + len(end_tag_str)
    
    middle = c[resizer_preview_start:exact_aside_end]
    after = c[exact_aside_end:]
    
    # Prepend condition
    middle = middle.replace('        {/* RESIZER PREVIEW */}', '        {/* RESIZER PREVIEW */}\n        {isPreviewVisible && (\n          <>')
    # Append close tag
    middle = middle + '\n          </>\n        )}'
    
    c = before + middle + after

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(c)

print("Patch applied")
