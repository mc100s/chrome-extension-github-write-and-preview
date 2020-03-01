"use strict";

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

  let globalIntervalId;
  let canFastUpdate = false;
  let previousTextLength = $textarea.value.length;
  function updateNewPreview(e) {
    const letterTyped = e?.data;
    const { selectionStart } = $textarea;
    const currentTextLength = $textarea.value.length;
    canFastUpdate =
      canFastUpdate &&
      currentTextLength === previousTextLength + 1 &&
      letterTyped &&
      letterTyped.length === 1;
    previousTextLength = currentTextLength;
    if (canFastUpdate) {
      const previousTextTyped = $textarea.value
        .substr(0, selectionStart - 1)
        .match(/[a-z][- '"a-z0-9\.\?\!\,]*$/i)?.[0];
      const matches = [
        ...$newPreview.innerHTML.matchAll(
          new RegExp(previousTextTyped?.trim(), "g")
        )
      ];
      if (previousTextTyped && matches.length === 1) {
        const length = matches[0].index + previousTextTyped.trim().length;
        $newPreview.innerHTML =
          $newPreview.innerHTML.substr(0, length) +
          " ".repeat(
            previousTextTyped.length - previousTextTyped.trim().length
          ) +
          letterTyped +
          $newPreview.innerHTML.substr(length);
      } else {
        canFastUpdate = false;
      }
    }
    const localIntervalId = setTimeout(() => {
      if (globalIntervalId === localIntervalId) {
        markdownToGithubHtml($textarea.value).then(result => {
          $newPreview.innerHTML = result;
          canFastUpdate = true;
          showDebug({ canFastUpdate });
        });
      }
    }, 2000);
    globalIntervalId = localIntervalId;

    showDebug({ canFastUpdate });
  }
  setTimeout(() => {
    updateNewPreview();
  }, 0);
  $textarea.addEventListener("input", updateNewPreview);

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
};

function showDebug(variables) {
  let $debug = document.querySelector("#debug");
  setLocalValue("variables", variables);
  if (!$debug) {
    $debug = document.createElement("div");
    $debug.setAttribute("id", "debug");
    $debug.style.position = "fixed";
    $debug.style.top = 0;
    $debug.style.right = 0;
    $debug.style.padding = "5px 8px";
    $debug.style.zIndex = 1000;
    $debug.style.backgroundColor = "#ff0000a0";
    $debug.style.color = "#ffffff";
    $debug.style.cursor = "pointer";
    $debug.addEventListener("click", () => {
      setLocalValue("isDebugExpanded", !getLocalValue("isDebugExpanded"));
      showDebug(getLocalValue("variables"));
    });
    document.body.append($debug);
  }

  if (!getLocalValue("isDebugExpanded")) {
    $debug.innerHTML = "+";
  } else {
    $debug.innerHTML = "";
    for (const variableName in variables) {
      const jsonStr = JSON.stringify(variables[variableName], null, 2);
      $debug.innerHTML += `${variableName} = ${jsonStr}\n`;
    }
  }
}

function getLocalValue(key) {
  return JSON.parse(localStorage.getItem(key));
}
function setLocalValue(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}
