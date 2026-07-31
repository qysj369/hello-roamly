import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { f1 as useReducedMotion, dG as motion, ep as staggerContainer, dH as motionTransition, eq as staggerItem } from "./index-DwV1qlqh.js";
function MotionPage({ children, className = "" }) {
  const reduceMotion = useReducedMotion();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      className,
      variants: staggerContainer,
      initial: "hidden",
      animate: "visible",
      transition: motionTransition(reduceMotion),
      children
    }
  );
}
function MotionBlock({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: staggerItem, className, children });
}
export {
  MotionBlock as M,
  MotionPage as a
};
