const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Validate URLs so only safe web protocols or local static asset paths are used in href/src.
 * Rejects javascript:, data:, vbscript:, and malformed schemes.
 */
export function safeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/assets/') || trimmed.startsWith('./assets/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:'
    ) {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Create a DOM element safely using textContent for text nodes and explicit attribute assignment.
 * Avoids innerHTML sinks across the codebase.
 */
export function createEl(tag, options = {}, ...children) {
  const el = document.createElement(tag);

  if (options.className) {
    el.className = options.className;
  }

  if (options.text !== undefined && options.text !== null) {
    el.textContent = String(options.text);
  }

  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      if (value !== undefined && value !== null) {
        el.setAttribute(key, String(value));
      }
    }
  }

  if (options.dataset) {
    for (const [key, value] of Object.entries(options.dataset)) {
      if (value !== undefined && value !== null) {
        el.dataset[key] = String(value);
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Create an inline SVG element via createElementNS (safe, zero innerHTML).
 */
export function createSvgIcon({
  viewBox = '0 0 24 24',
  className = 'w-5 h-5',
  stroke = 'currentColor',
  fill = 'none',
  strokeWidth = '1.8',
  shapes = [],
}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', fill);
  svg.setAttribute('stroke', stroke);
  svg.setAttribute('stroke-width', strokeWidth);
  svg.setAttribute('stroke-linecap', 'square');
  svg.setAttribute('stroke-linejoin', 'miter');
  svg.setAttribute('aria-hidden', 'true');
  if (className) {
    svg.setAttribute('class', className);
  }

  for (const shape of shapes) {
    const node = document.createElementNS(SVG_NS, shape.tag);
    for (const [attr, val] of Object.entries(shape.attrs || {})) {
      node.setAttribute(attr, String(val));
    }
    svg.appendChild(node);
  }

  return svg;
}
