export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

export function safeHref(value = "") {
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value)) return "";
  if (/^\/(?!\/)/.test(value)) return value;
  if (/^#[a-z][\w-]*$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? value : "";
  } catch {
    return "";
  }
}

export function link(text, href, className = "") {
  const target = safeHref(href);
  if (!target) return escapeHtml(text);
  const external = /^https?:/.test(target);
  return `<a href="${escapeHtml(target)}"${className ? ` class="${escapeHtml(className)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(text)}</a>`;
}

export function month(date) {
  if (!date || date === "Present") return date || "";
  const [year, number] = date.split("-");
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(number) - 1]} ${year}`;
}

export function paragraph(parts) {
  return `<p>${parts.map((part) => (part.href ? link(part.text, part.href) : escapeHtml(part.text))).join("")}</p>`;
}
