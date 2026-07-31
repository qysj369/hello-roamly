var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { R as RangeType, h as checkDistance, aE as squareExp, a as AnimationMode, S as StartValueType, a6 as isNull, aB as setRangeValue, _ as hMin, Z as hMax, ae as lMin, ad as lMax, aw as sMin, av as sMax, a9 as isString, a3 as isArray, l as deepExtend, c as PixelMode, O as OutMode, M as MoveDirection, a7 as isNumber, a8 as isObject, D as DestroyType, L as LimitMode, I as executeOnSingleOrMultiple, a4 as isBoolean, ap as originPoint, al as minStrokeWidth, z as defaultZoom, aa as itemFromArray, r as defaultOpacity, ar as randomColorValue, a0 as half, A as AlterType, ac as lFactor, au as rgbMax, F as double, $ as hPhase, X as getRandomInRange, a1 as identity, w as defaultRgbMin, aC as sextuple, aF as triple, aq as phaseNumerator, ax as sNormalizedOffset, an as minimumSize, aI as zIndexFactorOffset, n as defaultCompositeValue, y as defaultTransformValue, aA as safeMutationObserver, J as generatedAttribute, j as cloneStyle, az as safeMatchMedia, K as getFullScreenStyle, ay as safeDocument, ag as millisecondsToSeconds, af as manageListener, aH as visibilityChangeEvent, at as resizeEvent, d as Vector3d, E as EventType, m as defaultAngle, Y as getRangeValue, x as defaultTransform, P as ParticleOutType, ab as itemFromSingleOrMultiple, W as getRandom, a2 as initParticleNumericAnimationValue, f as calcExactPositionOrRandomFromSize, v as defaultRetryCount, aG as tryCountIncrement, Q as getParticleBaseVelocity, B as degToRad, as as randomInRangeValue, i as clamp, am as minZ, U as getPosition, T as getParticleDirectionAngle, V as Vector, G as doublePI, a5 as isInArray, aD as spatialHashGridCellSize, ak as minLimit, ah as minCount, N as getLogger, ao as one, aj as minIndex, u as defaultRemoveQuantity, o as defaultDensityFactor, H as empty, C as deleteCount, k as countOffset, s as defaultRatio, t as defaultReduceFactor, e as animate, q as defaultFpsLimit, ai as minFpsLimit, g as cancelAnimation, p as defaultFps } from "./ParticlesLayer-BuYVz6K_.js";
import "./vendor-react-DtfH6MSw.js";
import "./index-DwV1qlqh.js";
import "./vendor-three-Blpl5Qyv.js";
class BaseRange {
  constructor(x, y, type) {
    __publicField(this, "position");
    __publicField(this, "type");
    this.position = {
      x,
      y
    };
    this.type = type;
  }
  _resetPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}
