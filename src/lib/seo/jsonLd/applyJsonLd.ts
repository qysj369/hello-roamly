const MANAGED_SELECTOR = 'data-roamly-jsonld';

export function applyJsonLd(id: string, data: Record<string, unknown> | null): () => void {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  const scriptId = `jsonld-${id}`;
  const existing = document.getElementById(scriptId);
  existing?.remove();

  if (!data) {
    return () => undefined;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.setAttribute(MANAGED_SELECTOR, 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);

  return () => {
    document.getElementById(scriptId)?.remove();
  };
}
