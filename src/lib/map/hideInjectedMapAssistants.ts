const HIDE_ATTR = 'data-roamly-hidden-assistant';

/** 只保护地图画布与站点控件，不保护整个地图容器（助手常注入在容器内） */
const SKIP_SELECTOR =
  '.home-map-trail-control, .home-map-trail-strip, .amap-logo, .amap-copyright, canvas.amap-layer, .amap-layers, .amap-maps';

const ASSISTANT_HINT =
  /assistant|aigc|lisa|doubao|byte|chatbot|digital|智能客服|avatar|digital-human|数字人/i;

function isSkipped(element: Element): boolean {
  return Boolean(element.closest(SKIP_SELECTOR));
}

function readRect(element: Element): DOMRect | null {
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  return rect;
}

function isBottomRightCorner(rect: DOMRect): boolean {
  const nearRight = rect.right >= window.innerWidth - 120;
  const nearBottom = rect.bottom >= window.innerHeight - 280;
  return nearRight && nearBottom;
}

function isFloater(element: Element): boolean {
  const style = window.getComputedStyle(element);
  if (style.position !== 'fixed' && style.position !== 'absolute') {
    return false;
  }
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return true;
}

function isRoundishWidget(element: Element, rect: DOMRect): boolean {
  if (rect.width < 32 || rect.height < 32 || rect.width > 180 || rect.height > 180) {
    return false;
  }
  const ratio = rect.width / rect.height;
  if (ratio < 0.72 || ratio > 1.38) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const radius = style.borderRadius;
  return radius.includes('50%') || Number.parseFloat(radius) >= Math.min(rect.width, rect.height) * 0.35;
}

function hasPortraitMedia(element: Element): boolean {
  if (element.tagName === 'IMG') {
    return true;
  }
  if (element.querySelector('img, picture, video')) {
    return true;
  }

  const style = window.getComputedStyle(element);
  return style.backgroundImage !== 'none' && style.backgroundImage.includes('url(');
}

function matchesAssistantHint(element: Element): boolean {
  const idClass = `${element.id} ${typeof element.className === 'string' ? element.className : ''}`;
  if (ASSISTANT_HINT.test(idClass)) {
    return true;
  }

  return Boolean(
    element.closest(
      '[class*="assistant"], [class*="aigc"], [class*="lisa"], [class*="doubao"], [id*="doubao"], .amap-controls',
    ),
  );
}

function shouldHideAssistant(element: Element): boolean {
  if (isSkipped(element)) {
    return false;
  }

  const rect = readRect(element);
  if (!rect) {
    return false;
  }

  if (matchesAssistantHint(element)) {
    return true;
  }

  if (!isFloater(element) || !isBottomRightCorner(rect)) {
    return false;
  }

  if (hasPortraitMedia(element) && isRoundishWidget(element, rect)) {
    return true;
  }

  return Boolean(
    element.closest('.home-map-trail-wall .amap-controls') && hasPortraitMedia(element),
  );
}

function hideElement(element: HTMLElement): void {
  if (element.hasAttribute(HIDE_ATTR)) {
    return;
  }
  element.setAttribute(HIDE_ATTR, '1');
  element.style.setProperty('display', 'none', 'important');
  element.style.setProperty('visibility', 'hidden', 'important');
  element.style.setProperty('pointer-events', 'none', 'important');
  element.style.setProperty('opacity', '0', 'important');
}

function scanForInjectedAssistants(root: ParentNode): void {
  const candidates =
    root instanceof Document
      ? [...root.body.querySelectorAll<HTMLElement>('*'), ...root.body.children]
      : root instanceof Element
        ? [root, ...root.querySelectorAll<HTMLElement>('*')]
        : [];

  for (const element of candidates) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }
    if (shouldHideAssistant(element)) {
      hideElement(element);
    }
  }
}

/** 隐藏高德 / 浏览器插件注入的右下角 AI 助手头像（保留蜗牛 FAB 与地图画布） */
export function bindHideInjectedMapAssistants(container: HTMLElement): () => void {
  const run = () => {
    scanForInjectedAssistants(container);
    scanForInjectedAssistants(document);
  };

  run();

  const observer = new MutationObserver(() => {
    run();
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'src'],
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'src'],
  });

  const intervalId = window.setInterval(run, 400);

  return () => {
    observer.disconnect();
    window.clearInterval(intervalId);
  };
}
