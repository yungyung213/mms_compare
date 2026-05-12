function normalizeText(text) {
  return text
    .replace(/\r\n|\r|\u2028/g, "\n")
    .replace(/\u00a0|\u2003|\t/g, " ");
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[match]));
}

function compare() {
  const original = normalizeText(document.getElementById("textA").innerText);
  const revised = normalizeText(document.getElementById("textB").innerText);

  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(original, revised);
  dmp.diff_cleanupSemantic(diffs);

  let result = "";

  for (let index = 0; index < diffs.length; index += 1) {
    const [operation, data] = diffs[index];
    const html = escapeHtml(data);
    const next = diffs[index + 1];

    if (operation === -1 && next && next[0] === 1) {
      const deletedText = data.trim();
      const addedText = next[1].trim();

      if (
        deletedText.length > 0 &&
        addedText.length > 0 &&
        deletedText.length <= 30 &&
        addedText.length <= 30 &&
        !deletedText.includes("\n") &&
        !addedText.includes("\n")
      ) {
        result += `<span class="replaced">${escapeHtml(next[1])}</span>`;
        index += 1;
      } else {
        result += `<span class="deleted">${html}</span>`;
      }
    } else if (operation === 0) {
      result += html;
    } else if (operation === -1) {
      result += `<span class="deleted">${html}</span>`;
    } else if (operation === 1) {
      result += `<span class="added-block">${html}</span>`;
    }
  }

  document.getElementById("textB").innerHTML = result;
}

function resetText() {
  document.getElementById("textA").innerHTML = "";
  document.getElementById("textB").innerHTML = "";
}

function handlePaste(event) {
  event.preventDefault();

  const text = (event.clipboardData || window.clipboardData).getData("text/plain");
  const selection = window.getSelection();

  if (!selection.rangeCount) return;

  selection.deleteFromDocument();
  selection.getRangeAt(0).insertNode(document.createTextNode(text));
  selection.collapseToEnd();
}

document.getElementById("compareBtn").addEventListener("click", compare);
document.getElementById("resetBtn").addEventListener("click", resetText);

document.querySelectorAll(".editor").forEach((editor) => {
  editor.addEventListener("paste", handlePaste);
});
