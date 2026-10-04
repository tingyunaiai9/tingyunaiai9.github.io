export function matchesPublication(paper, filter = "all", query = "") {
  const matchesFilter = filter === "all" || (filter === "first-author" ? paper.isFirstAuthor : paper.type === filter);
  const searchText = `${paper.title} ${paper.authors.map((author) => author.name).join(" ")} ${paper.venue} ${paper.year}`.toLowerCase();
  return Boolean(matchesFilter && searchText.includes(query.trim().toLowerCase()));
}

export function isValidPublications(papers) {
  return (
    Array.isArray(papers) &&
    papers.every(
      (paper) =>
        paper &&
        typeof paper.id === "string" &&
        /^[\w-]+$/.test(paper.id) &&
        typeof paper.title === "string" &&
        typeof paper.venue === "string" &&
        ["accepted", "preprint", "under-review"].includes(paper.type) &&
        typeof paper.isFirstAuthor === "boolean" &&
        Number.isInteger(paper.year) &&
        Array.isArray(paper.authors) &&
        paper.authors.every((author) => author && typeof author.name === "string")
    ) &&
    new Set(papers.map((paper) => paper.id)).size === papers.length
  );
}
