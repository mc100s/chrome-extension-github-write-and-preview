function markdownToGithubHtml(markdownText) {
  const formData = new FormData();
  formData.append("text", markdownText);
  formData.append(
    "authenticity_token",
    document.querySelector(".js-data-preview-url-csrf").value
  );

  const repositoryId = document.querySelector('input[name="repository_id"]').value
  const issueId = document.querySelector('input[name="issue"]').value

  return fetch(
    `https://github.com/preview?markdown_unsupported=false&repository=${repositoryId}&subject=${issueId}&subject_type=Issue`,
    {
      method: "POST",
      body: formData
    }
  ).then(response => response.text());
}

window.onload = () => {
  const $mainBlock = document.querySelector(".discussion-timeline-actions");
  $mainBlock.style.position = "fixed";
  $mainBlock.style.left = "20px";
  $mainBlock.style.bottom = 0;
  $mainBlock.style.border = 0;
  $mainBlock.style.width = "calc(100vw - 60px)";
  $mainBlock.style.paddingBottom = "10px";
  $mainBlock.style.background = "white";
  $mainBlock.style.zIndex = 1;

  $mainBlock.previousElementSibling.style.display = "block";
  $mainBlock.previousElementSibling.style.marginBottom = "40vh"; // To add the space that $mainBlock can hide otherwise

  const $dragAndDrop = $mainBlock.querySelector(".drag-and-drop");
  $dragAndDrop.style.setProperty("display", "none", "important");

  const $textareaWrapper = $mainBlock.querySelector("text-expander");
  $textareaWrapper.style.display = "flex";
  $textareaWrapper.style.height = "40vh";

  const $newPreview = document.createElement("div");
  $newPreview.classList.add("comment-body", "markdown-body", "js-preview-body");
  $newPreview.style.overflow = "auto";
  $newPreview.style.padding = "10px";
  $newPreview.innerHTML = `<h1>Hello world</h1>
  <ul>
  <li>Task 1</li>
  <li>Task 2</li>
  </ul>`;
  $textareaWrapper.appendChild($newPreview);

  const $contributionGuideline = $mainBlock.querySelector(".text-small");
  $contributionGuideline.style.display = "none";

  const $textarea = $mainBlock.querySelector(
    ".previewable-comment-form textarea"
  );
  $textarea.style.minHeight = "100%";
  $textarea.style.overflow = "auto";
  $textarea.addEventListener("keyup", e => {
    markdownToGithubHtml(e.target.value).then(result => {
      $newPreview.innerHTML = result;
    });
  });
  console.log("Hello world!");
};
