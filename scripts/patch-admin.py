import codecs
import re

path = r'f:\OneDrive\Desktop\Dr_Welnes\src\app\admin\AdminDashboard.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    c = f.read()

print("Original length:", len(c))

# 1. Update step numbering
c = c.replace('{String(i + 1).padStart(2, "0")}', '{i + 1}')

# 2. Extract FileTreeNode and countFiles
# Find where to cut:
start_idx = c.find("  // Helper with recursive count")
end_idx = c.find("  return (\r\n    <div className=\"h-screen w-full bg-[#0a0a0a] text-neutral-200 flex flex-col font-sans overflow-hidden\">")
if end_idx == -1: # Try \n instead of \r\n
    end_idx = c.find("  return (\n    <div className=\"h-screen w-full bg-[#0a0a0a] text-neutral-200 flex flex-col font-sans overflow-hidden\">")

if start_idx != -1 and end_idx != -1:
    print("Found indices to remove nested component:", start_idx, end_idx)
    # Remove from AdminDashboard
    c = c[:start_idx] + c[end_idx:]
    
    # Define the new component
    new_component = """
// Helper with recursive count
const countFiles = (node: FileNode): number => {
  if (node.type === "file") return 1;
  return (node.children || []).reduce((acc, child) => acc + countFiles(child), 0);
};

type FileTreeNodeProps = {
  node: FileNode;
  level?: number;
  activeFile: string | null;
  loadFile: (path: string) => void;
};

const FileTreeNode = ({ node, level = 0, activeFile, loadFile }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === "directory";
  const isActive = activeFile === node.path;

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1.5 px-2 cursor-pointer text-[13px] hover:bg-neutral-800/80 rounded transition-colors
          ${isActive ? "bg-amber-600/10 text-amber-500 font-medium" : "text-neutral-400"}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => (isDir ? setIsOpen(!isOpen) : loadFile(node.path))}
      >
        {isDir ? (
          isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 mr-1 opacity-50" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 mr-1 opacity-50" />
          )
        ) : (
          <span className="w-4 h-4 inline-block mr-1"></span>
        )}
        {isDir ? (
          <Folder
            className={`w-3.5 h-3.5 mr-2 ${isOpen ? "text-amber-500" : "text-neutral-500"}`}
          />
        ) : (
          <File
            className={`w-3.5 h-3.5 mr-2 ${isActive ? "text-amber-500" : "text-neutral-600"}`}
          />
        )}
        <span className="truncate flex-1">{node.name.replace(".md", "")}</span>
        {isDir && (
          <span className="ml-2 text-[10px] text-neutral-600 font-mono">{countFiles(node)}</span>
        )}
      </div>
      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <FileTreeNode key={idx} node={child} level={level + 1} activeFile={activeFile} loadFile={loadFile} />
          ))}
        </div>
      )}
    </div>
  );
};

"""
    # Insert new_component above export default function AdminDashboard
    c = c.replace("export default function AdminDashboard", new_component + "export default function AdminDashboard")

# 3. Update FileTree map call
c = c.replace("<FileTreeNode key={idx} node={node} />", "<FileTreeNode key={idx} node={node} activeFile={activeFile} loadFile={loadFile} />")

# 4. Update the headers (use flexible search for \r\n or \n)
c = re.sub(
    r'<h3 className="text-\[10px\] uppercase text-neutral-500 font-black tracking-\[0\.2em\]">\s*Ингредиенты\s*</h3>',
    '<h3 className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em] flex items-center gap-2">\n                                  Ингредиенты{(frontmatter.ingredients?.length ?? 0) > 0 ? <span className="text-amber-600/60 font-mono normal-case ml-1">({frontmatter.ingredients?.length})</span> : null}\n                                </h3>',
    c
)

c = re.sub(
    r'<h3 className="text-\[10px\] uppercase text-neutral-500 font-black tracking-\[0\.2em\]">\s*Инструкция\s*</h3>',
    '<h3 className="text-[10px] uppercase text-neutral-500 font-black tracking-[0.2em] flex items-center gap-2">\n                                  Инструкция{(frontmatter.steps?.length ?? 0) > 0 ? <span className="text-amber-600/60 font-mono normal-case ml-1">({frontmatter.steps?.length} шагов)</span> : null}\n                                </h3>',
    c
)

print("New length:", len(c))
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(c)
print("Done")