class Circle extends BaseRange {
  constructor(x, y, radius) {
    super(x, y, RangeType.circle);
    __publicField(this, "radius");
    this.radius = radius;
  }
  contains(point) {
    return checkDistance(point, this.position, this.radius);
  }
  intersects(range) {
    const pos1 = this.position, pos2 = range.position, r = this.radius, dx = Math.abs(pos2.x - pos1.x), dy = Math.abs(pos2.y - pos1.y);
    if (range instanceof Circle || range.type === RangeType.circle) {
      const circleRange = range, rSum = r + circleRange.radius, dist = Math.hypot(dx, dy);
      return rSum > dist;
    } else if (range instanceof Rectangle || range.type === RangeType.rectangle) {
      const rectRange = range, { width, height } = rectRange.size, edges = Math.pow(dx - width, squareExp) + Math.pow(dy - height, squareExp);
      return edges <= r ** squareExp || dx <= r + width && dy <= r + height || dx <= width || dy <= height;
    }
    return false;
  }
  reset(x, y, radius) {
    this._resetPosition(x, y);
    this.radius = radius;
    return this;
  }
}
class Rectangle extends BaseRange {
  constructor(x, y, width, height) {
    super(x, y, RangeType.rectangle);
    __publicField(this, "size");
    this.size = {
      height,
      width
    };
  }
  contains(point) {
    const w = this.size.width, h = this.size.height, pos = this.position;
    return point.x >= pos.x && point.x <= pos.x + w && point.y >= pos.y && point.y <= pos.y + h;
  }
  intersects(range) {
    if (range instanceof Circle) {
      return range.intersects(this);
    }
    if (!(range instanceof Rectangle)) {
      return false;
    }
    const w = this.size.width, h = this.size.height, pos1 = this.position, pos2 = range.position, size2 = range.size, w2 = size2.width, h2 = size2.height;
    return pos2.x < pos1.x + w && pos2.x + w2 > pos1.x && pos2.y < pos1.y + h && pos2.y + h2 > pos1.y;
  }
  reset(x, y, width, height) {
    this._resetPosition(x, y);
    this.size.width = width;
    this.size.height = height;
    return this;
  }
}
class AnimationOptions {
  constructor() {
    __publicField(this, "count");
    __publicField(this, "decay");
    __publicField(this, "delay");
    __publicField(this, "enable");
    __publicField(this, "speed");
    __publicField(this, "sync");
    this.count = 0;
    this.enable = false;
    this.speed = 1;
    this.decay = 0;
    this.delay = 0;
    this.sync = false;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.count !== void 0) {
      this.count = setRangeValue(data.count);
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    if (data.speed !== void 0) {
      this.speed = setRangeValue(data.speed);
    }
    if (data.decay !== void 0) {
      this.decay = setRangeValue(data.decay);
    }
    if (data.delay !== void 0) {
      this.delay = setRangeValue(data.delay);
    }
    if (data.sync !== void 0) {
      this.sync = data.sync;
    }
  }
}
class RangedAnimationOptions extends AnimationOptions {
  constructor() {
    super();
    __publicField(this, "mode");
    __publicField(this, "startValue");
    this.mode = AnimationMode.auto;
    this.startValue = StartValueType.random;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    if (data.mode !== void 0) {
      this.mode = data.mode;
    }
    if (data.startValue !== void 0) {
      this.startValue = data.startValue;
    }
  }
}
class ColorAnimation extends AnimationOptions {
  constructor(min, max) {
    super();
    __publicField(this, "max");
    __publicField(this, "min");
    __publicField(this, "offset");
    this.min = min;
    this.max = max;
    this.offset = 0;
    this.sync = true;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    if (data.max !== void 0) {
      this.max = data.max;
    }
    if (data.min !== void 0) {
      this.min = data.min;
    }
    if (data.offset !== void 0) {
      this.offset = setRangeValue(data.offset);
    }
  }
}
class HslAnimation {
  constructor() {
    __publicField(this, "h", new ColorAnimation(hMin, hMax));
    __publicField(this, "l", new ColorAnimation(lMin, lMax));
    __publicField(this, "s", new ColorAnimation(sMin, sMax));
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    this.h.load(data.h);
    this.s.load(data.s);
    this.l.load(data.l);
  }
}
class OptionsColor {
  constructor() {
    __publicField(this, "value");
    this.value = "";
  }
  static create(source, data) {
    const color = new OptionsColor();
    color.load(source);
    if (data !== void 0) {
      if (isString(data) || isArray(data)) {
        color.load({ value: data });
      } else {
        color.load(data);
      }
    }
    return color;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (!isNull(data.value)) {
      this.value = data.value;
    }
  }
}
class AnimatableColor extends OptionsColor {
  constructor() {
    super();
    __publicField(this, "animation");
    this.animation = new HslAnimation();
  }
  static create(source, data) {
    const color = new AnimatableColor();
    color.load(source);
    if (data !== void 0) {
      if (isString(data) || isArray(data)) {
        color.load({ value: data });
      } else {
        color.load(data);
      }
    }
    return color;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    const colorAnimation = data.animation;
    if (colorAnimation !== void 0) {
      if (colorAnimation.enable === void 0) {
        this.animation.load(data.animation);
      } else {
        this.animation.h.load(colorAnimation);
      }
    }
  }
}
class Background {
  constructor() {
    __publicField(this, "color");
    __publicField(this, "image");
    __publicField(this, "opacity");
    __publicField(this, "position");
    __publicField(this, "repeat");
    __publicField(this, "size");
    this.color = new OptionsColor();
    this.color.value = "";
    this.image = "";
    this.position = "";
    this.repeat = "";
    this.size = "";
    this.opacity = 1;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.color !== void 0) {
      this.color = OptionsColor.create(this.color, data.color);
    }
    if (data.image !== void 0) {
      this.image = data.image;
    }
    if (data.position !== void 0) {
      this.position = data.position;
    }
    if (data.repeat !== void 0) {
      this.repeat = data.repeat;
    }
    if (data.size !== void 0) {
      this.size = data.size;
    }
    if (data.opacity !== void 0) {
      this.opacity = data.opacity;
    }
  }
}
class FullScreen {
  constructor() {
    __publicField(this, "enable");
    __publicField(this, "zIndex");
    this.enable = true;
    this.zIndex = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    if (data.zIndex !== void 0) {
      this.zIndex = data.zIndex;
    }
  }
}
class ResizeEvent {
  constructor() {
    __publicField(this, "delay");
    __publicField(this, "enable");
    this.delay = 0.5;
    this.enable = true;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.delay !== void 0) {
      this.delay = data.delay;
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
  }
}
class Effect {
  constructor() {
    __publicField(this, "close");
    __publicField(this, "options");
    __publicField(this, "type");
    this.close = true;
    this.options = {};
    this.type = [];
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    const options = data.options;
    if (options !== void 0) {
      for (const effect in options) {
        const item = options[effect];
        if (item) {
          this.options[effect] = deepExtend(this.options[effect] ?? {}, item);
        }
      }
    }
    if (data.close !== void 0) {
      this.close = data.close;
    }
    if (data.type !== void 0) {
      this.type = data.type;
    }
  }
}
class Fill {
  constructor() {
    __publicField(this, "color");
    __publicField(this, "enable");
    __publicField(this, "opacity");
    this.enable = true;
    this.opacity = 1;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.color !== void 0) {
      this.color = AnimatableColor.create(this.color, data.color);
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    if (data.opacity !== void 0) {
      this.opacity = setRangeValue(data.opacity);
    }
  }
}
class MoveAngle {
  constructor() {
    __publicField(this, "offset");
    __publicField(this, "value");
    this.offset = 0;
    this.value = 90;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.offset !== void 0) {
      this.offset = setRangeValue(data.offset);
    }
    if (data.value !== void 0) {
      this.value = setRangeValue(data.value);
    }
  }
}
class MoveCenter {
  constructor() {
    __publicField(this, "mode");
    __publicField(this, "radius");
    __publicField(this, "x");
    __publicField(this, "y");
    this.x = 50;
    this.y = 50;
    this.mode = PixelMode.percent;
    this.radius = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.x !== void 0) {
      this.x = data.x;
    }
    if (data.y !== void 0) {
      this.y = data.y;
    }
    if (data.mode !== void 0) {
      this.mode = data.mode;
    }
    if (data.radius !== void 0) {
      this.radius = data.radius;
    }
  }
}
class MoveGravity {
  constructor() {
    __publicField(this, "acceleration");
    __publicField(this, "enable");
    __publicField(this, "inverse");
    __publicField(this, "maxSpeed");
    this.acceleration = 9.81;
    this.enable = false;
    this.inverse = false;
    this.maxSpeed = 50;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.acceleration !== void 0) {
      this.acceleration = setRangeValue(data.acceleration);
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    if (data.inverse !== void 0) {
      this.inverse = data.inverse;
    }
    if (data.maxSpeed !== void 0) {
      this.maxSpeed = setRangeValue(data.maxSpeed);
    }
  }
}
class ValueWithRandom {
  constructor() {
    __publicField(this, "value");
    this.value = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (!isNull(data.value)) {
      this.value = setRangeValue(data.value);
    }
  }
}
class AnimationValueWithRandom extends ValueWithRandom {
  constructor() {
    super(...arguments);
    __publicField(this, "animation", new AnimationOptions());
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    const animation = data.animation;
    if (animation !== void 0) {
      this.animation.load(animation);
    }
  }
}
class RangedAnimationValueWithRandom extends AnimationValueWithRandom {
  constructor() {
    super();
    __publicField(this, "animation");
    this.animation = new RangedAnimationOptions();
  }
  load(data) {
    super.load(data);
  }
}
class MovePath {
  constructor() {
    __publicField(this, "clamp");
    __publicField(this, "delay");
    __publicField(this, "enable");
    __publicField(this, "generator");
    __publicField(this, "options");
    this.clamp = true;
    this.delay = new ValueWithRandom();
    this.enable = false;
    this.options = {};
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.clamp !== void 0) {
      this.clamp = data.clamp;
    }
    this.delay.load(data.delay);
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    this.generator = data.generator;
    if (data.options) {
      this.options = deepExtend(this.options, data.options);
    }
  }
}
class OutModes {
  constructor() {
    __publicField(this, "bottom");
    __publicField(this, "default");
    __publicField(this, "left");
    __publicField(this, "right");
    __publicField(this, "top");
    this.default = OutMode.out;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.default !== void 0) {
      this.default = data.default;
    }
    this.bottom = data.bottom ?? data.default;
    this.left = data.left ?? data.default;
    this.right = data.right ?? data.default;
    this.top = data.top ?? data.default;
  }
}
class Spin {
  constructor() {
    __publicField(this, "acceleration");
    __publicField(this, "enable");
    __publicField(this, "position");
    this.acceleration = 0;
    this.enable = false;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.acceleration !== void 0) {
      this.acceleration = setRangeValue(data.acceleration);
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    if (data.position) {
      this.position = deepExtend({}, data.position);
    }
  }
}
class Move {
  constructor() {
    __publicField(this, "angle");
    __publicField(this, "center");
    __publicField(this, "decay");
    __publicField(this, "direction");
    __publicField(this, "distance");
    __publicField(this, "drift");
    __publicField(this, "enable");
    __publicField(this, "gravity");
    __publicField(this, "outModes");
    __publicField(this, "path");
    __publicField(this, "random");
    __publicField(this, "size");
    __publicField(this, "speed");
    __publicField(this, "spin");
    __publicField(this, "straight");
    __publicField(this, "vibrate");
    __publicField(this, "warp");
    this.angle = new MoveAngle();
    this.center = new MoveCenter();
    this.decay = 0;
    this.distance = {};
    this.direction = MoveDirection.none;
    this.drift = 0;
    this.enable = false;
    this.gravity = new MoveGravity();
    this.path = new MovePath();
    this.outModes = new OutModes();
    this.random = false;
    this.size = false;
    this.speed = 2;
    this.spin = new Spin();
    this.straight = false;
    this.vibrate = false;
    this.warp = false;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    this.angle.load(isNumber(data.angle) ? { value: data.angle } : data.angle);
    this.center.load(data.center);
    if (data.decay !== void 0) {
      this.decay = setRangeValue(data.decay);
    }
    if (data.direction !== void 0) {
      this.direction = data.direction;
    }
    if (data.distance !== void 0) {
      this.distance = isNumber(data.distance) ? {
        horizontal: data.distance,
        vertical: data.distance
      } : { ...data.distance };
    }
    if (data.drift !== void 0) {
      this.drift = setRangeValue(data.drift);
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    this.gravity.load(data.gravity);
    const outModes = data.outModes;
    if (outModes !== void 0) {
      if (isObject(outModes)) {
        this.outModes.load(outModes);
      } else {
        this.outModes.load({
          default: outModes
        });
      }
    }
    this.path.load(data.path);
    if (data.random !== void 0) {
      this.random = data.random;
    }
    if (data.size !== void 0) {
      this.size = data.size;
    }
    if (data.speed !== void 0) {
      this.speed = setRangeValue(data.speed);
    }
    this.spin.load(data.spin);
    if (data.straight !== void 0) {
      this.straight = data.straight;
    }
    if (data.vibrate !== void 0) {
      this.vibrate = data.vibrate;
    }
    if (data.warp !== void 0) {
      this.warp = data.warp;
    }
  }
}
class OpacityAnimation extends RangedAnimationOptions {
  constructor() {
    super();
    __publicField(this, "destroy");
    this.destroy = DestroyType.none;
    this.speed = 2;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    if (data.destroy !== void 0) {
      this.destroy = data.destroy;
    }
  }
}
class Opacity extends RangedAnimationValueWithRandom {
  constructor() {
    super();
    __publicField(this, "animation");
    this.animation = new OpacityAnimation();
    this.value = 1;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    super.load(data);
    const animation = data.animation;
    if (animation !== void 0) {
      this.animation.load(animation);
    }
  }
}
class Stroke {
  constructor() {
    __publicField(this, "color");
    __publicField(this, "opacity");
    __publicField(this, "width");
    this.width = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.color !== void 0) {
      this.color = AnimatableColor.create(this.color, data.color);
    }
    if (data.width !== void 0) {
      this.width = setRangeValue(data.width);
    }
    if (data.opacity !== void 0) {
      this.opacity = setRangeValue(data.opacity);
    }
  }
}
class Paint {
  constructor() {
    __publicField(this, "color");
    __publicField(this, "fill");
    __publicField(this, "stroke");
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.color !== void 0) {
      this.color = AnimatableColor.create(this.color, data.color);
    }
    if (data.fill !== void 0) {
      this.fill ?? (this.fill = new Fill());
      this.fill.load(data.fill);
    }
    if (data.stroke !== void 0) {
      this.stroke ?? (this.stroke = new Stroke());
      this.stroke.load(data.stroke);
    }
  }
}
class ParticlesBounceFactor extends ValueWithRandom {
  constructor() {
    super();
    this.value = 1;
  }
}
class ParticlesBounce {
  constructor() {
    __publicField(this, "horizontal");
    __publicField(this, "vertical");
    this.horizontal = new ParticlesBounceFactor();
    this.vertical = new ParticlesBounceFactor();
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    this.horizontal.load(data.horizontal);
    this.vertical.load(data.vertical);
  }
}
class ParticlesDensity {
  constructor() {
    __publicField(this, "enable");
    __publicField(this, "height");
    __publicField(this, "width");
    this.enable = false;
    this.width = 1920;
    this.height = 1080;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.enable !== void 0) {
      this.enable = data.enable;
    }
    const width = data.width;
    if (width !== void 0) {
      this.width = width;
    }
    const height = data.height;
    if (height !== void 0) {
      this.height = height;
    }
  }
}
class ParticlesNumberLimit {
  constructor() {
    __publicField(this, "mode");
    __publicField(this, "value");
    this.mode = LimitMode.delete;
    this.value = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.mode !== void 0) {
      this.mode = data.mode;
    }
    if (data.value !== void 0) {
      this.value = data.value;
    }
  }
}
class ParticlesNumber {
  constructor() {
    __publicField(this, "density");
    __publicField(this, "limit");
    __publicField(this, "value");
    this.density = new ParticlesDensity();
    this.limit = new ParticlesNumberLimit();
    this.value = 0;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    this.density.load(data.density);
    this.limit.load(data.limit);
    if (data.value !== void 0) {
      this.value = data.value;
    }
  }
}
class Shape {
  constructor() {
    __publicField(this, "close");
    __publicField(this, "options");
    __publicField(this, "type");
    this.close = true;
    this.options = {};
    this.type = "circle";
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    const options = data.options;
    if (options !== void 0) {
      for (const shape in options) {
        const item = options[shape];
        if (item) {
          this.options[shape] = deepExtend(this.options[shape] ?? {}, item);
        }
      }
    }
    if (data.close !== void 0) {
      this.close = data.close;
    }
    if (data.type !== void 0) {
      this.type = data.type;
    }
  }
}
class SizeAnimation extends RangedAnimationOptions {
  constructor() {
    super();
    __publicField(this, "destroy");
    this.destroy = DestroyType.none;
    this.speed = 5;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    if (data.destroy !== void 0) {
      this.destroy = data.destroy;
    }
  }
}
class Size extends RangedAnimationValueWithRandom {
  constructor() {
    super();
    __publicField(this, "animation");
    this.animation = new SizeAnimation();
    this.value = 3;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    const animation = data.animation;
    if (animation !== void 0) {
      this.animation.load(animation);
    }
  }
}
class ZIndex extends ValueWithRandom {
  constructor() {
    super();
    __publicField(this, "opacityRate");
    __publicField(this, "sizeRate");
    __publicField(this, "velocityRate");
    this.opacityRate = 1;
    this.sizeRate = 1;
    this.velocityRate = 1;
  }
  load(data) {
    super.load(data);
    if (isNull(data)) {
      return;
    }
    if (data.opacityRate !== void 0) {
      this.opacityRate = data.opacityRate;
    }
    if (data.sizeRate !== void 0) {
      this.sizeRate = data.sizeRate;
    }
    if (data.velocityRate !== void 0) {
      this.velocityRate = data.velocityRate;
    }
  }
}
class ParticlesOptions {
  constructor(pluginManager, container) {
    __publicField(this, "bounce");
    __publicField(this, "effect");
    __publicField(this, "groups");
    __publicField(this, "move");
    __publicField(this, "number");
    __publicField(this, "opacity");
    __publicField(this, "paint");
    __publicField(this, "palette");
    __publicField(this, "reduceDuplicates");
    __publicField(this, "shape");
    __publicField(this, "size");
    __publicField(this, "zIndex");
    __publicField(this, "_container");
    __publicField(this, "_pluginManager");
    __publicField(this, "_importPalette", (palette) => {
      const paletteData = this._pluginManager.getPalette(palette);
      if (!paletteData) {
        return;
      }
      const paletteColors = paletteData.colors, defaultPaintStrokeWidth = 0, defaultPaintVariantsLength = 1, firstPaintVariantIndex = 0, defaultPalettePaintVariant = {}, colorVariants = isArray(paletteColors) ? paletteColors : [paletteColors], palettePaintVariants = colorVariants.flatMap((variant) => {
        const paletteFill = variant.fill, paletteStroke = variant.stroke, fillPart = paletteFill ? {
          color: {
            value: paletteFill.value
          },
          enable: paletteFill.enable,
          opacity: paletteFill.opacity
        } : void 0;
        if (!paletteStroke) {
          return [
            {
              fill: fillPart
            }
          ];
        }
        return [
          {
            fill: fillPart,
            stroke: {
              color: {
                value: paletteStroke.value
              },
              opacity: paletteStroke.opacity,
              width: paletteStroke.width || defaultPaintStrokeWidth
            }
          }
        ];
      }), palettePaint = palettePaintVariants.length > defaultPaintVariantsLength ? palettePaintVariants : palettePaintVariants[firstPaintVariantIndex] ?? defaultPalettePaintVariant;
      this.load({
        paint: palettePaint,
        blend: {
          enable: true,
          mode: paletteData.blendMode
        }
      });
    });
    this._pluginManager = pluginManager;
    this._container = container;
    this.bounce = new ParticlesBounce();
    this.effect = new Effect();
    this.groups = {};
    this.move = new Move();
    this.number = new ParticlesNumber();
    this.opacity = new Opacity();
    this.paint = new Paint();
    this.paint.color = new AnimatableColor();
    this.paint.color.value = "#fff";
    this.paint.fill = new Fill();
    this.paint.fill.enable = true;
    this.reduceDuplicates = false;
    this.shape = new Shape();
    this.size = new Size();
    this.zIndex = new ZIndex();
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.palette) {
      this.palette = data.palette;
      this._importPalette(this.palette);
    }
    if (data.groups !== void 0) {
      for (const group of Object.keys(data.groups)) {
        if (!(group in data.groups)) {
          continue;
        }
        const item = data.groups[group];
        if (item !== void 0) {
          this.groups[group] = deepExtend(this.groups[group] ?? {}, item);
        }
      }
    }
    if (data.reduceDuplicates !== void 0) {
      this.reduceDuplicates = data.reduceDuplicates;
    }
    this.bounce.load(data.bounce);
    this.effect.load(data.effect);
    this.move.load(data.move);
    this.number.load(data.number);
    this.opacity.load(data.opacity);
    const paintToLoad = data.paint;
    if (paintToLoad) {
      if (isArray(paintToLoad)) {
        this.paint = executeOnSingleOrMultiple(paintToLoad, (t) => {
          const tmp = new Paint();
          tmp.load(t);
          return tmp;
        });
      } else if (isArray(this.paint)) {
        this.paint = new Paint();
        this.paint.load(paintToLoad);
      } else {
        this.paint.load(paintToLoad);
      }
    }
    this.shape.load(data.shape);
    this.size.load(data.size);
    this.zIndex.load(data.zIndex);
    if (this._container) {
      for (const plugin of this._pluginManager.plugins) {
        if (plugin.loadParticlesOptions) {
          plugin.loadParticlesOptions(this._container, this, data);
        }
      }
      const updaters = this._pluginManager.updaters.get(this._container);
      if (updaters) {
        for (const updater of updaters) {
          if (updater.loadOptions) {
            updater.loadOptions(this, data);
          }
        }
      }
    }
  }
}
function loadOptions(options, ...sourceOptionsArr) {
  for (const sourceOptions of sourceOptionsArr) {
    options.load(sourceOptions);
  }
}
function loadParticlesOptions(pluginManager, container, ...sourceOptionsArr) {
  const options = new ParticlesOptions(pluginManager, container);
  loadOptions(options, ...sourceOptionsArr);
  return options;
}
class Options {
  constructor(pluginManager, container) {
    __publicField(this, "autoPlay");
    __publicField(this, "background");
    __publicField(this, "clear");
    __publicField(this, "defaultThemes");
    __publicField(this, "delay");
    __publicField(this, "detectRetina");
    __publicField(this, "duration");
    __publicField(this, "fpsLimit");
    __publicField(this, "fullScreen");
    __publicField(this, "hdr");
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "palette");
    __publicField(this, "particles");
    __publicField(this, "pauseOnBlur");
    __publicField(this, "pauseOnOutsideViewport");
    __publicField(this, "preset");
    __publicField(this, "resize");
    __publicField(this, "smooth");
    __publicField(this, "style");
    __publicField(this, "zLayers");
    __publicField(this, "_container");
    __publicField(this, "_pluginManager");
    __publicField(this, "_importPalette", (palette) => {
      const paletteData = this._pluginManager.getPalette(palette);
      if (!paletteData) {
        return;
      }
      this.load({
        background: {
          color: paletteData.background
        },
        blend: {
          enable: true,
          mode: paletteData.blendMode
        },
        particles: {
          palette
        }
      });
    });
    __publicField(this, "_importPreset", (preset) => {
      this.load(this._pluginManager.getPreset(preset));
    });
    this._pluginManager = pluginManager;
    this._container = container;
    this.autoPlay = true;
    this.background = new Background();
    this.clear = true;
    this.defaultThemes = {};
    this.delay = 0;
    this.fullScreen = new FullScreen();
    this.detectRetina = true;
    this.duration = 0;
    this.fpsLimit = 120;
    this.hdr = true;
    this.particles = loadParticlesOptions(this._pluginManager, this._container);
    this.pauseOnBlur = true;
    this.pauseOnOutsideViewport = true;
    this.resize = new ResizeEvent();
    this.smooth = false;
    this.style = {};
    this.zLayers = 100;
  }
  load(data) {
    if (isNull(data)) {
      return;
    }
    if (data.preset !== void 0) {
      this.preset = data.preset;
      executeOnSingleOrMultiple(this.preset, (preset) => {
        this._importPreset(preset);
      });
    }
    if (data.palette !== void 0) {
      this.palette = data.palette;
      this._importPalette(this.palette);
    }
    if (data.autoPlay !== void 0) {
      this.autoPlay = data.autoPlay;
    }
    if (data.clear !== void 0) {
      this.clear = data.clear;
    }
    if (data.key !== void 0) {
      this.key = data.key;
    }
    if (data.name !== void 0) {
      this.name = data.name;
    }
    if (data.delay !== void 0) {
      this.delay = setRangeValue(data.delay);
    }
    const detectRetina = data.detectRetina;
    if (detectRetina !== void 0) {
      this.detectRetina = detectRetina;
    }
    if (data.duration !== void 0) {
      this.duration = setRangeValue(data.duration);
    }
    const fpsLimit = data.fpsLimit;
    if (fpsLimit !== void 0) {
      this.fpsLimit = fpsLimit;
    }
    if (data.hdr !== void 0) {
      this.hdr = data.hdr;
    }
    if (data.pauseOnBlur !== void 0) {
      this.pauseOnBlur = data.pauseOnBlur;
    }
    if (data.pauseOnOutsideViewport !== void 0) {
      this.pauseOnOutsideViewport = data.pauseOnOutsideViewport;
    }
    if (data.zLayers !== void 0) {
      this.zLayers = data.zLayers;
    }
    this.background.load(data.background);
    const fullScreen = data.fullScreen;
    if (isBoolean(fullScreen)) {
      this.fullScreen.enable = fullScreen;
    } else {
      this.fullScreen.load(fullScreen);
    }
    this.particles.load(data.particles);
    this.resize.load(data.resize);
    this.style = deepExtend(this.style, data.style);
    if (data.smooth !== void 0) {
      this.smooth = data.smooth;
    }
    this._pluginManager.plugins.forEach((plugin) => {
      plugin.loadOptions(this._container, this, data);
    });
  }
}
function paintBase(context, dimension, baseColor) {
  context.fillStyle = baseColor ?? "rgba(0,0,0,0)";
  context.fillRect(originPoint.x, originPoint.y, dimension.width, dimension.height);
}
function paintImage(context, dimension, image, opacity) {
  if (!image) {
    return;
  }
  const prevAlpha = context.globalAlpha;
  context.globalAlpha = opacity;
  context.drawImage(image, originPoint.x, originPoint.y, dimension.width, dimension.height);
  context.globalAlpha = prevAlpha;
}
function clear(context, dimension) {
  context.clearRect(originPoint.x, originPoint.y, dimension.width, dimension.height);
}
function drawParticle(data) {
  var _a;
  const { container, context, particle, delta, colorStyles, radius, opacity, transform } = data, { effectDrawers, shapeDrawers } = container, pos = particle.getPosition(), transformData = particle.getTransformData(transform), drawScale = defaultZoom, drawPosition = {
    x: pos.x,
    y: pos.y
  };
  context.setTransform(transformData.a, transformData.b, transformData.c, transformData.d, pos.x, pos.y);
  if (colorStyles.fill) {
    context.fillStyle = colorStyles.fill;
  }
  const fillEnabled = !!particle.fillEnabled, strokeWidth = particle.strokeWidth ?? minStrokeWidth;
  context.lineWidth = strokeWidth;
  if (colorStyles.stroke) {
    context.strokeStyle = colorStyles.stroke;
  }
  const drawData = {
    context,
    particle,
    radius,
    drawRadius: radius * drawScale,
    opacity,
    delta,
    pixelRatio: container.retina.pixelRatio,
    fill: fillEnabled,
    stroke: strokeWidth > minStrokeWidth,
    transformData,
    position: { ...pos },
    drawPosition,
    drawScale
  };
  for (const plugin of container.plugins) {
    (_a = plugin.drawParticleTransform) == null ? void 0 : _a.call(plugin, drawData);
  }
  const effect = particle.effect ? effectDrawers.get(particle.effect) : void 0, shape = particle.shape ? shapeDrawers.get(particle.shape) : void 0;
  drawBeforeEffect(effect, drawData);
  drawShapeBeforeDraw(shape, drawData);
  drawShape(shape, drawData);
  drawShapeAfterDraw(shape, drawData);
  drawAfterEffect(effect, drawData);
  context.resetTransform();
}
function drawAfterEffect(drawer, data) {
  if (!(drawer == null ? void 0 : drawer.drawAfter)) {
    return;
  }
  const { particle } = data;
  if (!particle.effect) {
    return;
  }
  drawer.drawAfter(data);
}
function drawBeforeEffect(drawer, data) {
  if (!(drawer == null ? void 0 : drawer.drawBefore)) {
    return;
  }
  const { particle } = data;
  if (!particle.effect) {
    return;
  }
  drawer.drawBefore(data);
}
function drawShape(drawer, data) {
  if (!drawer) {
    return;
  }
  const { context, fill, particle, stroke } = data;
  if (!particle.shape) {
    return;
  }
  context.beginPath();
  drawer.draw(data);
  if (particle.shapeClose) {
    context.closePath();
  }
  if (fill) {
    context.fill();
  }
  if (stroke) {
    context.stroke();
  }
}
function drawShapeAfterDraw(drawer, data) {
  if (!(drawer == null ? void 0 : drawer.afterDraw)) {
    return;
  }
  const { particle } = data;
  if (!particle.shape) {
    return;
  }
  drawer.afterDraw(data);
}
function drawShapeBeforeDraw(drawer, data) {
  if (!(drawer == null ? void 0 : drawer.beforeDraw)) {
    return;
  }
  const { particle } = data;
  if (!particle.shape) {
    return;
  }
  drawer.beforeDraw(data);
}
function drawParticlePlugin(context, plugin, particle, delta) {
  if (!plugin.drawParticle) {
    return;
  }
  plugin.drawParticle(context, particle, delta);
}
const styleCache = /* @__PURE__ */ new Map(), maxCacheSize = 1e3, firstIndex = 0, rgbFixedPrecision = 2, hslFixedPrecision = 2;
function getCachedStyle(key, generator) {
  let cached = styleCache.get(key);
  if (!cached) {
    cached = generator();
    if (styleCache.size >= maxCacheSize) {
      const keysToDelete = [...styleCache.keys()].slice(firstIndex, maxCacheSize * half);
      keysToDelete.forEach((k) => styleCache.delete(k));
    }
    styleCache.set(key, cached);
  }
  return cached;
}
function stringToRgba(pluginManager, input) {
  if (!input) {
    return;
  }
  for (const manager of pluginManager.colorManagers.values()) {
    if (manager.accepts(input)) {
      return manager.parseString(input);
    }
  }
  return void 0;
}
function rangeColorToRgb(pluginManager, input, index, useIndex = true) {
  if (!input) {
    return;
  }
  const color = isString(input) ? { value: input } : input;
  if (isString(color.value)) {
    return colorToRgb(pluginManager, color.value, index, useIndex);
  }
  if (isArray(color.value)) {
    const value = itemFromArray(color.value, index, useIndex);
    if (!value) {
      return;
    }
    return rangeColorToRgb(pluginManager, {
      value
    });
  }
  for (const manager of pluginManager.colorManagers.values()) {
    const res = manager.handleRangeColor(color);
    if (res) {
      return res;
    }
  }
  return void 0;
}
function colorToRgb(pluginManager, input, index, useIndex = true) {
  if (!input) {
    return;
  }
  const color = isString(input) ? { value: input } : input;
  if (isString(color.value)) {
    return color.value === randomColorValue ? getRandomRgbColor() : stringToRgb(pluginManager, color.value);
  }
  if (isArray(color.value)) {
    const value = itemFromArray(color.value, index, useIndex);
    if (!value) {
      return;
    }
    return colorToRgb(pluginManager, {
      value
    });
  }
  for (const manager of pluginManager.colorManagers.values()) {
    const res = manager.handleColor(color);
    if (res) {
      return res;
    }
  }
  return void 0;
}
function rangeColorToHsl(pluginManager, color, index, useIndex = true) {
  const rgb = rangeColorToRgb(pluginManager, color, index, useIndex);
  return rgb ? rgbToHsl(rgb) : void 0;
}
function rgbToHsl(color) {
  const r1 = color.r / rgbMax, g1 = color.g / rgbMax, b1 = color.b / rgbMax, max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1), res = {
    h: hMin,
    l: (max + min) * half,
    s: sMin
  };
  if (max !== min) {
    res.s = res.l < half ? (max - min) / (max + min) : (max - min) / (double - max - min);
    if (r1 === max) {
      res.h = (g1 - b1) / (max - min);
    } else if (g1 === max) {
      res.h = double + (b1 - r1) / (max - min);
    } else {
      res.h = double * double + (r1 - g1) / (max - min);
    }
  }
  res.l *= lMax;
  res.s *= sMax;
  res.h *= hPhase;
  if (res.h < hMin) {
    res.h += hMax;
  }
  if (res.h >= hMax) {
    res.h -= hMax;
  }
  return res;
}
function stringToRgb(pluginManager, input) {
  return stringToRgba(pluginManager, input);
}
function hslToRgb(hsl) {
  const h = (hsl.h % hMax + hMax) % hMax, s = Math.max(sMin, Math.min(sMax, hsl.s)), l = Math.max(lMin, Math.min(lMax, hsl.l)), hNormalized = h / hMax, sNormalized = s / sMax, lNormalized = l / lMax;
  if (s === sMin) {
    const grayscaleValue = Math.round(lNormalized * rgbMax);
    return { r: grayscaleValue, g: grayscaleValue, b: grayscaleValue };
  }
  const channel = (temp12, temp22, temp3) => {
    const temp3Min = 0, temp3Max = 1;
    if (temp3 < temp3Min) {
      temp3++;
    }
    if (temp3 > temp3Max) {
      temp3--;
    }
    if (temp3 * sextuple < temp3Max) {
      return temp12 + (temp22 - temp12) * sextuple * temp3;
    }
    if (temp3 * double < temp3Max) {
      return temp22;
    }
    if (temp3 * triple < temp3Max * double) {
      const temp3Offset = double / triple;
      return temp12 + (temp22 - temp12) * (temp3Offset - temp3) * sextuple;
    }
    return temp12;
  }, temp1 = lNormalized < half ? lNormalized * (sNormalizedOffset + sNormalized) : lNormalized + sNormalized - lNormalized * sNormalized, temp2 = double * lNormalized - temp1, phaseThird = phaseNumerator / triple, red = Math.min(rgbMax, rgbMax * channel(temp2, temp1, hNormalized + phaseThird)), green = Math.min(rgbMax, rgbMax * channel(temp2, temp1, hNormalized)), blue = Math.min(rgbMax, rgbMax * channel(temp2, temp1, hNormalized - phaseThird));
  return { r: Math.round(red), g: Math.round(green), b: Math.round(blue) };
}
function getRandomRgbColor(min) {
  const fixedMin = defaultRgbMin, fixedMax = rgbMax + identity, getRgbInRangeValue = () => Math.floor(getRandomInRange(fixedMin, fixedMax));
  return {
    b: getRgbInRangeValue(),
    g: getRgbInRangeValue(),
    r: getRgbInRangeValue()
  };
}
function getStyleFromRgb(color, hdr, opacity) {
  const op = opacity ?? defaultOpacity, key = `rgb-${color.r.toFixed(rgbFixedPrecision)}-${color.g.toFixed(rgbFixedPrecision)}-${color.b.toFixed(rgbFixedPrecision)}-${hdr ? "hdr" : "sdr"}-${op.toString()}`;
  return getCachedStyle(key, () => hdr ? getHdrStyleFromRgb(color, opacity) : getSdrStyleFromRgb(color, opacity));
}
function getHdrStyleFromRgb(color, opacity) {
  return `color(display-p3 ${(color.r / rgbMax).toString()} ${(color.g / rgbMax).toString()} ${(color.b / rgbMax).toString()} / ${(opacity ?? defaultOpacity).toString()})`;
}
function getSdrStyleFromRgb(color, opacity) {
  return `rgba(${color.r.toString()}, ${color.g.toString()}, ${color.b.toString()}, ${(opacity ?? defaultOpacity).toString()})`;
}
function getStyleFromHsl(color, hdr, opacity) {
  const op = opacity ?? defaultOpacity, key = `hsl-${color.h.toFixed(hslFixedPrecision)}-${color.s.toFixed(hslFixedPrecision)}-${color.l.toFixed(hslFixedPrecision)}-${hdr ? "hdr" : "sdr"}-${op.toString()}`;
  return getCachedStyle(key, () => hdr ? getHdrStyleFromHsl(color, opacity) : getSdrStyleFromHsl(color, opacity));
}
function getHdrStyleFromHsl(color, opacity) {
  return getHdrStyleFromRgb(hslToRgb(color), opacity);
}
function getSdrStyleFromHsl(color, opacity) {
  return `hsla(${color.h.toString()}, ${color.s.toString()}%, ${color.l.toString()}%, ${(opacity ?? defaultOpacity).toString()})`;
}
function getHslFromAnimation(animation) {
  return animation === void 0 ? void 0 : {
    h: animation.h.value,
    s: animation.s.value,
    l: animation.l.value
  };
}
function alterHsl(color, type, value) {
  return {
    h: color.h,
    s: color.s,
    l: color.l + (type === AlterType.darken ? -lFactor : lFactor) * value
  };
}
const fColorIndex = 0, sColorIndex = 1;
function setTransformValue(factor, newFactor, key) {
  const newValue = newFactor[key];
  if (newValue !== void 0) {
    factor[key] = (factor[key] ?? defaultTransformValue) * newValue;
  }
}
class RenderManager {
  constructor(pluginManager, container, canvasManager) {
    __publicField(this, "_canvasClearPlugins");
    __publicField(this, "_canvasManager");
    __publicField(this, "_canvasPaintPlugins");
    __publicField(this, "_clearDrawPlugins");
    __publicField(this, "_colorPlugins");
    __publicField(this, "_container");
    __publicField(this, "_context");
    __publicField(this, "_contextSettings");
    __publicField(this, "_drawParticlePlugins");
    __publicField(this, "_drawParticlesCleanupPlugins");
    __publicField(this, "_drawParticlesSetupPlugins");
    __publicField(this, "_drawPlugins");
    __publicField(this, "_drawSettingsCleanupPlugins");
    __publicField(this, "_drawSettingsSetupPlugins");
    __publicField(this, "_pluginManager");
    __publicField(this, "_postDrawUpdaters");
    __publicField(this, "_preDrawUpdaters");
    __publicField(this, "_reusableColorStyles", {});
    __publicField(this, "_reusablePluginColors", [void 0, void 0]);
    __publicField(this, "_reusableTransform", {});
    __publicField(this, "_applyPostDrawUpdaters", (particle) => {
      var _a;
      for (const updater of this._postDrawUpdaters) {
        (_a = updater.afterDraw) == null ? void 0 : _a.call(updater, particle);
      }
    });
    __publicField(this, "_applyPreDrawUpdaters", (ctx, particle, radius, zOpacity, colorStyles, transform) => {
      var _a;
      for (const updater of this._preDrawUpdaters) {
        if (updater.getColorStyles) {
          const { fill, stroke } = updater.getColorStyles(particle, ctx, radius, zOpacity);
          if (fill) {
            colorStyles.fill = fill;
          }
          if (stroke) {
            colorStyles.stroke = stroke;
          }
        }
        if (updater.getTransformValues) {
          const updaterTransform = updater.getTransformValues(particle);
          for (const key in updaterTransform) {
            setTransformValue(transform, updaterTransform, key);
          }
        }
        (_a = updater.beforeDraw) == null ? void 0 : _a.call(updater, particle);
      }
    });
    __publicField(this, "_getPluginParticleColors", (particle) => {
      let fColor, sColor;
      for (const plugin of this._colorPlugins) {
        if (!fColor && plugin.particleFillColor) {
          fColor = rangeColorToHsl(this._pluginManager, plugin.particleFillColor(particle));
        }
        if (!sColor && plugin.particleStrokeColor) {
          sColor = rangeColorToHsl(this._pluginManager, plugin.particleStrokeColor(particle));
        }
        if (fColor && sColor) {
          break;
        }
      }
      this._reusablePluginColors[fColorIndex] = fColor;
      this._reusablePluginColors[sColorIndex] = sColor;
      return this._reusablePluginColors;
    });
    this._pluginManager = pluginManager;
    this._container = container;
    this._canvasManager = canvasManager;
    this._context = null;
    this._preDrawUpdaters = [];
    this._postDrawUpdaters = [];
    this._colorPlugins = [];
    this._canvasClearPlugins = [];
    this._canvasPaintPlugins = [];
    this._clearDrawPlugins = [];
    this._drawParticlePlugins = [];
    this._drawParticlesCleanupPlugins = [];
    this._drawParticlesSetupPlugins = [];
    this._drawPlugins = [];
    this._drawSettingsSetupPlugins = [];
    this._drawSettingsCleanupPlugins = [];
  }
  get settings() {
    return this._contextSettings;
  }
  canvasClear() {
    if (!this._container.actualOptions.clear) {
      return;
    }
    this.draw((ctx) => {
      clear(ctx, this._canvasManager.size);
    });
  }
  clear() {
    var _a;
    let pluginHandled = false;
    for (const plugin of this._canvasClearPlugins) {
      pluginHandled = ((_a = plugin.canvasClear) == null ? void 0 : _a.call(plugin)) ?? false;
      if (pluginHandled) {
        break;
      }
    }
    if (pluginHandled) {
      return;
    }
    this.canvasClear();
  }
  destroy() {
    this.stop();
    this._preDrawUpdaters = [];
    this._postDrawUpdaters = [];
    this._colorPlugins = [];
    this._canvasClearPlugins = [];
    this._canvasPaintPlugins = [];
    this._clearDrawPlugins = [];
    this._drawParticlePlugins = [];
    this._drawParticlesCleanupPlugins = [];
    this._drawParticlesSetupPlugins = [];
    this._drawPlugins = [];
    this._drawSettingsSetupPlugins = [];
    this._drawSettingsCleanupPlugins = [];
  }
  draw(cb) {
    const ctx = this._context;
    if (!ctx) {
      return;
    }
    return cb(ctx);
  }
  drawParticle(particle, delta) {
    if (particle.spawning || particle.destroyed) {
      return;
    }
    const radius = particle.getRadius();
    if (radius <= minimumSize) {
      return;
    }
    const pfColor = particle.getFillColor(), psColor = particle.getStrokeColor();
    let [fColor, sColor] = this._getPluginParticleColors(particle);
    fColor ?? (fColor = pfColor);
    sColor ?? (sColor = psColor);
    if (!fColor && !sColor) {
      return;
    }
    const container = this._container, zIndexOptions = particle.options.zIndex, zIndexFactor = zIndexFactorOffset - particle.zIndexFactor, { fillOpacity, opacity, strokeOpacity } = particle.getOpacity(), transform = this._reusableTransform, colorStyles = this._reusableColorStyles, fill = fColor ? getStyleFromHsl(fColor, container.hdr, fillOpacity * opacity) : void 0, stroke = sColor ? getStyleFromHsl(sColor, container.hdr, strokeOpacity * opacity) : fill;
    transform.a = transform.b = transform.c = transform.d = void 0;
    colorStyles.fill = fill;
    colorStyles.stroke = stroke;
    this.draw((context) => {
      var _a, _b;
      for (const plugin of this._drawParticlesSetupPlugins) {
        (_a = plugin.drawParticleSetup) == null ? void 0 : _a.call(plugin, context, particle, delta);
      }
      this._applyPreDrawUpdaters(context, particle, radius, opacity, colorStyles, transform);
      drawParticle({
        container,
        context,
        particle,
        delta,
        colorStyles,
        radius: radius * zIndexFactor ** zIndexOptions.sizeRate,
        opacity,
        transform
      });
      this._applyPostDrawUpdaters(particle);
      for (const plugin of this._drawParticlesCleanupPlugins) {
        (_b = plugin.drawParticleCleanup) == null ? void 0 : _b.call(plugin, context, particle, delta);
      }
    });
  }
  drawParticlePlugins(particle, delta) {
    this.draw((ctx) => {
      for (const plugin of this._drawParticlePlugins) {
        drawParticlePlugin(ctx, plugin, particle, delta);
      }
    });
  }
  drawParticles(delta) {
    const { particles } = this._container;
    this.clear();
    particles.update(delta);
    this.draw((ctx) => {
      var _a, _b, _c, _d;
      for (const plugin of this._drawSettingsSetupPlugins) {
        (_a = plugin.drawSettingsSetup) == null ? void 0 : _a.call(plugin, ctx, delta);
      }
      for (const plugin of this._drawPlugins) {
        (_b = plugin.draw) == null ? void 0 : _b.call(plugin, ctx, delta);
      }
      particles.drawParticles(delta);
      for (const plugin of this._clearDrawPlugins) {
        (_c = plugin.clearDraw) == null ? void 0 : _c.call(plugin, ctx, delta);
      }
      for (const plugin of this._drawSettingsCleanupPlugins) {
        (_d = plugin.drawSettingsCleanup) == null ? void 0 : _d.call(plugin, ctx, delta);
      }
    });
  }
  init() {
    this.initUpdaters();
    this.initPlugins();
    this.paint();
  }
  initPlugins() {
    this._colorPlugins = [];
    this._canvasClearPlugins = [];
    this._canvasPaintPlugins = [];
    this._clearDrawPlugins = [];
    this._drawParticlePlugins = [];
    this._drawParticlesSetupPlugins = [];
    this._drawParticlesCleanupPlugins = [];
    this._drawPlugins = [];
    this._drawSettingsSetupPlugins = [];
    this._drawSettingsCleanupPlugins = [];
    for (const plugin of this._container.plugins) {
      if (plugin.particleFillColor ?? plugin.particleStrokeColor) {
        this._colorPlugins.push(plugin);
      }
      if (plugin.canvasClear) {
        this._canvasClearPlugins.push(plugin);
      }
      if (plugin.canvasPaint) {
        this._canvasPaintPlugins.push(plugin);
      }
      if (plugin.drawParticle) {
        this._drawParticlePlugins.push(plugin);
      }
      if (plugin.drawParticleSetup) {
        this._drawParticlesSetupPlugins.push(plugin);
      }
      if (plugin.drawParticleCleanup) {
        this._drawParticlesCleanupPlugins.push(plugin);
      }
      if (plugin.draw) {
        this._drawPlugins.push(plugin);
      }
      if (plugin.drawSettingsSetup) {
        this._drawSettingsSetupPlugins.push(plugin);
      }
      if (plugin.drawSettingsCleanup) {
        this._drawSettingsCleanupPlugins.push(plugin);
      }
      if (plugin.clearDraw) {
        this._clearDrawPlugins.push(plugin);
      }
    }
  }
  initUpdaters() {
    this._preDrawUpdaters = [];
    this._postDrawUpdaters = [];
    for (const updater of this._container.particleUpdaters) {
      if (updater.afterDraw) {
        this._postDrawUpdaters.push(updater);
      }
      if (updater.getColorStyles ?? updater.getTransformValues ?? updater.beforeDraw) {
        this._preDrawUpdaters.push(updater);
      }
    }
  }
  paint() {
    var _a;
    let handled = false;
    for (const plugin of this._canvasPaintPlugins) {
      handled = ((_a = plugin.canvasPaint) == null ? void 0 : _a.call(plugin)) ?? false;
      if (handled) {
        break;
      }
    }
    if (handled) {
      return;
    }
    this.paintBase();
  }
  paintBase(baseColor) {
    this.draw((ctx) => {
      paintBase(ctx, this._canvasManager.size, baseColor);
    });
  }
  paintImage(image, opacity) {
    this.draw((ctx) => {
      paintImage(ctx, this._canvasManager.size, image, opacity);
    });
  }
  setContext(context) {
    this._context = context;
    if (this._context) {
      this._context.globalCompositeOperation = defaultCompositeValue;
    }
  }
  setContextSettings(settings) {
    this._contextSettings = settings;
  }
  stop() {
    this.draw((ctx) => {
      clear(ctx, this._canvasManager.size);
    });
  }
}
const transferredCanvases = /* @__PURE__ */ new WeakMap(), getTransferredCanvas = (canvas) => {
  const transferredCanvas = transferredCanvases.get(canvas);
  if (transferredCanvas) {
    return transferredCanvas;
  }
  if (typeof canvas.transferControlToOffscreen !== "function") {
    throw new TypeError("OffscreenCanvas is required but not supported by this browser");
  }
  try {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    transferredCanvases.set(canvas, offscreenCanvas);
    return offscreenCanvas;
  } catch {
    throw new TypeError("OffscreenCanvas transfer failed");
  }
}, isHtmlCanvasElement = (canvas) => {
  return typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement;
};
function setStyle(canvas, style, important = false) {
  if (!style) {
    return;
  }
  const element = canvas, elementStyle = element.style, keys = /* @__PURE__ */ new Set();
  for (let i = 0; i < elementStyle.length; i++) {
    const key = elementStyle.item(i);
    if (!key) {
      continue;
    }
    keys.add(key);
  }
  for (let i = 0; i < style.length; i++) {
    const key = style.item(i);
    if (!key) {
      continue;
    }
    keys.add(key);
  }
  for (const key of keys) {
    const value = style.getPropertyValue(key);
    if (value) {
      elementStyle.setProperty(key, value, important ? "important" : "");
    } else {
      elementStyle.removeProperty(key);
    }
  }
}
class CanvasManager {
  constructor(pluginManager, container) {
    __publicField(this, "domElement");
    __publicField(this, "render");
    __publicField(this, "renderCanvas");
    __publicField(this, "size");
    __publicField(this, "zoom", defaultZoom);
    __publicField(this, "_container");
    __publicField(this, "_generated");
    __publicField(this, "_mutationObserver");
    __publicField(this, "_originalStyle");
    __publicField(this, "_pluginManager");
    __publicField(this, "_pointerEvents");
    __publicField(this, "_resizePlugins");
    __publicField(this, "_standardSize");
    __publicField(this, "_zoomCenter");
    __publicField(this, "_applyResizePlugins", () => {
      var _a;
      for (const plugin of this._resizePlugins) {
        (_a = plugin.resize) == null ? void 0 : _a.call(plugin);
      }
    });
    __publicField(this, "_initStyle", () => {
      const element = this.domElement, options = this._container.actualOptions;
      if (!element) {
        return;
      }
      if (this._fullScreen) {
        this._setFullScreenStyle();
      } else {
        this._resetOriginalStyle();
      }
      for (const key in options.style) {
        if (!key || !(key in options.style)) {
          continue;
        }
        const value = options.style[key];
        if (!value) {
          continue;
        }
        element.style.setProperty(key, value, "important");
      }
    });
    __publicField(this, "_repairStyle", () => {
      const element = this.domElement;
      if (!element) {
        return;
      }
      this._safeMutationObserver((observer) => {
        observer.disconnect();
      });
      this._initStyle();
      this.initBackground();
      const pointerEvents = this._pointerEvents;
      element.style.pointerEvents = pointerEvents;
      element.style.setProperty("pointer-events", pointerEvents);
      this._safeMutationObserver((observer) => {
        if (!(element instanceof Node)) {
          return;
        }
        observer.observe(element, { attributes: true });
      });
    });
    __publicField(this, "_resetOriginalStyle", () => {
      const element = this.domElement, originalStyle = this._originalStyle;
      if (!element || !originalStyle) {
        return;
      }
      setStyle(element, originalStyle, true);
    });
    __publicField(this, "_safeMutationObserver", (callback) => {
      if (!this._mutationObserver) {
        return;
      }
      callback(this._mutationObserver);
    });
    __publicField(this, "_setFullScreenStyle", () => {
      const element = this.domElement;
      if (!element) {
        return;
      }
      setStyle(element, getFullScreenStyle(this._container.actualOptions.fullScreen.zIndex), true);
    });
    this._pluginManager = pluginManager;
    this._container = container;
    this.render = new RenderManager(pluginManager, container, this);
    this._standardSize = {
      height: 0,
      width: 0
    };
    const pxRatio = container.retina.pixelRatio, stdSize = this._standardSize;
    this.size = {
      height: stdSize.height * pxRatio,
      width: stdSize.width * pxRatio
    };
    this._generated = false;
    this._resizePlugins = [];
    this._pointerEvents = "none";
  }
  get _fullScreen() {
    return this._container.actualOptions.fullScreen.enable;
  }
  destroy() {
    this.stop();
    if (this._generated) {
      const element = this.domElement;
      element == null ? void 0 : element.remove();
      this.domElement = void 0;
      this.renderCanvas = void 0;
    } else {
      this._resetOriginalStyle();
    }
    this.render.destroy();
    this._resizePlugins = [];
  }
  getZoomCenter() {
    const pxRatio = this._container.retina.pixelRatio, { width, height } = this.size;
    if (this._zoomCenter) {
      return this._zoomCenter;
    }
    return {
      x: width * half / pxRatio,
      y: height * half / pxRatio
    };
  }
  init() {
    this._safeMutationObserver((obs) => {
      obs.disconnect();
    });
    this._mutationObserver = safeMutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.attributeName === "style") {
          this._repairStyle();
        }
      }
    });
    this.resize();
    this._initStyle();
    this.initBackground();
    this._safeMutationObserver((obs) => {
      const element = this.domElement;
      if (!element || !(element instanceof Node)) {
        return;
      }
      obs.observe(element, { attributes: true });
    });
    this.initPlugins();
    this.render.init();
  }
  initBackground() {
    const { _container } = this, options = _container.actualOptions, background = options.background, element = this.domElement;
    if (!element) {
      return;
    }
    const elementStyle = element.style, color = rangeColorToRgb(this._pluginManager, background.color);
    if (color) {
      elementStyle.backgroundColor = getStyleFromRgb(color, _container.hdr, background.opacity);
    } else {
      elementStyle.backgroundColor = "";
    }
    elementStyle.backgroundImage = background.image || "";
    elementStyle.backgroundPosition = background.position || "";
    elementStyle.backgroundRepeat = background.repeat || "";
    elementStyle.backgroundSize = background.size || "";
  }
  initPlugins() {
    this._resizePlugins = [];
    for (const plugin of this._container.plugins) {
      if (plugin.resize) {
        this._resizePlugins.push(plugin);
      }
    }
  }
  loadCanvas(canvas) {
    if (this._generated && this.domElement) {
      this.domElement.remove();
    }
    const container = this._container, domCanvas = isHtmlCanvasElement(canvas) ? canvas : void 0;
    this.domElement = domCanvas;
    this._generated = domCanvas ? domCanvas.dataset[generatedAttribute] === "true" : false;
    this.renderCanvas = domCanvas ? getTransferredCanvas(domCanvas) : canvas;
    const domElement = this.domElement;
    if (domElement) {
      domElement.ariaHidden = "true";
      this._originalStyle = cloneStyle(domElement.style);
    }
    const standardSize = this._standardSize, renderCanvas = this.renderCanvas;
    if (domElement) {
      standardSize.height = domElement.offsetHeight;
      standardSize.width = domElement.offsetWidth;
    } else {
      standardSize.height = renderCanvas.height;
      standardSize.width = renderCanvas.width;
    }
    const pxRatio = this._container.retina.pixelRatio, retinaSize = this.size;
    renderCanvas.height = retinaSize.height = standardSize.height * pxRatio;
    renderCanvas.width = retinaSize.width = standardSize.width * pxRatio;
    const canSupportHdrQuery = safeMatchMedia("(color-gamut: p3)");
    this.render.setContextSettings({
      alpha: true,
      colorSpace: (canSupportHdrQuery == null ? void 0 : canSupportHdrQuery.matches) && container.hdr ? "display-p3" : "srgb",
      desynchronized: true,
      willReadFrequently: false
    });
    this.render.setContext(renderCanvas.getContext("2d", this.render.settings));
    this._safeMutationObserver((obs) => {
      obs.disconnect();
    });
    container.retina.init();
    this.initBackground();
    this._safeMutationObserver((obs) => {
      const element = this.domElement;
      if (!element || !(element instanceof Node)) {
        return;
      }
      obs.observe(element, { attributes: true });
    });
  }
  resize() {
    const element = this.domElement;
    if (!element) {
      return false;
    }
    const container = this._container, renderCanvas = this.renderCanvas;
    if (renderCanvas === void 0) {
      return false;
    }
    const currentSize = container.canvas._standardSize, newSize = {
      width: element.offsetWidth,
      height: element.offsetHeight
    }, pxRatio = container.retina.pixelRatio, retinaSize = {
      width: newSize.width * pxRatio,
      height: newSize.height * pxRatio
    };
    if (newSize.height === currentSize.height && newSize.width === currentSize.width && retinaSize.height === renderCanvas.height && retinaSize.width === renderCanvas.width) {
      return false;
    }
    const oldSize = { ...currentSize };
    currentSize.height = newSize.height;
    currentSize.width = newSize.width;
    const canvasSize = this.size;
    renderCanvas.width = canvasSize.width = retinaSize.width;
    renderCanvas.height = canvasSize.height = retinaSize.height;
    if (this._container.started) {
      container.particles.setResizeFactor({
        width: currentSize.width / oldSize.width,
        height: currentSize.height / oldSize.height
      });
    }
    return true;
  }
  setPointerEvents(type) {
    const element = this.domElement;
    if (!element) {
      return;
    }
    this._pointerEvents = type;
    this._repairStyle();
  }
  setZoom(zoomLevel, center) {
    this.zoom = zoomLevel;
    this._zoomCenter = center;
  }
  stop() {
    this._safeMutationObserver((obs) => {
      obs.disconnect();
    });
    this._mutationObserver = void 0;
    this.render.stop();
  }
  async windowResize() {
    if (!this.domElement || !this.resize()) {
      return;
    }
    const container = this._container, needsRefresh = container.updateActualOptions();
    container.particles.setDensity();
    this._applyResizePlugins();
    if (needsRefresh) {
      await container.refresh();
    }
  }
}
class EventListeners {
  constructor(container) {
    __publicField(this, "container");
    __publicField(this, "_handlers");
    __publicField(this, "_resizeObserver");
    __publicField(this, "_resizeTimeout");
    __publicField(this, "_handleVisibilityChange", () => {
      const container = this.container, options = container.actualOptions;
      if (!options.pauseOnBlur) {
        return;
      }
      if (safeDocument().hidden) {
        container.pageHidden = true;
        container.pause();
      } else {
        container.pageHidden = false;
        if (container.animationStatus) {
          container.play(true);
        } else {
          container.draw(true);
        }
      }
    });
    __publicField(this, "_handleWindowResize", () => {
      if (this._resizeTimeout) {
        clearTimeout(this._resizeTimeout);
        delete this._resizeTimeout;
      }
      const handleResize = async () => {
        const canvas = this.container.canvas;
        await canvas.windowResize();
      };
      this._resizeTimeout = setTimeout(() => void handleResize(), this.container.actualOptions.resize.delay * millisecondsToSeconds);
    });
    __publicField(this, "_manageListeners", (add) => {
      const handlers = this._handlers;
      this._manageResize(add);
      manageListener(document, visibilityChangeEvent, handlers.visibilityChange, add, false);
    });
    __publicField(this, "_manageResize", (add) => {
      const handlers = this._handlers, container = this.container, options = container.actualOptions;
      if (!options.resize.enable) {
        return;
      }
      if (typeof ResizeObserver === "undefined") {
        manageListener(globalThis, resizeEvent, handlers.resize, add);
        return;
      }
      const canvasEl = container.canvas.domElement;
      if (this._resizeObserver && !add) {
        if (canvasEl) {
          this._resizeObserver.unobserve(canvasEl);
        }
        this._resizeObserver.disconnect();
        delete this._resizeObserver;
      } else if (!this._resizeObserver && add && canvasEl) {
        this._resizeObserver = new ResizeObserver((entries) => {
          const entry = entries.find((e) => e.target === canvasEl);
          if (!entry) {
            return;
          }
          this._handleWindowResize();
        });
        this._resizeObserver.observe(canvasEl);
      }
    });
    this.container = container;
    this._handlers = {
      visibilityChange: () => {
        this._handleVisibilityChange();
      },
      resize: () => {
        this._handleWindowResize();
      }
    };
  }
  addListeners() {
    this._manageListeners(true);
  }
  removeListeners() {
    this._manageListeners(false);
  }
}
function loadEffectData(effect, effectOptions, id, reduceDuplicates) {
  const effectData = effectOptions.options[effect];
  return deepExtend({
    close: effectOptions.close
  }, itemFromSingleOrMultiple(effectData, id, reduceDuplicates));
}
function loadShapeData(shape, shapeOptions, id, reduceDuplicates) {
  const shapeData = shapeOptions.options[shape];
  return deepExtend({
    close: shapeOptions.close
  }, itemFromSingleOrMultiple(shapeData, id, reduceDuplicates));
}
function fixOutMode(data) {
  if (!isInArray(data.outMode, data.checkModes)) {
    return;
  }
  const diameter = data.radius * double;
  if (data.coord > data.maxCoord - diameter) {
    data.setCb(-data.radius);
  } else if (data.coord < diameter) {
    data.setCb(data.radius);
  }
}
class Particle {
  constructor(pluginManager, container) {
    __publicField(this, "backColor");
    __publicField(this, "bubble");
    __publicField(this, "destroyed");
    __publicField(this, "direction");
    __publicField(this, "effect");
    __publicField(this, "effectClose");
    __publicField(this, "effectData");
    __publicField(this, "fillColor");
    __publicField(this, "fillEnabled");
    __publicField(this, "fillOpacity");
    __publicField(this, "group");
    __publicField(this, "id");
    __publicField(this, "ignoresResizeRatio");
    __publicField(this, "initialPosition");
    __publicField(this, "initialVelocity");
    __publicField(this, "isRotating");
    __publicField(this, "justWarped");
    __publicField(this, "lastPathTime");
    __publicField(this, "misplaced");
    __publicField(this, "moveCenter");
    __publicField(this, "offset");
    __publicField(this, "opacity");
    __publicField(this, "options");
    __publicField(this, "outType");
    __publicField(this, "pathRotation");
    __publicField(this, "position");
    __publicField(this, "randomIndexData");
    __publicField(this, "retina");
    __publicField(this, "roll");
    __publicField(this, "rotation");
    __publicField(this, "shape");
    __publicField(this, "shapeClose");
    __publicField(this, "shapeData");
    __publicField(this, "sides");
    __publicField(this, "size");
    __publicField(this, "slow");
    __publicField(this, "spawning");
    __publicField(this, "strokeColor");
    __publicField(this, "strokeOpacity");
    __publicField(this, "strokeWidth");
    __publicField(this, "unbreakable");
    __publicField(this, "velocity");
    __publicField(this, "zIndexFactor");
    __publicField(this, "_cachedOpacityData", {
      fillOpacity: defaultOpacity,
      opacity: defaultOpacity,
      strokeOpacity: defaultOpacity
    });
    __publicField(this, "_cachedPosition", Vector3d.origin);
    __publicField(this, "_cachedRotateData", { sin: 0, cos: 0 });
    __publicField(this, "_cachedTransform", {
      a: 1,
      b: 0,
      c: 0,
      d: 1
    });
    __publicField(this, "_container");
    __publicField(this, "_pluginManager");
    __publicField(this, "_calcPosition", (position, zIndex) => {
      var _a, _b;
      let tryCount = defaultRetryCount, posVec = position ? Vector3d.create(position.x, position.y, zIndex) : void 0;
      const container = this._container, plugins = container.particlePositionPlugins, outModes = this.options.move.outModes, radius = this.getRadius(), canvasSize = container.canvas.size, abortController = new AbortController(), { signal } = abortController;
      while (!signal.aborted) {
        for (const plugin of plugins) {
          const pluginPos = (_a = plugin.particlePosition) == null ? void 0 : _a.call(plugin, posVec, this);
          if (pluginPos) {
            return Vector3d.create(pluginPos.x, pluginPos.y, zIndex);
          }
        }
        const exactPosition = calcExactPositionOrRandomFromSize({
          size: canvasSize,
          position: posVec
        }), pos = Vector3d.create(exactPosition.x, exactPosition.y, zIndex);
        this._fixHorizontal(pos, radius, outModes.left ?? outModes.default);
        this._fixHorizontal(pos, radius, outModes.right ?? outModes.default);
        this._fixVertical(pos, radius, outModes.top ?? outModes.default);
        this._fixVertical(pos, radius, outModes.bottom ?? outModes.default);
        let isValidPosition = true;
        for (const plugin of container.particles.checkParticlePositionPlugins) {
          isValidPosition = ((_b = plugin.checkParticlePosition) == null ? void 0 : _b.call(plugin, this, pos, tryCount)) ?? true;
          if (!isValidPosition) {
            break;
          }
        }
        if (isValidPosition) {
          return pos;
        }
        tryCount += tryCountIncrement;
        posVec = void 0;
      }
      return posVec;
    });
    __publicField(this, "_calculateVelocity", () => {
      const baseVelocity = getParticleBaseVelocity(this.direction), res = baseVelocity.copy(), moveOptions = this.options.move;
      if (moveOptions.direction === MoveDirection.inside || moveOptions.direction === MoveDirection.outside) {
        return res;
      }
      const rad = degToRad(getRangeValue(moveOptions.angle.value)), radOffset = degToRad(getRangeValue(moveOptions.angle.offset)), range = {
        left: radOffset - rad * half,
        right: radOffset + rad * half
      };
      if (!moveOptions.straight) {
        res.angle += randomInRangeValue(setRangeValue(range.left, range.right));
      }
      if (moveOptions.random && typeof moveOptions.speed === "number") {
        res.length *= getRandom();
      }
      return res;
    });
    __publicField(this, "_fixHorizontal", (pos, radius, outMode) => {
      fixOutMode({
        outMode,
        checkModes: [OutMode.bounce],
        coord: pos.x,
        maxCoord: this._container.canvas.size.width,
        setCb: (value) => pos.x += value,
        radius
      });
    });
    __publicField(this, "_fixVertical", (pos, radius, outMode) => {
      fixOutMode({
        outMode,
        checkModes: [OutMode.bounce],
        coord: pos.y,
        maxCoord: this._container.canvas.size.height,
        setCb: (value) => pos.y += value,
        radius
      });
    });
    __publicField(this, "_getRollColor", (color) => {
      if (!color || !this.roll || !this.backColor && !this.roll.alter) {
        return color;
      }
      if (!this.isShowingBack()) {
        return color;
      }
      if (this.backColor) {
        return this.backColor;
      }
      if (this.roll.alter) {
        return alterHsl(color, this.roll.alter.type, this.roll.alter.value);
      }
      return color;
    });
    __publicField(this, "_initPosition", (position) => {
      const container = this._container, zIndexValue = Math.floor(getRangeValue(this.options.zIndex.value)), initialPosition = this._calcPosition(position, clamp(zIndexValue, minZ, container.zLayers));
      if (!initialPosition) {
        throw new Error("a valid position cannot be found for particle");
      }
      this.position = initialPosition;
      this.initialPosition = this.position.copy();
      const canvasSize = container.canvas.size;
      this.moveCenter = {
        ...getPosition(this.options.move.center, canvasSize),
        radius: this.options.move.center.radius,
        mode: this.options.move.center.mode
      };
      this.direction = getParticleDirectionAngle(this.options.move.direction, this.position, this.moveCenter);
      switch (this.options.move.direction) {
        case MoveDirection.inside:
          this.outType = ParticleOutType.inside;
          break;
        case MoveDirection.outside:
          this.outType = ParticleOutType.outside;
          break;
      }
      this.offset = Vector.origin;
    });
    this._pluginManager = pluginManager;
    this._container = container;
  }
  destroy(override) {
    var _a, _b, _c;
    if (this.unbreakable || this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.bubble.inRange = false;
    this.slow.inRange = false;
    const container = this._container, shapeDrawer = this.shape ? container.shapeDrawers.get(this.shape) : void 0;
    (_a = shapeDrawer == null ? void 0 : shapeDrawer.particleDestroy) == null ? void 0 : _a.call(shapeDrawer, this);
    for (const plugin of container.particleDestroyedPlugins) {
      (_b = plugin.particleDestroyed) == null ? void 0 : _b.call(plugin, this, override);
    }
    for (const updater of container.particleUpdaters) {
      (_c = updater.particleDestroyed) == null ? void 0 : _c.call(updater, this, override);
    }
    this._container.dispatchEvent(EventType.particleDestroyed, {
      particle: this
    });
  }
  draw(delta) {
    const container = this._container, render = container.canvas.render;
    render.drawParticlePlugins(this, delta);
    render.drawParticle(this, delta);
  }
  getAngle() {
    return this.rotation + (this.pathRotation ? this.velocity.angle : defaultAngle);
  }
  getFillColor() {
    return this._getRollColor(this.bubble.color ?? getHslFromAnimation(this.fillColor));
  }
  getMass() {
    return this.getRadius() ** squareExp * Math.PI * half;
  }
  getOpacity() {
    var _a;
    const zIndexOptions = this.options.zIndex, zIndexFactor = zIndexFactorOffset - this.zIndexFactor, zOpacityFactor = zIndexFactor ** zIndexOptions.opacityRate, opacity = this.bubble.opacity ?? getRangeValue(((_a = this.opacity) == null ? void 0 : _a.value) ?? defaultOpacity), fillOpacity = this.fillOpacity ?? defaultOpacity, strokeOpacity = this.strokeOpacity ?? defaultOpacity;
    this._cachedOpacityData.fillOpacity = opacity * fillOpacity * zOpacityFactor;
    this._cachedOpacityData.opacity = opacity * zOpacityFactor;
    this._cachedOpacityData.strokeOpacity = opacity * strokeOpacity * zOpacityFactor;
    return this._cachedOpacityData;
  }
  getPosition() {
    this._cachedPosition.x = this.position.x + this.offset.x;
    this._cachedPosition.y = this.position.y + this.offset.y;
    this._cachedPosition.z = this.position.z;
    return this._cachedPosition;
  }
  getRadius() {
    return this.bubble.radius ?? this.size.value;
  }
  getRotateData() {
    const angle = this.getAngle();
    this._cachedRotateData.sin = Math.sin(angle);
    this._cachedRotateData.cos = Math.cos(angle);
    return this._cachedRotateData;
  }
  getStrokeColor() {
    return this._getRollColor(this.bubble.color ?? getHslFromAnimation(this.strokeColor));
  }
  getTransformData(externalTransform) {
    const rotateData = this.getRotateData(), rotating = this.isRotating;
    this._cachedTransform.a = rotateData.cos * (externalTransform.a ?? defaultTransform.a);
    this._cachedTransform.b = rotating ? rotateData.sin * (externalTransform.b ?? identity) : externalTransform.b ?? defaultTransform.b;
    this._cachedTransform.c = rotating ? -rotateData.sin * (externalTransform.c ?? identity) : externalTransform.c ?? defaultTransform.c;
    this._cachedTransform.d = rotateData.cos * (externalTransform.d ?? defaultTransform.d);
    return this._cachedTransform;
  }
  init(id, position, overrideOptions, group) {
    var _a, _b, _c, _d, _e;
    const container = this._container;
    this.id = id;
    this.group = group;
    this.justWarped = false;
    this.effectClose = true;
    this.shapeClose = true;
    this.pathRotation = false;
    this.lastPathTime = 0;
    this.destroyed = false;
    this.unbreakable = false;
    this.isRotating = false;
    this.rotation = 0;
    this.misplaced = false;
    this.retina = {
      maxDistance: {},
      maxSpeed: 0,
      moveDrift: 0,
      moveSpeed: 0,
      sizeAnimationSpeed: 0
    };
    this.outType = ParticleOutType.normal;
    this.ignoresResizeRatio = true;
    const pxRatio = container.retina.pixelRatio, mainOptions = container.actualOptions, particlesOptions = loadParticlesOptions(this._pluginManager, container, mainOptions.particles), reduceDuplicates = particlesOptions.reduceDuplicates, effectType = particlesOptions.effect.type, shapeType = particlesOptions.shape.type;
    this.effect = itemFromSingleOrMultiple(effectType, this.id, reduceDuplicates);
    this.shape = itemFromSingleOrMultiple(shapeType, this.id, reduceDuplicates);
    const effectOptions = particlesOptions.effect, shapeOptions = particlesOptions.shape;
    if (overrideOptions) {
      if ((_a = overrideOptions.effect) == null ? void 0 : _a.type) {
        const overrideEffectType = overrideOptions.effect.type, effect = itemFromSingleOrMultiple(overrideEffectType, this.id, reduceDuplicates);
        if (effect) {
          this.effect = effect;
          effectOptions.load(overrideOptions.effect);
        }
      }
      if ((_b = overrideOptions.shape) == null ? void 0 : _b.type) {
        const overrideShapeType = overrideOptions.shape.type, shape = itemFromSingleOrMultiple(overrideShapeType, this.id, reduceDuplicates);
        if (shape) {
          this.shape = shape;
          shapeOptions.load(overrideOptions.shape);
        }
      }
    }
    if (this.effect === randomColorValue) {
      const availableEffects = [...this._container.effectDrawers.keys()];
      this.effect = availableEffects[Math.floor(getRandom() * availableEffects.length)];
    }
    if (this.shape === randomColorValue) {
      const availableShapes = [...this._container.shapeDrawers.keys()];
      this.shape = availableShapes[Math.floor(getRandom() * availableShapes.length)];
    }
    this.effectData = this.effect ? loadEffectData(this.effect, effectOptions, this.id, reduceDuplicates) : void 0;
    this.shapeData = this.shape ? loadShapeData(this.shape, shapeOptions, this.id, reduceDuplicates) : void 0;
    particlesOptions.load(overrideOptions);
    const effectData = this.effectData;
    if (effectData) {
      particlesOptions.load(effectData.particles);
    }
    const shapeData = this.shapeData;
    if (shapeData) {
      particlesOptions.load(shapeData.particles);
    }
    this.effectClose = (effectData == null ? void 0 : effectData.close) ?? particlesOptions.effect.close;
    this.shapeClose = (shapeData == null ? void 0 : shapeData.close) ?? particlesOptions.shape.close;
    this.options = particlesOptions;
    container.retina.initParticle(this);
    this.size = initParticleNumericAnimationValue(this.options.size, pxRatio);
    this.bubble = {
      inRange: false
    };
    this.slow = {
      inRange: false,
      factor: 1
    };
    this._initPosition(position);
    this.initialVelocity = this._calculateVelocity();
    this.velocity = this.initialVelocity.copy();
    this.zIndexFactor = this.position.z / container.zLayers;
    this.sides = 24;
    let effectDrawer, shapeDrawer;
    if (this.effect) {
      effectDrawer = container.effectDrawers.get(this.effect);
    }
    if (effectDrawer == null ? void 0 : effectDrawer.loadEffect) {
      effectDrawer.loadEffect(this);
    }
    if (this.shape) {
      shapeDrawer = container.shapeDrawers.get(this.shape);
    }
    if (shapeDrawer == null ? void 0 : shapeDrawer.loadShape) {
      shapeDrawer.loadShape(this);
    }
    const sideCountFunc = shapeDrawer == null ? void 0 : shapeDrawer.getSidesCount;
    if (sideCountFunc) {
      this.sides = sideCountFunc(this);
    }
    this.spawning = false;
    for (const updater of container.particleUpdaters) {
      updater.init(this);
    }
    (_c = effectDrawer == null ? void 0 : effectDrawer.particleInit) == null ? void 0 : _c.call(effectDrawer, container, this);
    (_d = shapeDrawer == null ? void 0 : shapeDrawer.particleInit) == null ? void 0 : _d.call(shapeDrawer, container, this);
    for (const plugin of container.particleCreatedPlugins) {
      (_e = plugin.particleCreated) == null ? void 0 : _e.call(plugin, this);
    }
  }
  isInsideCanvas() {
    const radius = this.getRadius(), canvasSize = this._container.canvas.size, position = this.position;
    return position.x >= -radius && position.y >= -radius && position.y <= canvasSize.height + radius && position.x <= canvasSize.width + radius;
  }
  isShowingBack() {
    if (!this.roll) {
      return false;
    }
    const angle = this.roll.angle;
    if (this.roll.horizontal && this.roll.vertical) {
      const normalizedAngle = angle % doublePI, adjustedAngle = normalizedAngle < defaultAngle ? normalizedAngle + doublePI : normalizedAngle;
      return adjustedAngle >= Math.PI * half && adjustedAngle < Math.PI * triple * half;
    }
    if (this.roll.horizontal) {
      const normalizedAngle = (angle + Math.PI * half) % (Math.PI * double), adjustedAngle = normalizedAngle < defaultAngle ? normalizedAngle + Math.PI * double : normalizedAngle;
      return adjustedAngle >= Math.PI && adjustedAngle < Math.PI * double;
    }
    if (this.roll.vertical) {
      const normalizedAngle = angle % (Math.PI * double), adjustedAngle = normalizedAngle < defaultAngle ? normalizedAngle + Math.PI * double : normalizedAngle;
      return adjustedAngle >= Math.PI && adjustedAngle < Math.PI * double;
    }
    return false;
  }
  isVisible() {
    return !this.destroyed && !this.spawning && this.isInsideCanvas();
  }
  reset() {
    var _a;
    for (const updater of this._container.particleUpdaters) {
      (_a = updater.reset) == null ? void 0 : _a.call(updater, this);
    }
  }
}
class SpatialHashGrid {
  constructor(cellSize) {
    __publicField(this, "_cellSize");
    __publicField(this, "_cells", /* @__PURE__ */ new Map());
    __publicField(this, "_circlePool", []);
    __publicField(this, "_circlePoolIdx");
    __publicField(this, "_pendingCellSize");
    __publicField(this, "_rectanglePool", []);
    __publicField(this, "_rectanglePoolIdx");
    this._cellSize = cellSize;
    this._circlePoolIdx = 0;
    this._rectanglePoolIdx = 0;
  }
  clear() {
    this._cells.clear();
    const pendingCellSize = this._pendingCellSize;
    if (pendingCellSize) {
      this._cellSize = pendingCellSize;
    }
    this._pendingCellSize = void 0;
  }
  insert(particle) {
    var _a;
    const { x, y } = particle.getPosition(), key = this._cellKeyFromCoords(x, y);
    if (!this._cells.has(key)) {
      this._cells.set(key, []);
    }
    (_a = this._cells.get(key)) == null ? void 0 : _a.push(particle);
  }
  query(range, check, out = []) {
    const bounds = this._getRangeBounds(range);
    if (!bounds) {
      return out;
    }
    const minCellX = Math.floor(bounds.minX / this._cellSize), maxCellX = Math.floor(bounds.maxX / this._cellSize), minCellY = Math.floor(bounds.minY / this._cellSize), maxCellY = Math.floor(bounds.maxY / this._cellSize);
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx}_${cy}`, cellParticles = this._cells.get(key);
        if (!cellParticles) {
          continue;
        }
        for (const p of cellParticles) {
          if (check && !check(p)) {
            continue;
          }
          if (range.contains(p.getPosition())) {
            out.push(p);
          }
        }
      }
    }
    return out;
  }
  queryCircle(position, radius, check, out = []) {
    const circle = this._acquireCircle(position.x, position.y, radius), result = this.query(circle, check, out);
    this._releaseShapes();
    return result;
  }
  queryRectangle(position, size, check, out = []) {
    const rect = this._acquireRectangle(position.x, position.y, size.width, size.height), result = this.query(rect, check, out);
    this._releaseShapes();
    return result;
  }
  setCellSize(cellSize) {
    this._pendingCellSize = cellSize;
  }
  _acquireCircle(x, y, r) {
    var _a, _b;
    return ((_a = this._circlePool)[_b = this._circlePoolIdx++] ?? (_a[_b] = new Circle(x, y, r))).reset(x, y, r);
  }
  _acquireRectangle(x, y, w, h) {
    var _a, _b;
    return ((_a = this._rectanglePool)[_b = this._rectanglePoolIdx++] ?? (_a[_b] = new Rectangle(x, y, w, h))).reset(x, y, w, h);
  }
  _cellKeyFromCoords(x, y) {
    const cellX = Math.floor(x / this._cellSize), cellY = Math.floor(y / this._cellSize);
    return `${cellX}_${cellY}`;
  }
  _getRangeBounds(range) {
    if (range instanceof Circle) {
      const r = range.radius, { x, y } = range.position;
      return {
        minX: x - r,
        maxX: x + r,
        minY: y - r,
        maxY: y + r
      };
    }
    if (range instanceof Rectangle) {
      const { x, y } = range.position, { width, height } = range.size;
      return {
        minX: x,
        maxX: x + width,
        minY: y,
        maxY: y + height
      };
    }
    return null;
  }
  _releaseShapes() {
    this._circlePoolIdx = 0;
    this._rectanglePoolIdx = 0;
  }
}
class ParticlesManager {
  constructor(pluginManager, container) {
    __publicField(this, "checkParticlePositionPlugins");
    __publicField(this, "grid");
    __publicField(this, "_array");
    __publicField(this, "_container");
    __publicField(this, "_groupLimits");
    __publicField(this, "_limit");
    __publicField(this, "_nextId");
    __publicField(this, "_particleBuckets");
    __publicField(this, "_particleResetPlugins");
    __publicField(this, "_particleUpdatePlugins");
    __publicField(this, "_pluginManager");
    __publicField(this, "_pool");
    __publicField(this, "_postParticleUpdatePlugins");
    __publicField(this, "_postUpdatePlugins");
    __publicField(this, "_resizeFactor");
    __publicField(this, "_updatePlugins");
    __publicField(this, "_zBuckets");
    __publicField(this, "_addToPool", (...particles) => {
      this._pool.push(...particles);
    });
    __publicField(this, "_applyDensity", (options, pluginsCount, group, groupOptions) => {
      const numberOptions = options.number;
      if (!numberOptions.density.enable) {
        if (group === void 0) {
          this._limit = numberOptions.limit.value;
        } else if ((groupOptions == null ? void 0 : groupOptions.number.limit.value) ?? numberOptions.limit.value) {
          this._groupLimits.set(group, (groupOptions == null ? void 0 : groupOptions.number.limit.value) ?? numberOptions.limit.value);
        }
        return;
      }
      const densityFactor = this._initDensityFactor(numberOptions.density), optParticlesNumber = numberOptions.value, optParticlesLimit = numberOptions.limit.value > minLimit ? numberOptions.limit.value : optParticlesNumber, particlesNumber = Math.min(optParticlesNumber, optParticlesLimit) * densityFactor + pluginsCount, particlesCount = Math.min(this.count, this.filter((t) => t.group === group).length);
      if (group === void 0) {
        this._limit = numberOptions.limit.value * densityFactor;
      } else {
        this._groupLimits.set(group, numberOptions.limit.value * densityFactor);
      }
      if (particlesCount < particlesNumber) {
        this.push(Math.abs(particlesNumber - particlesCount), void 0, options, group);
      } else if (particlesCount > particlesNumber) {
        this.removeQuantity(particlesCount - particlesNumber, group);
      }
    });
    __publicField(this, "_createBuckets", (zLayers) => {
      const bucketCount = Math.max(Math.floor(zLayers), one);
      return Array.from({ length: bucketCount }, () => []);
    });
    __publicField(this, "_getBucketIndex", (zIndex) => {
      const maxBucketIndex = this._zBuckets.length - one;
      if (maxBucketIndex <= minIndex) {
        return minIndex;
      }
      return Math.min(Math.max(Math.floor(zIndex), minIndex), maxBucketIndex);
    });
    __publicField(this, "_getParticleInsertIndex", (bucket, particleId) => {
      let start = minIndex, end = bucket.length;
      while (start < end) {
        const middle = Math.floor((start + end) / double), middleParticle = bucket[middle];
        if (!middleParticle) {
          end = middle;
          continue;
        }
        if (middleParticle.id < particleId) {
          start = middle + one;
        } else {
          end = middle;
        }
      }
      return start;
    });
    __publicField(this, "_initDensityFactor", (densityOptions) => {
      const container = this._container;
      if (!densityOptions.enable) {
        return defaultDensityFactor;
      }
      const canvasSize = container.canvas.size, pxRatio = container.retina.pixelRatio;
      if (!canvasSize.width || !canvasSize.height) {
        return defaultDensityFactor;
      }
      return canvasSize.width * canvasSize.height / (densityOptions.height * densityOptions.width * pxRatio ** squareExp);
    });
    __publicField(this, "_insertParticleIntoBucket", (particle) => {
      const bucketIndex = this._getBucketIndex(particle.position.z), bucket = this._zBuckets[bucketIndex];
      if (!bucket) {
        return;
      }
      bucket.splice(this._getParticleInsertIndex(bucket, particle.id), empty, particle);
      this._particleBuckets.set(particle.id, bucketIndex);
    });
    __publicField(this, "_removeParticle", (index, group, override) => {
      const particle = this._array[index];
      if (!particle) {
        return false;
      }
      if (particle.group !== group) {
        return false;
      }
      this._array.splice(index, deleteCount);
      this._removeParticleFromBucket(particle);
      particle.destroy(override);
      this._container.dispatchEvent(EventType.particleRemoved, {
        particle
      });
      this._addToPool(particle);
      return true;
    });
    __publicField(this, "_removeParticleFromBucket", (particle) => {
      var _a;
      const bucketIndex = this._particleBuckets.get(particle.id) ?? this._getBucketIndex(particle.position.z), bucket = this._zBuckets[bucketIndex];
      if (!bucket) {
        this._particleBuckets.delete(particle.id);
        return;
      }
      const particleIndex = this._getParticleInsertIndex(bucket, particle.id);
      if (((_a = bucket[particleIndex]) == null ? void 0 : _a.id) !== particle.id) {
        this._particleBuckets.delete(particle.id);
        return;
      }
      bucket.splice(particleIndex, deleteCount);
      this._particleBuckets.delete(particle.id);
    });
    __publicField(this, "_resetBuckets", (zLayers) => {
      const bucketCount = Math.max(Math.floor(zLayers), one);
      if (this._zBuckets.length !== bucketCount) {
        this._zBuckets = this._createBuckets(bucketCount);
        return;
      }
      for (const bucket of this._zBuckets) {
        bucket.length = minIndex;
      }
    });
    __publicField(this, "_updateParticleBucket", (particle) => {
      var _a;
      const newBucketIndex = this._getBucketIndex(particle.position.z), currentBucketIndex = this._particleBuckets.get(particle.id);
      if (currentBucketIndex === void 0) {
        this._insertParticleIntoBucket(particle);
        return;
      }
      if (currentBucketIndex === newBucketIndex) {
        return;
      }
      const currentBucket = this._zBuckets[currentBucketIndex];
      if (currentBucket) {
        const particleIndex = this._getParticleInsertIndex(currentBucket, particle.id);
        if (((_a = currentBucket[particleIndex]) == null ? void 0 : _a.id) === particle.id) {
          currentBucket.splice(particleIndex, deleteCount);
        }
      }
      const newBucket = this._zBuckets[newBucketIndex];
      if (!newBucket) {
        this._particleBuckets.set(particle.id, newBucketIndex);
        return;
      }
      newBucket.splice(this._getParticleInsertIndex(newBucket, particle.id), empty, particle);
      this._particleBuckets.set(particle.id, newBucketIndex);
    });
    __publicField(this, "_updateParticlesPhase1", (delta) => {
      var _a, _b;
      const particlesToDelete = /* @__PURE__ */ new Set(), resizeFactor = this._resizeFactor;
      for (const particle of this._array) {
        if (resizeFactor && !particle.ignoresResizeRatio) {
          particle.position.x *= resizeFactor.width;
          particle.position.y *= resizeFactor.height;
          particle.initialPosition.x *= resizeFactor.width;
          particle.initialPosition.y *= resizeFactor.height;
        }
        particle.ignoresResizeRatio = false;
        for (const plugin of this._particleResetPlugins) {
          (_a = plugin.particleReset) == null ? void 0 : _a.call(plugin, particle);
        }
        for (const plugin of this._particleUpdatePlugins) {
          if (particle.destroyed) {
            break;
          }
          (_b = plugin.particleUpdate) == null ? void 0 : _b.call(plugin, particle, delta);
        }
        if (particle.destroyed) {
          particlesToDelete.add(particle);
          continue;
        }
        this.grid.insert(particle);
      }
      return particlesToDelete;
    });
    __publicField(this, "_updateParticlesPhase2", (delta, particlesToDelete) => {
      var _a;
      for (const particle of this._array) {
        if (particle.destroyed) {
          particlesToDelete.add(particle);
          continue;
        }
        for (const updater of this._container.particleUpdaters) {
          updater.update(particle, delta);
        }
        if (!particle.spawning) {
          for (const plugin of this._postParticleUpdatePlugins) {
            (_a = plugin.postParticleUpdate) == null ? void 0 : _a.call(plugin, particle, delta);
          }
        }
        this._updateParticleBucket(particle);
      }
    });
    this._pluginManager = pluginManager;
    this._container = container;
    this._nextId = 0;
    this._array = [];
    this._pool = [];
    this._limit = 0;
    this._groupLimits = /* @__PURE__ */ new Map();
    this._particleBuckets = /* @__PURE__ */ new Map();
    this._zBuckets = this._createBuckets(this._container.zLayers);
    this.grid = new SpatialHashGrid(spatialHashGridCellSize);
    this.checkParticlePositionPlugins = [];
    this._particleResetPlugins = [];
    this._particleUpdatePlugins = [];
    this._postUpdatePlugins = [];
    this._postParticleUpdatePlugins = [];
    this._updatePlugins = [];
  }
  get count() {
    return this._array.length;
  }
  addParticle(position, overrideOptions, group, initializer) {
    const limitMode = this._container.actualOptions.particles.number.limit.mode, limit = group === void 0 ? this._limit : this._groupLimits.get(group) ?? this._limit, currentCount = this.count;
    if (limit > minLimit) {
      switch (limitMode) {
        case LimitMode.delete: {
          const countToRemove = currentCount + countOffset - limit;
          if (countToRemove > minCount) {
            this.removeQuantity(countToRemove);
          }
          break;
        }
        case LimitMode.wait:
          if (currentCount >= limit) {
            return;
          }
          break;
      }
    }
    try {
      const particle = this._pool.pop() ?? new Particle(this._pluginManager, this._container);
      particle.init(this._nextId, position, overrideOptions, group);
      let canAdd = true;
      if (initializer) {
        canAdd = initializer(particle);
      }
      if (!canAdd) {
        this._pool.push(particle);
        return;
      }
      this._array.push(particle);
      this._insertParticleIntoBucket(particle);
      this._nextId++;
      this._container.dispatchEvent(EventType.particleAdded, {
        particle
      });
      return particle;
    } catch (e) {
      getLogger().warning(`error adding particle: ${e}`);
    }
    return void 0;
  }
  clear() {
    this._array = [];
    this._particleBuckets.clear();
    this._resetBuckets(this._container.zLayers);
  }
  destroy() {
    this._array = [];
    this._pool.length = 0;
    this._particleBuckets.clear();
    this._zBuckets = [];
    this.checkParticlePositionPlugins = [];
    this._particleResetPlugins = [];
    this._particleUpdatePlugins = [];
    this._postUpdatePlugins = [];
    this._postParticleUpdatePlugins = [];
    this._updatePlugins = [];
  }
  drawParticles(delta) {
    for (let i = this._zBuckets.length - one; i >= minIndex; i--) {
      const bucket = this._zBuckets[i];
      if (!bucket) {
        continue;
      }
      for (const particle of bucket) {
        particle.draw(delta);
      }
    }
  }
  filter(condition) {
    return this._array.filter(condition);
  }
  find(condition) {
    return this._array.find(condition);
  }
  get(index) {
    return this._array[index];
  }
  async init() {
    var _a, _b, _c;
    const container = this._container, options = container.actualOptions;
    this.checkParticlePositionPlugins = [];
    this._updatePlugins = [];
    this._particleUpdatePlugins = [];
    this._postUpdatePlugins = [];
    this._particleResetPlugins = [];
    this._postParticleUpdatePlugins = [];
    this._particleBuckets.clear();
    this._resetBuckets(container.zLayers);
    this.grid = new SpatialHashGrid(spatialHashGridCellSize * container.retina.pixelRatio);
    for (const plugin of container.plugins) {
      if (plugin.redrawInit) {
        await plugin.redrawInit();
      }
      if (plugin.checkParticlePosition) {
        this.checkParticlePositionPlugins.push(plugin);
      }
      if (plugin.update) {
        this._updatePlugins.push(plugin);
      }
      if (plugin.particleUpdate) {
        this._particleUpdatePlugins.push(plugin);
      }
      if (plugin.postUpdate) {
        this._postUpdatePlugins.push(plugin);
      }
      if (plugin.particleReset) {
        this._particleResetPlugins.push(plugin);
      }
      if (plugin.postParticleUpdate) {
        this._postParticleUpdatePlugins.push(plugin);
      }
    }
    await this._container.initDrawersAndUpdaters();
    for (const drawer of this._container.effectDrawers.values()) {
      await ((_a = drawer.init) == null ? void 0 : _a.call(drawer, container));
    }
    for (const drawer of this._container.shapeDrawers.values()) {
      await ((_b = drawer.init) == null ? void 0 : _b.call(drawer, container));
    }
    let handled = false;
    for (const plugin of container.plugins) {
      handled = ((_c = plugin.particlesInitialization) == null ? void 0 : _c.call(plugin)) ?? handled;
      if (handled) {
        break;
      }
    }
    if (!handled) {
      const particlesOptions = options.particles, groups = particlesOptions.groups;
      for (const group in groups) {
        const groupOptions = groups[group];
        if (!groupOptions) {
          continue;
        }
        for (let i = this.count, j = 0; j < groupOptions.number.value && i < particlesOptions.number.value; i++, j++) {
          this.addParticle(void 0, groupOptions, group);
        }
      }
      for (let i = this.count; i < particlesOptions.number.value; i++) {
        this.addParticle();
      }
    }
  }
  push(nb, position, overrideOptions, group) {
    for (let i = 0; i < nb; i++) {
      this.addParticle(position, overrideOptions, group);
    }
  }
  async redraw() {
    this.clear();
    await this.init();
    this._container.canvas.render.drawParticles({ value: 0, factor: 0 });
  }
  remove(particle, group, override) {
    this.removeAt(this._array.indexOf(particle), void 0, group, override);
  }
  removeAt(index, quantity = defaultRemoveQuantity, group, override) {
    if (index < minIndex || index > this.count) {
      return;
    }
    let deleted = 0;
    for (let i = index; deleted < quantity && i < this.count; i++) {
      if (this._removeParticle(i, group, override)) {
        i--;
        deleted++;
      }
    }
  }
  removeQuantity(quantity, group) {
    this.removeAt(minIndex, quantity, group);
  }
  setDensity() {
    const options = this._container.actualOptions, groups = options.particles.groups;
    let pluginsCount = 0;
    for (const plugin of this._container.plugins) {
      if (plugin.particlesDensityCount) {
        pluginsCount += plugin.particlesDensityCount();
      }
    }
    for (const group in groups) {
      const groupData = groups[group];
      if (!groupData) {
        continue;
      }
      const groupDataOptions = loadParticlesOptions(this._pluginManager, this._container, groupData);
      this._applyDensity(groupDataOptions, pluginsCount, group);
    }
    this._applyDensity(options.particles, pluginsCount);
  }
  setResizeFactor(factor) {
    this._resizeFactor = factor;
  }
  update(delta) {
    var _a, _b;
    this.grid.clear();
    for (const plugin of this._updatePlugins) {
      (_a = plugin.update) == null ? void 0 : _a.call(plugin, delta);
    }
    const particlesToDelete = this._updateParticlesPhase1(delta);
    for (const plugin of this._postUpdatePlugins) {
      (_b = plugin.postUpdate) == null ? void 0 : _b.call(plugin, delta);
    }
    this._updateParticlesPhase2(delta, particlesToDelete);
    if (particlesToDelete.size) {
      for (const particle of particlesToDelete) {
        this.remove(particle);
      }
    }
    delete this._resizeFactor;
  }
}
class Retina {
  constructor(container) {
    __publicField(this, "container");
    __publicField(this, "pixelRatio");
    __publicField(this, "reduceFactor");
    this.container = container;
    this.pixelRatio = defaultRatio;
    this.reduceFactor = defaultReduceFactor;
  }
  init() {
    const container = this.container, options = container.actualOptions;
    this.pixelRatio = options.detectRetina ? devicePixelRatio : defaultRatio;
    this.reduceFactor = defaultReduceFactor;
    const ratio = this.pixelRatio, canvas = container.canvas, element = canvas.domElement;
    if (element) {
      canvas.size.width = element.offsetWidth * ratio;
      canvas.size.height = element.offsetHeight * ratio;
    }
  }
  initParticle(particle) {
    const options = particle.options, ratio = this.pixelRatio, moveOptions = options.move, moveDistance = moveOptions.distance, props = particle.retina;
    props.maxSpeed = getRangeValue(moveOptions.gravity.maxSpeed) * ratio;
    props.moveDrift = getRangeValue(moveOptions.drift) * ratio;
    props.moveSpeed = getRangeValue(moveOptions.speed) * ratio;
    props.sizeAnimationSpeed = getRangeValue(options.size.animation.speed) * ratio;
    const maxDistance = props.maxDistance;
    maxDistance.horizontal = moveDistance.horizontal === void 0 ? void 0 : moveDistance.horizontal * ratio;
    maxDistance.vertical = moveDistance.vertical === void 0 ? void 0 : moveDistance.vertical * ratio;
  }
}
function guardCheck(container) {
  return !container.destroyed;
}
function updateDelta(delta, value, fpsLimit = defaultFps, smooth = false) {
  delta.value = value;
  delta.factor = smooth ? defaultFps / fpsLimit : defaultFps * value / millisecondsToSeconds;
}
function loadContainerOptions(pluginManager, container, ...sourceOptionsArr) {
  const options = new Options(pluginManager, container);
  loadOptions(options, ...sourceOptionsArr);
  return options;
}
class Container {
  constructor(params) {
    __publicField(this, "actualOptions");
    __publicField(this, "canvas");
    __publicField(this, "destroyed");
    __publicField(this, "effectDrawers");
    __publicField(this, "fpsLimit");
    __publicField(this, "hdr");
    __publicField(this, "id");
    __publicField(this, "pageHidden");
    __publicField(this, "particleCreatedPlugins");
    __publicField(this, "particleDestroyedPlugins");
    __publicField(this, "particlePositionPlugins");
    __publicField(this, "particleUpdaters");
    __publicField(this, "particles");
    __publicField(this, "plugins");
    __publicField(this, "retina");
    __publicField(this, "shapeDrawers");
    __publicField(this, "started");
    __publicField(this, "zLayers");
    __publicField(this, "_delay");
    __publicField(this, "_delayTimeout");
    __publicField(this, "_delta", { value: 0, factor: 0 });
    __publicField(this, "_dispatchCallback");
    __publicField(this, "_drawAnimationFrame");
    __publicField(this, "_duration");
    __publicField(this, "_eventListeners");
    __publicField(this, "_firstStart");
    __publicField(this, "_initialSourceOptions");
    __publicField(this, "_lastFrameTime");
    __publicField(this, "_lifeTime");
    __publicField(this, "_onDestroy");
    __publicField(this, "_options");
    __publicField(this, "_paused");
    __publicField(this, "_pluginManager");
    __publicField(this, "_smooth");
    __publicField(this, "_sourceOptions");
    __publicField(this, "_nextFrame", (timestamp) => {
      try {
        if (!this._smooth && this._lastFrameTime !== void 0 && timestamp < this._lastFrameTime + millisecondsToSeconds / this.fpsLimit) {
          this.draw(false);
          return;
        }
        this._lastFrameTime ?? (this._lastFrameTime = timestamp);
        updateDelta(this._delta, timestamp - this._lastFrameTime, this.fpsLimit, this._smooth);
        this.addLifeTime(this._delta.value);
        this._lastFrameTime = timestamp;
        if (this._delta.value > millisecondsToSeconds) {
          this.draw(false);
          return;
        }
        this.canvas.render.drawParticles(this._delta);
        if (!this.alive()) {
          this.destroy();
          return;
        }
        if (this.animationStatus) {
          this.draw(false);
        }
      } catch (e) {
        getLogger().error("error in animation loop", e);
      }
    });
    const { dispatchCallback, pluginManager, id, onDestroy, sourceOptions } = params;
    this._pluginManager = pluginManager;
    this._dispatchCallback = dispatchCallback;
    this._onDestroy = onDestroy;
    this.id = Symbol(id);
    this.fpsLimit = 120;
    this.hdr = false;
    this._smooth = false;
    this._delay = 0;
    this._duration = 0;
    this._lifeTime = 0;
    this._firstStart = true;
    this.started = false;
    this.destroyed = false;
    this._paused = true;
    this._lastFrameTime = 0;
    this.zLayers = 100;
    this.pageHidden = false;
    this._sourceOptions = sourceOptions;
    this._initialSourceOptions = sourceOptions;
    this.effectDrawers = /* @__PURE__ */ new Map();
    this.shapeDrawers = /* @__PURE__ */ new Map();
    this.particleUpdaters = [];
    this.retina = new Retina(this);
    this.canvas = new CanvasManager(this._pluginManager, this);
    this.particles = new ParticlesManager(this._pluginManager, this);
    this.plugins = [];
    this.particleDestroyedPlugins = [];
    this.particleCreatedPlugins = [];
    this.particlePositionPlugins = [];
    this._options = loadContainerOptions(this._pluginManager, this);
    this.actualOptions = loadContainerOptions(this._pluginManager, this);
    this._eventListeners = new EventListeners(this);
    this.dispatchEvent(EventType.containerBuilt);
  }
  get animationStatus() {
    return !this._paused && !this.pageHidden && guardCheck(this);
  }
  get options() {
    return this._options;
  }
  get sourceOptions() {
    return this._sourceOptions;
  }
  addLifeTime(value) {
    this._lifeTime += value;
  }
  alive() {
    return !this._duration || this._lifeTime <= this._duration;
  }
  destroy(remove = true) {
    var _a, _b, _c;
    if (!guardCheck(this)) {
      return;
    }
    this.stop();
    this.particles.destroy();
    this.canvas.destroy();
    for (const [, effectDrawer] of this.effectDrawers) {
      (_a = effectDrawer.destroy) == null ? void 0 : _a.call(effectDrawer, this);
    }
    for (const [, shapeDrawer] of this.shapeDrawers) {
      (_b = shapeDrawer.destroy) == null ? void 0 : _b.call(shapeDrawer, this);
    }
    for (const plugin of this.plugins) {
      (_c = plugin.destroy) == null ? void 0 : _c.call(plugin);
    }
    this.effectDrawers = /* @__PURE__ */ new Map();
    this.shapeDrawers = /* @__PURE__ */ new Map();
    this.particleUpdaters = [];
    this.plugins.length = 0;
    this._pluginManager.clearPlugins(this);
    this.destroyed = true;
    this._onDestroy(remove);
    this.dispatchEvent(EventType.containerDestroyed);
  }
  dispatchEvent(type, data) {
    this._dispatchCallback(type, {
      container: this,
      data
    });
  }
  draw(force) {
    if (!guardCheck(this)) {
      return;
    }
    let refreshTime = force;
    this._drawAnimationFrame = animate((timestamp) => {
      if (refreshTime) {
        this._lastFrameTime = void 0;
        refreshTime = false;
      }
      this._nextFrame(timestamp);
    });
  }
  async export(type, options = {}) {
    for (const plugin of this.plugins) {
      if (!plugin.export) {
        continue;
      }
      const res = await plugin.export(type, options);
      if (!res.supported) {
        continue;
      }
      return res.blob;
    }
    getLogger().error(`Export plugin with type ${type} not found`);
    return void 0;
  }
  async init() {
    var _a, _b;
    if (!guardCheck(this)) {
      return;
    }
    const allContainerPlugins = /* @__PURE__ */ new Map();
    for (const plugin of this._pluginManager.plugins) {
      const containerPlugin = await plugin.getPlugin(this);
      if (containerPlugin.preInit) {
        await containerPlugin.preInit();
      }
      allContainerPlugins.set(plugin, containerPlugin);
    }
    await this.initDrawersAndUpdaters();
    this._options = loadContainerOptions(this._pluginManager, this, this._initialSourceOptions, this.sourceOptions);
    this.actualOptions = loadContainerOptions(this._pluginManager, this, this._options);
    this.plugins.length = 0;
    this.particleDestroyedPlugins.length = 0;
    this.particleCreatedPlugins.length = 0;
    this.particlePositionPlugins.length = 0;
    for (const [plugin, containerPlugin] of allContainerPlugins) {
      if (plugin.needsPlugin(this.actualOptions)) {
        this.plugins.push(containerPlugin);
        if (containerPlugin.particleCreated) {
          this.particleCreatedPlugins.push(containerPlugin);
        }
        if (containerPlugin.particleDestroyed) {
          this.particleDestroyedPlugins.push(containerPlugin);
        }
        if (containerPlugin.particlePosition) {
          this.particlePositionPlugins.push(containerPlugin);
        }
      }
    }
    this.retina.init();
    this.canvas.init();
    this.updateActualOptions();
    this.canvas.initBackground();
    this.canvas.resize();
    const { delay, duration, fpsLimit, hdr, smooth, zLayers } = this.actualOptions;
    this.hdr = hdr;
    this.zLayers = zLayers;
    this._duration = getRangeValue(duration) * millisecondsToSeconds;
    this._delay = getRangeValue(delay) * millisecondsToSeconds;
    this._lifeTime = 0;
    this.fpsLimit = fpsLimit > minFpsLimit ? fpsLimit : defaultFpsLimit;
    this._smooth = smooth;
    for (const plugin of this.plugins) {
      await ((_a = plugin.init) == null ? void 0 : _a.call(plugin));
    }
    await this.particles.init();
    this.dispatchEvent(EventType.containerInit);
    this.particles.setDensity();
    for (const plugin of this.plugins) {
      (_b = plugin.particlesSetup) == null ? void 0 : _b.call(plugin);
    }
    this.dispatchEvent(EventType.particlesSetup);
  }
  async initDrawersAndUpdaters() {
    const pluginManager = this._pluginManager;
    this.effectDrawers = await pluginManager.getEffectDrawers(this, true);
    this.shapeDrawers = await pluginManager.getShapeDrawers(this, true);
    this.particleUpdaters = await pluginManager.getUpdaters(this, true);
  }
  pause() {
    var _a;
    if (!guardCheck(this)) {
      return;
    }
    if (this._drawAnimationFrame !== void 0) {
      cancelAnimation(this._drawAnimationFrame);
      delete this._drawAnimationFrame;
    }
    if (this._paused) {
      return;
    }
    for (const plugin of this.plugins) {
      (_a = plugin.pause) == null ? void 0 : _a.call(plugin);
    }
    if (!this.pageHidden) {
      this._paused = true;
    }
    this.dispatchEvent(EventType.containerPaused);
  }
  play(force) {
    if (!guardCheck(this)) {
      return;
    }
    const needsUpdate = this._paused || force;
    if (this._firstStart && !this.actualOptions.autoPlay) {
      this._firstStart = false;
      return;
    }
    if (this._paused) {
      this._paused = false;
    }
    if (needsUpdate) {
      for (const plugin of this.plugins) {
        if (plugin.play) {
          plugin.play();
        }
      }
    }
    this.dispatchEvent(EventType.containerPlay);
    this.draw(needsUpdate ?? false);
  }
  async refresh() {
    if (!guardCheck(this)) {
      return;
    }
    this.stop();
    return this.start();
  }
  async reset(sourceOptions) {
    if (!guardCheck(this)) {
      return;
    }
    this._initialSourceOptions = sourceOptions;
    this._sourceOptions = sourceOptions;
    this._options = loadContainerOptions(this._pluginManager, this, this._initialSourceOptions, this.sourceOptions);
    this.actualOptions = loadContainerOptions(this._pluginManager, this, this._options);
    return this.refresh();
  }
  async start() {
    if (!guardCheck(this) || this.started) {
      return;
    }
    await this.init();
    this.started = true;
    await new Promise((resolve) => {
      const start = async () => {
        var _a;
        this._eventListeners.addListeners();
        for (const plugin of this.plugins) {
          await ((_a = plugin.start) == null ? void 0 : _a.call(plugin));
        }
        this.dispatchEvent(EventType.containerStarted);
        this.play();
        resolve();
      };
      this._delayTimeout = setTimeout(() => void start(), this._delay);
    });
  }
  stop() {
    var _a;
    if (!guardCheck(this) || !this.started) {
      return;
    }
    if (this._delayTimeout) {
      clearTimeout(this._delayTimeout);
      delete this._delayTimeout;
    }
    this._firstStart = true;
    this.started = false;
    this._eventListeners.removeListeners();
    this.pause();
    this.particles.clear();
    this.canvas.stop();
    for (const plugin of this.plugins) {
      (_a = plugin.stop) == null ? void 0 : _a.call(plugin);
    }
    this.particleCreatedPlugins.length = 0;
    this.particleDestroyedPlugins.length = 0;
    this.particlePositionPlugins.length = 0;
    this._sourceOptions = this._options;
    this.dispatchEvent(EventType.containerStopped);
  }
  updateActualOptions() {
    let refresh = false;
    for (const plugin of this.plugins) {
      if (plugin.updateActualOptions) {
        refresh = plugin.updateActualOptions() || refresh;
      }
    }
    return refresh;
  }
}
export {
  Container
};
