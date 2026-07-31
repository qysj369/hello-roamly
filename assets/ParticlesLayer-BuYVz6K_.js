const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Container-kDNVG0sJ.js","assets/vendor-react-DtfH6MSw.js","assets/index-DwV1qlqh.js","assets/vendor-three-Blpl5Qyv.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bM as f, f1 as useReducedMotion, bl as cn } from "./index-DwV1qlqh.js";
import { _ as __vitePreload } from "./vendor-three-Blpl5Qyv.js";
const generatedAttribute = "generated", defaultCompositeValue = "source-over", resizeEvent = "resize", visibilityChangeEvent = "visibilitychange", percentDenominator = 100, half = 0.5, millisecondsToSeconds = 1e3, originPoint = {
  x: 0,
  y: 0,
  z: 0
}, defaultTransform = {
  a: 1,
  b: 0,
  c: 0,
  d: 1
}, randomColorValue = "random", double = 2, doublePI = Math.PI * double, defaultFps = 60, generatedTrue = "true", generatedFalse = "false", canvasTag = "canvas", defaultRetryCount = 0, squareExp = 2, spatialHashGridCellSize = 100, defaultRemoveQuantity = 1, defaultRatio = 1, defaultReduceFactor = 1, inverseFactorNumerator = 1, rgbMax = 255, hMax = 360, sMax = 100, lMax = 100, hMin = 0, sMin = 0, hPhase = 60, empty = 0, quarter = 0.25, threeQuarter = half + quarter, defaultTransformValue = 1, minimumSize = 0, zIndexFactorOffset = 1, defaultOpacity = 1, removeDeleteCount = 1, removeMinIndex = 0, defaultFpsLimit = 120, minFpsLimit = 0, canvasFirstIndex = 0, loadRandomFactor = 1e4, loadMinIndex = 0, one = 1, none = 0, tryCountIncrement = 1, minZ = 0, minLimit = 0, countOffset = 1, minCount = 0, minIndex = 0, defaultDensityFactor = 1, deleteCount = 1, defaultAngle = 0, identity = 1, minStrokeWidth = 0, lFactor = 1, lMin = 0, triple = 3, sextuple = 6, sNormalizedOffset = 1, phaseNumerator = 1, defaultRgbMin = 0, defaultZoom = 1;
var MoveDirection;
(function(MoveDirection2) {
  MoveDirection2["bottom"] = "bottom";
  MoveDirection2["bottomLeft"] = "bottom-left";
  MoveDirection2["bottomRight"] = "bottom-right";
  MoveDirection2["left"] = "left";
  MoveDirection2["none"] = "none";
  MoveDirection2["right"] = "right";
  MoveDirection2["top"] = "top";
  MoveDirection2["topLeft"] = "top-left";
  MoveDirection2["topRight"] = "top-right";
  MoveDirection2["outside"] = "outside";
  MoveDirection2["inside"] = "inside";
})(MoveDirection || (MoveDirection = {}));
function getZ(source) {
  return "z" in source ? source.z : originPoint.z;
}
class Vector3d {
  constructor(x = originPoint.x, y = originPoint.y, z = originPoint.z) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static get origin() {
    return Vector3d.create(originPoint.x, originPoint.y, originPoint.z);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  set angle(angle) {
    this._updateFromAngle(angle, this.length);
  }
  get length() {
    return Math.sqrt(this.getLengthSq());
  }
  set length(length) {
    this._updateFromAngle(this.angle, length);
  }
  static clone(source) {
    return Vector3d.create(source.x, source.y, getZ(source));
  }
  static create(x, y, z) {
    if (typeof x === "number") {
      return new Vector3d(x, y ?? originPoint.y, z ?? originPoint.z);
    }
    return new Vector3d(x.x, x.y, getZ(x));
  }
  add(v) {
    return Vector3d.create(this.x + v.x, this.y + v.y, this.z + getZ(v));
  }
  addTo(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += getZ(v);
  }
  copy() {
    return Vector3d.clone(this);
  }
  div(n) {
    return Vector3d.create(this.x / n, this.y / n, this.z / n);
  }
  divTo(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
  }
  getLengthSq() {
    return this.x ** squareExp + this.y ** squareExp;
  }
  mult(n) {
    return Vector3d.create(this.x * n, this.y * n, this.z * n);
  }
  multTo(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
  normalize() {
    const length = this.length;
    if (length != none) {
      this.multTo(inverseFactorNumerator / length);
    }
  }
  rotate(angle) {
    return Vector3d.create(this.x * Math.cos(angle) - this.y * Math.sin(angle), this.x * Math.sin(angle) + this.y * Math.cos(angle), originPoint.z);
  }
  setTo(c) {
    this.x = c.x;
    this.y = c.y;
    this.z = getZ(c);
  }
  sub(v) {
    return Vector3d.create(this.x - v.x, this.y - v.y, this.z - getZ(v));
  }
  subFrom(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= getZ(v);
  }
  _updateFromAngle(angle, length) {
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }
}
class Vector extends Vector3d {
  constructor(x = originPoint.x, y = originPoint.y) {
    super(x, y, originPoint.z);
  }
  static get origin() {
    return Vector.create(originPoint.x, originPoint.y);
  }
  static clone(source) {
    return Vector.create(source.x, source.y);
  }
  static create(x, y) {
    if (typeof x === "number") {
      return new Vector(x, y ?? originPoint.y);
    }
    return new Vector(x.x, x.y);
  }
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isString(arg) {
  return typeof arg === "string";
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function isArray(arg) {
  return Array.isArray(arg);
}
function isNull(arg) {
  return arg === null || arg === void 0;
}
const piDeg = 180, degToRadFactor = Math.PI / piDeg;
let _random = Math.random;
const _animationLoop = {
  nextFrame: (cb) => requestAnimationFrame(cb),
  cancel: (idx) => {
    cancelAnimationFrame(idx);
  }
};
function getRandom() {
  const min = 0, max = 1;
  return clamp(_random(), min, max - Number.EPSILON);
}
function getRandomInRange(min, max) {
  return getRandom() * (max - min) + min;
}
function animate(fn) {
  return _animationLoop.nextFrame(fn);
}
function cancelAnimation(handle) {
  _animationLoop.cancel(handle);
}
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function randomInRangeValue(r2) {
  const max = getRangeMax(r2), minOffset = 0;
  let min = getRangeMin(r2);
  if (max === min) {
    min = minOffset;
  }
  return getRandomInRange(min, max);
}
function getRangeValue(value) {
  return isNumber(value) ? value : randomInRangeValue(value);
}
function getRangeMin(value) {
  return isNumber(value) ? value : value.min;
}
function getRangeMax(value) {
  return isNumber(value) ? value : value.max;
}
function setRangeValue(source, value) {
  if (source === value || value === void 0 && isNumber(source)) {
    return source;
  }
  const min = getRangeMin(source), max = getRangeMax(source);
  return value !== void 0 ? {
    min: Math.min(min, value),
    max: Math.max(max, value)
  } : setRangeValue(min, max);
}
function getDistanceSq(pointA, pointB) {
  const dx = pointA.x - pointB.x, dy = pointA.y - pointB.y;
  return dx * dx + dy * dy;
}
function checkDistance(pointA, pointB, distance) {
  return getDistanceSq(pointA, pointB) <= distance * distance;
}
function degToRad(degrees) {
  return degrees * degToRadFactor;
}
function getParticleDirectionAngle(direction, position, center) {
  if (isNumber(direction)) {
    return degToRad(direction);
  }
  switch (direction) {
    case MoveDirection.top:
      return -Math.PI * half;
    case MoveDirection.topRight:
      return -Math.PI * quarter;
    case MoveDirection.right:
      return empty;
    case MoveDirection.bottomRight:
      return Math.PI * quarter;
    case MoveDirection.bottom:
      return Math.PI * half;
    case MoveDirection.bottomLeft:
      return Math.PI * threeQuarter;
    case MoveDirection.left:
      return Math.PI;
    case MoveDirection.topLeft:
      return -Math.PI * threeQuarter;
    case MoveDirection.inside:
      return Math.atan2(center.y - position.y, center.x - position.x);
    case MoveDirection.outside:
      return Math.atan2(position.y - center.y, position.x - center.x);
    default:
      return getRandom() * doublePI;
  }
}
function getParticleBaseVelocity(direction) {
  const baseVelocity = Vector.origin;
  baseVelocity.length = 1;
  baseVelocity.angle = direction;
  return baseVelocity;
}
function calcExactPositionOrRandomFromSize(data) {
  const { position, size } = data;
  return {
    x: (position == null ? void 0 : position.x) ?? getRandom() * size.width,
    y: (position == null ? void 0 : position.y) ?? getRandom() * size.height
  };
}
var AnimationMode;
(function(AnimationMode2) {
  AnimationMode2["auto"] = "auto";
  AnimationMode2["increase"] = "increase";
  AnimationMode2["decrease"] = "decrease";
  AnimationMode2["random"] = "random";
})(AnimationMode || (AnimationMode = {}));
var AnimationStatus;
(function(AnimationStatus2) {
  AnimationStatus2["increasing"] = "increasing";
  AnimationStatus2["decreasing"] = "decreasing";
})(AnimationStatus || (AnimationStatus = {}));
var DestroyType;
(function(DestroyType2) {
  DestroyType2["none"] = "none";
  DestroyType2["max"] = "max";
  DestroyType2["min"] = "min";
})(DestroyType || (DestroyType = {}));
var OutModeDirection;
(function(OutModeDirection2) {
  OutModeDirection2["bottom"] = "bottom";
  OutModeDirection2["left"] = "left";
  OutModeDirection2["right"] = "right";
  OutModeDirection2["top"] = "top";
})(OutModeDirection || (OutModeDirection = {}));
var PixelMode;
(function(PixelMode2) {
  PixelMode2["precise"] = "precise";
  PixelMode2["percent"] = "percent";
})(PixelMode || (PixelMode = {}));
var StartValueType;
(function(StartValueType2) {
  StartValueType2["max"] = "max";
  StartValueType2["min"] = "min";
  StartValueType2["random"] = "random";
})(StartValueType || (StartValueType = {}));
function memoize(fn, options) {
  const cache = /* @__PURE__ */ new Map(), stableStringify = (obj, seen = /* @__PURE__ */ new WeakSet()) => {
    if (obj === null) {
      return "null";
    }
    const t = typeof obj;
    if (t === "undefined") {
      return "undefined";
    }
    if (t === "number" || t === "boolean" || t === "string") {
      return JSON.stringify(obj);
    }
    if (t === "function") {
      try {
        const fn2 = obj;
        return fn2.toString();
      } catch {
        return '"[Function]"';
      }
    }
    if (t === "symbol") {
      try {
        return obj.toString();
      } catch {
        return '"[Symbol]"';
      }
    }
    if (Array.isArray(obj)) {
      return `[${obj.map((i2) => stableStringify(i2, seen)).join(",")}]`;
    }
    if (seen.has(obj)) {
      return '"[Circular]"';
    }
    seen.add(obj);
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k], seen)}`).join(",")}}`;
  }, defaultKeyer = (args) => stableStringify(args), makeKey = (args) => defaultKeyer(args);
  return (...args) => {
    const key = makeKey(args), now = Date.now(), entry = cache.get(key);
    if (entry !== void 0) {
      {
        cache.delete(key);
        cache.set(key, { value: entry.value, ts: entry.ts });
        return entry.value;
      }
    }
    const result = fn(...args);
    cache.set(key, { value: result, ts: now });
    return result;
  };
}
function hasMatchMedia() {
  return typeof matchMedia !== "undefined";
}
function safeDocument() {
  return globalThis.document;
}
function safeMatchMedia(query) {
  if (!hasMatchMedia()) {
    return;
  }
  return matchMedia(query);
}
function safeMutationObserver(callback) {
  if (typeof MutationObserver === "undefined") {
    return;
  }
  return new MutationObserver(callback);
}
function isInArray(value, array) {
  return value === array || isArray(array) && array.includes(value);
}
function arrayRandomIndex(array) {
  return Math.floor(getRandom() * array.length);
}
function itemFromArray(array, index, useIndex = true) {
  return array[index !== void 0 && useIndex ? index % array.length : arrayRandomIndex(array)];
}
function deepExtend(destination, ...sources) {
  for (const source of sources) {
    if (isNull(source)) {
      continue;
    }
    if (!isObject(source)) {
      destination = source;
      continue;
    }
    if (Array.isArray(source)) {
      if (!Array.isArray(destination)) {
        destination = [];
      }
    } else if (!isObject(destination) || Array.isArray(destination)) {
      destination = {};
    }
    const sourceKeys = Object.keys(source), dangerousKeys = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]), hasNested = sourceKeys.some((k) => {
      const v = source[k];
      return isObject(v) || Array.isArray(v);
    });
    if (!hasNested) {
      const sourceDict = source, destDict = destination;
      for (const key of sourceKeys) {
        if (dangerousKeys.has(key)) {
          continue;
        }
        if (key in sourceDict) {
          const v = sourceDict[key];
          if (v !== void 0) {
            destDict[key] = v;
          }
        }
      }
      continue;
    }
    for (const key of sourceKeys) {
      if (dangerousKeys.has(key)) {
        continue;
      }
      const sourceDict = source, destDict = destination, value = sourceDict[key];
      destDict[key] = Array.isArray(value) ? value.map((v) => deepExtend(void 0, v)) : deepExtend(destDict[key], value);
    }
  }
  return destination;
}
function executeOnSingleOrMultiple(obj, callback) {
  const defaultIndex = 0;
  return isArray(obj) ? obj.map((item, index) => callback(item, index)) : callback(obj, defaultIndex);
}
function itemFromSingleOrMultiple(obj, index, useIndex) {
  return isArray(obj) ? itemFromArray(obj, index, useIndex) : obj;
}
function initParticleNumericAnimationValue(options, pxRatio) {
  const valueRange = options.value, animationOptions = options.animation, res = {
    delayTime: getRangeValue(animationOptions.delay) * millisecondsToSeconds,
    enable: animationOptions.enable,
    value: getRangeValue(options.value) * pxRatio,
    max: getRangeMax(valueRange) * pxRatio,
    min: getRangeMin(valueRange) * pxRatio,
    loops: 0,
    maxLoops: getRangeValue(animationOptions.count),
    time: 0
  }, decayOffset = 1;
  if (animationOptions.enable) {
    res.decay = decayOffset - getRangeValue(animationOptions.decay);
    switch (animationOptions.mode) {
      case AnimationMode.increase:
        res.status = AnimationStatus.increasing;
        break;
      case AnimationMode.decrease:
        res.status = AnimationStatus.decreasing;
        break;
      case AnimationMode.random:
        res.status = getRandom() >= half ? AnimationStatus.increasing : AnimationStatus.decreasing;
        break;
    }
    const autoStatus = animationOptions.mode === AnimationMode.auto;
    switch (animationOptions.startValue) {
      case StartValueType.min:
        res.value = res.min;
        if (autoStatus) {
          res.status = AnimationStatus.increasing;
        }
        break;
      case StartValueType.max:
        res.value = res.max;
        if (autoStatus) {
          res.status = AnimationStatus.decreasing;
        }
        break;
      case StartValueType.random:
      default:
        res.value = randomInRangeValue(res);
        if (autoStatus) {
          res.status = getRandom() >= half ? AnimationStatus.increasing : AnimationStatus.decreasing;
        }
        break;
    }
  }
  res.initialValue = res.value;
  return res;
}
function getPositionOrSize(positionOrSize, canvasSize) {
  const isPercent = positionOrSize.mode === PixelMode.percent;
  if (!isPercent) {
    const { mode: _, ...rest } = positionOrSize;
    return rest;
  }
  const isPosition = "x" in positionOrSize;
  if (isPosition) {
    return {
      x: positionOrSize.x / percentDenominator * canvasSize.width,
      y: positionOrSize.y / percentDenominator * canvasSize.height
    };
  } else {
    return {
      width: positionOrSize.width / percentDenominator * canvasSize.width,
      height: positionOrSize.height / percentDenominator * canvasSize.height
    };
  }
}
function getPosition(position, canvasSize) {
  return getPositionOrSize(position, canvasSize);
}
function cloneStyle(style) {
  var _a, _b;
  const clonedStyle = safeDocument().createElement("div").style;
  for (const key in style) {
    const styleKey = style[key];
    if (!(key in style) || isNull(styleKey)) {
      continue;
    }
    const styleValue = (_a = style.getPropertyValue) == null ? void 0 : _a.call(style, styleKey);
    if (!styleValue) {
      continue;
    }
    const stylePriority = (_b = style.getPropertyPriority) == null ? void 0 : _b.call(style, styleKey);
    if (stylePriority) {
      clonedStyle.setProperty(styleKey, styleValue, stylePriority);
    } else {
      clonedStyle.setProperty(styleKey, styleValue);
    }
  }
  return clonedStyle;
}
function computeFullScreenStyle(zIndex) {
  const fullScreenStyle = safeDocument().createElement("div").style, radix = 10, style = {
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    borderWidth: "0",
    position: "fixed",
    zIndex: zIndex.toString(radix),
    "z-index": zIndex.toString(radix),
    top: "0",
    left: "0",
    "pointer-events": "none"
  };
  for (const key in style) {
    const value = style[key];
    if (value === void 0) {
      continue;
    }
    fullScreenStyle.setProperty(key, value);
  }
  return fullScreenStyle;
}
const getFullScreenStyle = memoize(computeFullScreenStyle);
function manageListener(element, event, handler, add, options) {
  if (add) {
    let addOptions = { passive: true };
    if (isBoolean(options)) {
      addOptions.capture = options;
    } else if (options !== void 0) {
      addOptions = options;
    }
    element.addEventListener(event, handler, addOptions);
  } else {
    const removeOptions = options;
    element.removeEventListener(event, handler, removeOptions);
  }
}
async function getItemsFromInitializer(container, map, initializers, force = false) {
  let res = map.get(container);
  if (!res || force) {
    res = await Promise.all([...initializers.values()].map((t) => t(container)));
    map.set(container, res);
  }
  return res;
}
async function getItemMapFromInitializer(container, map, initializers, force = false) {
  let res = map.get(container);
  if (!res || force) {
    const entries = await Promise.all([...initializers.entries()].map(([key, initializer]) => initializer(container).then((item) => [key, item])));
    res = new Map(entries);
    map.set(container, res);
  }
  return res;
}
class EventDispatcher {
  constructor() {
    __publicField(this, "_listeners");
    this._listeners = /* @__PURE__ */ new Map();
  }
  addEventListener(type, listener) {
    this.removeEventListener(type, listener);
    let arr = this._listeners.get(type);
    if (!arr) {
      arr = [];
      this._listeners.set(type, arr);
    }
    arr.push(listener);
  }
  dispatchEvent(type, args) {
    const listeners = this._listeners.get(type);
    listeners == null ? void 0 : listeners.forEach((handler) => {
      handler(args);
    });
  }
  hasEventListener(type) {
    return !!this._listeners.get(type);
  }
  removeAllEventListeners(type) {
    if (!type) {
      this._listeners = /* @__PURE__ */ new Map();
    } else {
      this._listeners.delete(type);
    }
  }
  removeEventListener(type, listener) {
    const arr = this._listeners.get(type);
    if (!arr) {
      return;
    }
    const length = arr.length, idx = arr.indexOf(listener);
    if (idx < minIndex) {
      return;
    }
    if (length === deleteCount) {
      this._listeners.delete(type);
    } else {
      arr.splice(idx, deleteCount);
    }
  }
}
var EventType;
(function(EventType2) {
  EventType2["configAdded"] = "configAdded";
  EventType2["containerInit"] = "containerInit";
  EventType2["particlesSetup"] = "particlesSetup";
  EventType2["containerStarted"] = "containerStarted";
  EventType2["containerStopped"] = "containerStopped";
  EventType2["containerDestroyed"] = "containerDestroyed";
  EventType2["containerPaused"] = "containerPaused";
  EventType2["containerPlay"] = "containerPlay";
  EventType2["containerBuilt"] = "containerBuilt";
  EventType2["particleAdded"] = "particleAdded";
  EventType2["particleDestroyed"] = "particleDestroyed";
  EventType2["particleRemoved"] = "particleRemoved";
})(EventType || (EventType = {}));
class PluginManager {
  constructor(engine) {
    __publicField(this, "colorManagers", /* @__PURE__ */ new Map());
    __publicField(this, "easingFunctions", /* @__PURE__ */ new Map());
    __publicField(this, "effectDrawers", /* @__PURE__ */ new Map());
    __publicField(this, "initializers", {
      effects: /* @__PURE__ */ new Map(),
      shapes: /* @__PURE__ */ new Map(),
      updaters: /* @__PURE__ */ new Map()
    });
    __publicField(this, "palettes", /* @__PURE__ */ new Map());
    __publicField(this, "plugins", []);
    __publicField(this, "presets", /* @__PURE__ */ new Map());
    __publicField(this, "shapeDrawers", /* @__PURE__ */ new Map());
    __publicField(this, "updaters", /* @__PURE__ */ new Map());
    __publicField(this, "_allLoadersSet", /* @__PURE__ */ new Set());
    __publicField(this, "_configs", /* @__PURE__ */ new Map());
    __publicField(this, "_engine");
    __publicField(this, "_executedSet", /* @__PURE__ */ new Set());
    __publicField(this, "_initialized", false);
    __publicField(this, "_isRunningLoaders", false);
    __publicField(this, "_loadPromises", /* @__PURE__ */ new Set());
    this._engine = engine;
  }
  get configs() {
    const res = {};
    for (const [name, config] of this._configs) {
      res[name] = config;
    }
    return res;
  }
  addColorManager(name, manager) {
    this.colorManagers.set(name, manager);
  }
  addConfig(config) {
    const key = config.key ?? config.name ?? "default";
    this._configs.set(key, config);
    this._engine.dispatchEvent(EventType.configAdded, { data: { name: key, config } });
  }
  addEasing(name, easing) {
    if (this.easingFunctions.get(name)) {
      return;
    }
    this.easingFunctions.set(name, easing);
  }
  addEffect(effect, drawer) {
    this.initializers.effects.set(effect, drawer);
  }
  addPalette(name, palette) {
    this.palettes.set(name, palette);
  }
  addParticleUpdater(name, updaterInitializer) {
    this.initializers.updaters.set(name, updaterInitializer);
  }
  addPlugin(plugin) {
    if (this.getPlugin(plugin.id)) {
      return;
    }
    this.plugins.push(plugin);
  }
  addPreset(preset, options, override = false) {
    if (!(override || !this.getPreset(preset))) {
      return;
    }
    this.presets.set(preset, options);
  }
  addShape(shapes, drawer) {
    for (const shape of shapes) {
      this.initializers.shapes.set(shape, drawer);
    }
  }
  clearPlugins(container) {
    this.effectDrawers.delete(container);
    this.shapeDrawers.delete(container);
    this.updaters.delete(container);
  }
  getEasing(name) {
    return this.easingFunctions.get(name) ?? ((value) => value);
  }
  getEffectDrawers(container, force = false) {
    return getItemMapFromInitializer(container, this.effectDrawers, this.initializers.effects, force);
  }
  getPalette(name) {
    return this.palettes.get(name);
  }
  getPlugin(plugin) {
    return this.plugins.find((t) => t.id === plugin);
  }
  getPreset(preset) {
    return this.presets.get(preset);
  }
  async getShapeDrawers(container, force = false) {
    return getItemMapFromInitializer(container, this.shapeDrawers, this.initializers.shapes, force);
  }
  async getUpdaters(container, force = false) {
    return getItemsFromInitializer(container, this.updaters, this.initializers.updaters, force);
  }
  async init() {
    if (this._initialized || this._isRunningLoaders) {
      return;
    }
    this._isRunningLoaders = true;
    this._executedSet = /* @__PURE__ */ new Set();
    this._allLoadersSet = new Set(this._loadPromises);
    try {
      for (const loader of this._allLoadersSet) {
        await this._runLoader(loader, this._executedSet, this._allLoadersSet);
      }
    } finally {
      this._loadPromises.clear();
      this._isRunningLoaders = false;
      this._initialized = true;
    }
  }
  loadParticlesOptions(container, options, ...sourceOptions) {
    const updaters = this.updaters.get(container);
    if (!updaters) {
      return;
    }
    updaters.forEach((updater) => {
      var _a;
      return (_a = updater.loadOptions) == null ? void 0 : _a.call(updater, options, ...sourceOptions);
    });
  }
  async register(...loaders) {
    if (this._initialized) {
      throw new Error("Register plugins can only be done before calling tsParticles.load()");
    }
    for (const loader of loaders) {
      if (this._isRunningLoaders) {
        await this._runLoader(loader, this._executedSet, this._allLoadersSet);
      } else {
        this._loadPromises.add(loader);
      }
    }
  }
  async _runLoader(loader, executed, allLoaders) {
    if (executed.has(loader))
      return;
    executed.add(loader);
    allLoaders.add(loader);
    await loader(this._engine);
  }
}
const errorPrefix = "tsParticles - Error";
const wrap = (fn) => (...args) => {
  fn(...args);
}, _logger = {
  debug: wrap(console.debug),
  error: (message, ...optionalParams) => {
    console.error(`${errorPrefix} - ${message}`, ...optionalParams);
  },
  info: wrap(console.info),
  log: wrap(console.log),
  trace: wrap(console.trace),
  verbose: wrap(console.log),
  warning: wrap(console.warn)
};
function getLogger() {
  return _logger;
}
const fullPercent = "100%";
async function getDataFromUrl(data) {
  const url = itemFromSingleOrMultiple(data.url, data.index);
  if (!url) {
    return data.fallback;
  }
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  }
  getLogger().error(`${response.status.toString()} while retrieving config file`);
  return data.fallback;
}
const getCanvasFromContainer = (domContainer) => {
  var _a, _b, _c, _d, _e;
  const documentSafe = safeDocument();
  let canvasEl;
  const isCanvas = domContainer instanceof HTMLCanvasElement || domContainer.tagName.toLowerCase() === canvasTag;
  if (isCanvas) {
    canvasEl = domContainer;
    (_a = canvasEl.dataset)[generatedAttribute] ?? (_a[generatedAttribute] = generatedFalse);
    if (canvasEl.dataset[generatedAttribute] === generatedTrue) {
      (_b = canvasEl.style).width || (_b.width = fullPercent);
      (_c = canvasEl.style).height || (_c.height = fullPercent);
      canvasEl.style.pointerEvents = "none";
      canvasEl.style.setProperty("pointer-events", "none");
    }
  } else {
    const existingCanvases = domContainer.getElementsByTagName(canvasTag), foundCanvas = existingCanvases.item(canvasFirstIndex);
    if (foundCanvas) {
      canvasEl = foundCanvas;
      canvasEl.dataset[generatedAttribute] = generatedFalse;
    } else {
      canvasEl = documentSafe.createElement(canvasTag);
      canvasEl.dataset[generatedAttribute] = generatedTrue;
      domContainer.appendChild(canvasEl);
    }
    (_d = canvasEl.style).width || (_d.width = fullPercent);
    (_e = canvasEl.style).height || (_e.height = fullPercent);
    canvasEl.style.pointerEvents = "none";
    canvasEl.style.setProperty("pointer-events", "none");
  }
  return canvasEl;
}, getDomContainer = (id, source) => {
  const documentSafe = safeDocument();
  let domContainer = source ?? documentSafe.getElementById(id);
  if (domContainer) {
    return domContainer;
  }
  domContainer = documentSafe.createElement("canvas");
  domContainer.id = id;
  domContainer.dataset[generatedAttribute] = generatedTrue;
  documentSafe.body.append(domContainer);
  return domContainer;
};
class Engine {
  constructor() {
    __publicField(this, "pluginManager", new PluginManager(this));
    __publicField(this, "_domArray", []);
    __publicField(this, "_eventDispatcher", new EventDispatcher());
    __publicField(this, "_initialized", false);
  }
  get items() {
    return this._domArray;
  }
  get version() {
    return "4.0.5";
  }
  addEventListener(type, listener) {
    this._eventDispatcher.addEventListener(type, listener);
  }
  checkVersion(pluginVersion) {
    if (this.version === pluginVersion) {
      return;
    }
    throw new Error(`The tsParticles version is different from the loaded plugins version. Engine version: ${this.version}. Plugin version: ${pluginVersion}`);
  }
  dispatchEvent(type, args) {
    this._eventDispatcher.dispatchEvent(type, args);
  }
  async init() {
    if (this._initialized) {
      return;
    }
    await this.pluginManager.init();
    this._initialized = true;
  }
  item(index) {
    const { items } = this, item = items[index];
    if (item == null ? void 0 : item.destroyed) {
      items.splice(index, removeDeleteCount);
      return;
    }
    return item;
  }
  async load(params) {
    await this.init();
    let domSourceElement;
    if (typeof HTMLElement !== "undefined" && params.element instanceof HTMLElement) {
      domSourceElement = params.element;
    }
    const { Container } = await __vitePreload(async () => {
      const { Container: Container2 } = await import("./Container-kDNVG0sJ.js");
      return { Container: Container2 };
    }, true ? __vite__mapDeps([0,1,2,3]) : void 0), id = params.id ?? (domSourceElement == null ? void 0 : domSourceElement.id) ?? `tsparticles${Math.floor(getRandom() * loadRandomFactor).toString()}`, { index, url } = params, options = url ? await getDataFromUrl({ fallback: params.options, url, index }) : params.options, currentOptions = itemFromSingleOrMultiple(options, index), { items } = this, oldIndex = items.findIndex((v) => v.id.description === id), newItem = new Container({
      dispatchCallback: (eventType, args) => {
        this.dispatchEvent(eventType, args);
      },
      id,
      onDestroy: (remove) => {
        if (!remove) {
          return;
        }
        const mainArr = this.items, idx = mainArr.indexOf(newItem);
        if (idx >= removeMinIndex) {
          mainArr.splice(idx, removeDeleteCount);
        }
      },
      pluginManager: this.pluginManager,
      sourceOptions: currentOptions
    });
    if (oldIndex >= loadMinIndex) {
      const old = this.item(oldIndex), deleteCount2 = old ? one : none;
      if (old && !old.destroyed) {
        old.destroy(false);
      }
      items.splice(oldIndex, deleteCount2, newItem);
    } else {
      items.push(newItem);
    }
    const sourceCanvas = typeof OffscreenCanvas !== "undefined" && params.element instanceof OffscreenCanvas ? params.element : getCanvasFromContainer(getDomContainer(id, domSourceElement));
    newItem.canvas.loadCanvas(sourceCanvas);
    await newItem.start();
    return newItem;
  }
  async refresh(refresh = true) {
    if (!refresh) {
      return;
    }
    await Promise.all(this.items.map((t) => t.refresh()));
  }
  removeEventListener(type, listener) {
    this._eventDispatcher.removeEventListener(type, listener);
  }
}
function initEngine() {
  return new Engine();
}
var RangeType;
(function(RangeType2) {
  RangeType2["circle"] = "circle";
  RangeType2["rectangle"] = "rectangle";
})(RangeType || (RangeType = {}));
var RotateDirection;
(function(RotateDirection2) {
  RotateDirection2["clockwise"] = "clockwise";
  RotateDirection2["counterClockwise"] = "counter-clockwise";
  RotateDirection2["random"] = "random";
})(RotateDirection || (RotateDirection = {}));
var LimitMode;
(function(LimitMode2) {
  LimitMode2["delete"] = "delete";
  LimitMode2["wait"] = "wait";
})(LimitMode || (LimitMode = {}));
var OutMode;
(function(OutMode2) {
  OutMode2["bounce"] = "bounce";
  OutMode2["none"] = "none";
  OutMode2["out"] = "out";
  OutMode2["destroy"] = "destroy";
  OutMode2["split"] = "split";
})(OutMode || (OutMode = {}));
var AlterType;
(function(AlterType2) {
  AlterType2["darken"] = "darken";
  AlterType2["enlighten"] = "enlighten";
})(AlterType || (AlterType = {}));
var GradientType;
(function(GradientType2) {
  GradientType2["linear"] = "linear";
  GradientType2["radial"] = "radial";
  GradientType2["random"] = "random";
})(GradientType || (GradientType = {}));
var ParticleOutType;
(function(ParticleOutType2) {
  ParticleOutType2["normal"] = "normal";
  ParticleOutType2["inside"] = "inside";
  ParticleOutType2["outside"] = "outside";
})(ParticleOutType || (ParticleOutType = {}));
var EasingType;
(function(EasingType2) {
  EasingType2["easeInBack"] = "ease-in-back";
  EasingType2["easeInBounce"] = "ease-in-bounce";
  EasingType2["easeInCirc"] = "ease-in-circ";
  EasingType2["easeInCubic"] = "ease-in-cubic";
  EasingType2["easeInElastic"] = "ease-in-elastic";
  EasingType2["easeInExpo"] = "ease-in-expo";
  EasingType2["easeInGaussian"] = "ease-in-gaussian";
  EasingType2["easeInLinear"] = "ease-in-linear";
  EasingType2["easeInQuad"] = "ease-in-quad";
  EasingType2["easeInQuart"] = "ease-in-quart";
  EasingType2["easeInQuint"] = "ease-in-quint";
  EasingType2["easeInSigmoid"] = "ease-in-sigmoid";
  EasingType2["easeInSine"] = "ease-in-sine";
  EasingType2["easeInSmoothstep"] = "ease-in-smoothstep";
  EasingType2["easeOutBack"] = "ease-out-back";
  EasingType2["easeOutBounce"] = "ease-out-bounce";
  EasingType2["easeOutCirc"] = "ease-out-circ";
  EasingType2["easeOutCubic"] = "ease-out-cubic";
  EasingType2["easeOutElastic"] = "ease-out-elastic";
  EasingType2["easeOutExpo"] = "ease-out-expo";
  EasingType2["easeOutGaussian"] = "ease-out-gaussian";
  EasingType2["easeOutLinear"] = "ease-out-linear";
  EasingType2["easeOutQuad"] = "ease-out-quad";
  EasingType2["easeOutQuart"] = "ease-out-quart";
  EasingType2["easeOutQuint"] = "ease-out-quint";
  EasingType2["easeOutSigmoid"] = "ease-out-sigmoid";
  EasingType2["easeOutSine"] = "ease-out-sine";
  EasingType2["easeOutSmoothstep"] = "ease-out-smoothstep";
  EasingType2["easeInOutBack"] = "ease-in-out-back";
  EasingType2["easeInOutBounce"] = "ease-in-out-bounce";
  EasingType2["easeInOutCirc"] = "ease-in-out-circ";
  EasingType2["easeInOutCubic"] = "ease-in-out-cubic";
  EasingType2["easeInOutElastic"] = "ease-in-out-elastic";
  EasingType2["easeInOutExpo"] = "ease-in-out-expo";
  EasingType2["easeInOutGaussian"] = "ease-in-out-gaussian";
  EasingType2["easeInOutLinear"] = "ease-in-out-linear";
  EasingType2["easeInOutQuad"] = "ease-in-out-quad";
  EasingType2["easeInOutQuart"] = "ease-in-out-quart";
  EasingType2["easeInOutQuint"] = "ease-in-out-quint";
  EasingType2["easeInOutSigmoid"] = "ease-in-out-sigmoid";
  EasingType2["easeInOutSine"] = "ease-in-out-sine";
  EasingType2["easeInOutSmoothstep"] = "ease-in-out-smoothstep";
})(EasingType || (EasingType = {}));
const tsParticles = initEngine();
var i = (i2) => {
  let { className: a, id: o, options: s, particlesLoaded: c, style: l, url: u } = i2, { loaded: d } = f();
  return reactExports.useEffect(() => {
    if (!d) return;
    let e;
    return tsParticles.load({
      id: o ?? "tsparticles",
      url: u,
      options: s
    }).then((t) => {
      e = t, c == null ? void 0 : c(t);
    }), () => {
      e == null ? void 0 : e.destroy();
    };
  }, [
    o,
    d,
    s,
    c,
    u
  ]), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
    id: o ?? "tsparticles",
    className: a,
    style: l
  });
};
var r = i;
function useDocumentVisible() {
  const [visible, setVisible] = reactExports.useState(
    () => typeof document === "undefined" ? true : document.visibilityState === "visible"
  );
  reactExports.useEffect(() => {
    const sync = () => {
      setVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return visible;
}
function ParticlesLayer({
  id,
  options,
  className,
  overlayClassName,
  fallbackClassName = "home-immersive-bg"
}) {
  const reduceMotion = useReducedMotion();
  const documentVisible = useDocumentVisible();
  const useStaticBackground = reduceMotion || !documentVisible;
  if (useStaticBackground) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn("pointer-events-none absolute inset-0", fallbackClassName, className),
        "aria-hidden": true
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("pointer-events-none absolute inset-0", className), "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(r, { id, className: "h-full w-full", options }),
    overlayClassName ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0", overlayClassName) }) : null
  ] });
}
const ParticlesLayer$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ParticlesLayer
}, Symbol.toStringTag, { value: "Module" }));
export {
  hPhase as $,
  AlterType as A,
  degToRad as B,
  deleteCount as C,
  DestroyType as D,
  EventType as E,
  double as F,
  doublePI as G,
  empty as H,
  executeOnSingleOrMultiple as I,
  generatedAttribute as J,
  getFullScreenStyle as K,
  LimitMode as L,
  MoveDirection as M,
  getLogger as N,
  OutMode as O,
  ParticleOutType as P,
  getParticleBaseVelocity as Q,
  RangeType as R,
  StartValueType as S,
  getParticleDirectionAngle as T,
  getPosition as U,
  Vector as V,
  getRandom as W,
  getRandomInRange as X,
  getRangeValue as Y,
  hMax as Z,
  hMin as _,
  AnimationMode as a,
  half as a0,
  identity as a1,
  initParticleNumericAnimationValue as a2,
  isArray as a3,
  isBoolean as a4,
  isInArray as a5,
  isNull as a6,
  isNumber as a7,
  isObject as a8,
  isString as a9,
  safeMutationObserver as aA,
  setRangeValue as aB,
  sextuple as aC,
  spatialHashGridCellSize as aD,
  squareExp as aE,
  triple as aF,
  tryCountIncrement as aG,
  visibilityChangeEvent as aH,
  zIndexFactorOffset as aI,
  itemFromArray as aa,
  itemFromSingleOrMultiple as ab,
  lFactor as ac,
  lMax as ad,
  lMin as ae,
  manageListener as af,
  millisecondsToSeconds as ag,
  minCount as ah,
  minFpsLimit as ai,
  minIndex as aj,
  minLimit as ak,
  minStrokeWidth as al,
  minZ as am,
  minimumSize as an,
  one as ao,
  originPoint as ap,
  phaseNumerator as aq,
  randomColorValue as ar,
  randomInRangeValue as as,
  resizeEvent as at,
  rgbMax as au,
  sMax as av,
  sMin as aw,
  sNormalizedOffset as ax,
  safeDocument as ay,
  safeMatchMedia as az,
  ParticlesLayer$1 as b,
  PixelMode as c,
  Vector3d as d,
  animate as e,
  calcExactPositionOrRandomFromSize as f,
  cancelAnimation as g,
  checkDistance as h,
  clamp as i,
  cloneStyle as j,
  countOffset as k,
  deepExtend as l,
  defaultAngle as m,
  defaultCompositeValue as n,
  defaultDensityFactor as o,
  defaultFps as p,
  defaultFpsLimit as q,
  defaultOpacity as r,
  defaultRatio as s,
  defaultReduceFactor as t,
  defaultRemoveQuantity as u,
  defaultRetryCount as v,
  defaultRgbMin as w,
  defaultTransform as x,
  defaultTransformValue as y,
  defaultZoom as z
};
