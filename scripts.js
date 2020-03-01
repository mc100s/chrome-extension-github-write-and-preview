/*
TODO:
- Add a button "Write & Preview"
- Try to put the actions buttons (eg: "Comment") next to the formatting buttons
- Make it work for new issues (eg: https://github.com/alan-eu/Topics/issues/new)
- Add some latency when user type and don't send too many requests (maybe only after 500ms of inactivity)
- Don't update the text if something older come
- Scroll on the same part that is typed. For example when the user adds a new line, it should scroll down too
*/

function markdownToGithubHtml(markdownText) {
  const formData = new FormData();
  formData.append("text", markdownText);
  formData.append(
    "authenticity_token",
    document.querySelector(".js-data-preview-url-csrf").value
  );

  const repositoryId = document.querySelector('input[name="repository_id"]')
    .value;
  const issueId = document.querySelector('input[name="issue"]').value;

  return fetch(
    `https://github.com/preview?markdown_unsupported=false&repository=${repositoryId}&subject=${issueId}&subject_type=Issue`,
    {
      method: "POST",
      body: formData
    }
  ).then(response => response.text());
}

window.onload = () => {
  const $empty = document.createElement("div");

  const $mainBlock = document.querySelector(
    ".timeline-comment-wrapper.timeline-new-comment.js-comment-container"
  );
  $mainBlock.style.position = "fixed";
  $mainBlock.style.left = 0;
  $mainBlock.style.bottom = 0;
  $mainBlock.style.setProperty("margin", "0", "important");
  $mainBlock.style.setProperty("padding", "0", "important");
  $mainBlock.style.border = "0px solid red";
  $mainBlock.style.width = "100%";
  $mainBlock.style.background = "white";
  $mainBlock.style.zIndex = 1;

  const $protip = $mainBlock.querySelector(".protip") || $empty;
  $protip.style.display = "none";

  const $dragAndDrop = $mainBlock.querySelector(".drag-and-drop");
  $dragAndDrop.style.setProperty("display", "none", "important");

  const $timelineComment =
    $mainBlock.querySelector(".timeline-comment") || $empty;
  $timelineComment.style.setProperty("border", "0", "important");
  $timelineComment.style.setProperty(
    "border-top",
    "1px solid #dddddd",
    "important"
  );
  $timelineComment.style.setProperty("border-radius", "0", "important");

  const $textareaWrapper = $mainBlock.querySelector("text-expander") || $empty;
  $textareaWrapper.style.display = "flex";

  const $newPreview = document.createElement("div");
  $newPreview.classList.add("comment-body", "markdown-body", "js-preview-body");
  $newPreview.style.overflow = "auto";
  $newPreview.style.padding = "10px";
  $textareaWrapper.appendChild($newPreview);

  const $contributionGuideline =
    $mainBlock.querySelector(".text-small") || $empty;
  $contributionGuideline.style.display = "none";

  const $textarea =
    $mainBlock.querySelector(".previewable-comment-form textarea") || $empty;
  $textarea.style.minHeight = "100%";
  $textarea.style.overflow = "auto";

  function updateNewPreview() {
    markdownToGithubHtml($textarea.value).then(result => {
      $newPreview.innerHTML = result;
    });
  }
  setTimeout(() => {
    updateNewPreview();
  }, 0);
  $textarea.addEventListener("keyup", updateNewPreview);

  let height = "20vh";
  function updateStyleHeightMainBlock() {
    $textareaWrapper.style.height = height;
    document.body.style.marginBottom = `calc(${height} - 55px)`;
  }
  updateStyleHeightMainBlock();
  $mainBlock.addEventListener("click", e => {
    if (e.detail === 3) {
      height = height === "20vh" ? "50vh" : "20vh";
      updateStyleHeightMainBlock();
    }
  });

  console.log("Hello world!");
};
