import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { am as SNAIL_SLANG_GLOSSARY, bl as cn } from "./index-DwV1qlqh.js";
function getSnailSlangById(id) {
  return SNAIL_SLANG_GLOSSARY.find((entry) => entry.id === id);
}
function getSnailSlangByTerm(term) {
  return SNAIL_SLANG_GLOSSARY.find((entry) => entry.term === term);
}
function buildTooltip(entry) {
  const lines = [entry.meaning];
  if (entry.example) {
    lines.push(`例：${entry.example}`);
  }
  return lines.join("\n");
}
function SnailSlangTerm({ id, term, entry: entryProp, className }) {
  const entry = entryProp ?? (id ? getSnailSlangById(id) : term ? getSnailSlangByTerm(term) : void 0);
  if (!entry) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: term ?? id });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "abbr",
    {
      title: buildTooltip(entry),
      className: cn(
        "cursor-help border-b border-dotted border-emerald-400/80 font-medium text-emerald-800 no-underline",
        className
      ),
      children: entry.term
    }
  );
}
export {
  SnailSlangTerm as S
};
