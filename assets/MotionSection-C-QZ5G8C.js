import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { f1 as useReducedMotion, dG as motion, bN as fadeUpVariants, dH as motionTransition } from "./index-DwV1qlqh.js";
function MotionSection({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.section,
    {
      className,
      variants: fadeUpVariants,
      initial: "hidden",
      animate: "visible",
      transition: { ...motionTransition(reduceMotion), delay: reduceMotion ? 0 : delay },
      children
    }
  );
}
export {
  MotionSection as M
};
