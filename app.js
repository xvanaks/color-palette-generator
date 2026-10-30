(function () {
  const initialHexList = ["#2A2B2A", "#5E4955", "#996888", "#C99DA3", "#C6DDF0"];

  let paletteColors = initialHexList.map((hex) => ({ hex, locked: false, name: "" }));
  const historyStack = [];
  let historyPointer = -1;
  let activeEditIndex = 0;
  let currentExportFormat = "css";
  let currentHarmonyMode = "smart";
  let draggedColumnIndex = null;
  let toastTimer = null;

  const paletteCanvas = document.getElementById("paletteCanvas");
  const harmonyDropdown = document.getElementById("harmonyDropdown");
  const harmonyDropdownTrigger = document.getElementById("harmonyDropdownTrigger");
  const harmonyDropdownMenu = document.getElementById("harmonyDropdownMenu");
  const selectedHarmonyLabel = document.getElementById("selectedHarmonyLabel");
  const dropdownOptionItems = document.querySelectorAll(".dropdown-option-item");
  const generatePaletteButton = document.getElementById("generatePaletteButton");
  const undoHistoryButton = document.getElementById("undoHistoryButton");
  const redoHistoryButton = document.getElementById("redoHistoryButton");
  const decreaseColumnsButton = document.getElementById("decreaseColumnsButton");
  const increaseColumnsButton = document.getElementById("increaseColumnsButton");
  const columnsTotalCount = document.getElementById("columnsTotalCount");
  const openPreviewButton = document.getElementById("openPreviewButton");
  const openExportButton = document.getElementById("openExportButton");
  const toastNotification = document.getElementById("toastNotification");

  const colorEditorModal = document.getElementById("colorEditorModal");
  const closeColorEditorButton = document.getElementById("closeColorEditorButton");
  const editorColorSample = document.getElementById("editorColorSample");
  const editorColorName = document.getElementById("editorColorName");
  const editorContrastRating = document.getElementById("editorContrastRating");
  const nativeColorPickerInput = document.getElementById("nativeColorPickerInput");
  const manualHexCodeInput = document.getElementById("manualHexCodeInput");
  const applyManualHexButton = document.getElementById("applyManualHexButton");
  const quickSwatchesContainer = document.getElementById("quickSwatchesContainer");

  const shadesInspectorModal = document.getElementById("shadesInspectorModal");
  const closeShadesInspectorButton = document.getElementById("closeShadesInspectorButton");
  const shadesInspectorSubtitle = document.getElementById("shadesInspectorSubtitle");
  const shadesGridContainer = document.getElementById("shadesGridContainer");

  const websiteMockupModal = document.getElementById("websiteMockupModal");
  const closeWebsiteMockupButton = document.getElementById("closeWebsiteMockupButton");
  const mockupCanvasFrame = document.getElementById("mockupCanvasFrame");

  const exportPaletteModal = document.getElementById("exportPaletteModal");
  const closeExportPaletteButton = document.getElementById("closeExportPaletteButton");
  const exportSnippetPre = document.getElementById("exportSnippetPre");
  const exportImageCanvas = document.getElementById("exportImageCanvas");
  const copyExportContentButton = document.getElementById("copyExportContentButton");
  const downloadImageButton = document.getElementById("downloadImageButton");
  const exportTabButtons = document.querySelectorAll(".export-tab-item");

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastNotification.textContent = message;
    toastNotification.classList.add("is-visible");
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove("is-visible");
    }, 2000);
  }

  function copyToClipboard(text, successMessage = "Скопировано в буфер!") {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast(successMessage);
    });
  }

  function recordHistory() {
    if (historyPointer < historyStack.length - 1) {
      historyStack.splice(historyPointer + 1);
    }
    historyStack.push(paletteColors.map((color) => ({ ...color })));
    if (historyStack.length > 30) historyStack.shift();
    else historyPointer++;

    undoHistoryButton.disabled = historyPointer <= 0;
    redoHistoryButton.disabled = historyPointer >= historyStack.length - 1;
    syncUrl();
  }

  function undoHistory() {
    if (historyPointer > 0) {
      historyPointer--;
      paletteColors = historyStack[historyPointer].map((color) => ({ ...color }));
      renderPalette();
      undoHistoryButton.disabled = historyPointer <= 0;
      redoHistoryButton.disabled = historyPointer >= historyStack.length - 1;
      syncUrl();
    }
  }

  function redoHistory() {
    if (historyPointer < historyStack.length - 1) {
      historyPointer++;
      paletteColors = historyStack[historyPointer].map((color) => ({ ...color }));
      renderPalette();
      undoHistoryButton.disabled = historyPointer <= 0;
      redoHistoryButton.disabled = historyPointer >= historyStack.length - 1;
      syncUrl();
    }
  }

  function syncUrl() {
    const rawTokens = paletteColors.map((c) => c.hex.replace("#", "")).join("-");
    window.history.replaceState(null, "", `#${rawTokens}`);
  }

  function readUrl() {
    const hashContent = window.location.hash.replace("#", "").trim();
    if (!hashContent) return null;
    const tokens = hashContent.split("-").filter((token) => /^[0-9A-Fa-f]{6}$/.test(token));
    if (tokens.length >= 2) {
      return tokens.map((hex) => ({ hex: `#${hex.toUpperCase()}`, locked: false, name: "" }));
    }
    return null;
  }

  function generateNewPalette() {
    const nextHexList = PaletteEngine.generatePalette(paletteColors, currentHarmonyMode);

    for (let i = 0; i < paletteColors.length; i++) {
      if (!paletteColors[i].locked) {
        paletteColors[i].hex = nextHexList[i];
      }
    }

    renderPalette();
    recordHistory();
  }

  function renderPalette() {
    paletteCanvas.innerHTML = "";
    columnsTotalCount.textContent = paletteColors.length;

    paletteColors.forEach((colorItem, index) => {
      const isLight = PaletteEngine.isLightColor(colorItem.hex);
      colorItem.name = ColorNames.getName(colorItem.hex);

      const strip = document.createElement("div");
      strip.className = `palette-strip ${isLight ? "theme-light" : "theme-dark"} ${colorItem.locked ? "is-locked" : ""}`;
      strip.style.backgroundColor = colorItem.hex;
      strip.draggable = true;

      let insertButtonHtml = "";
      if (index < paletteColors.length - 1 && paletteColors.length < 10) {
        insertButtonHtml = `
          <button class="strip-insert-btn" data-action="insert" data-index="${index}" title="Вставить цвет">+</button>
        `;
      }

      strip.innerHTML = `
        ${insertButtonHtml}
        <div class="strip-action-stack">
          ${paletteColors.length > 2 ? `
            <button class="strip-btn" data-action="remove" data-index="${index}" title="Удалить колонку">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          ` : ""}
          <button class="strip-btn" data-action="shades" data-index="${index}" title="Оттенки">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button class="strip-btn" data-action="edit" data-index="${index}" title="Настроить цвет">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
          </button>
          <button class="strip-btn" data-action="copy" data-index="${index}" title="Скопировать HEX">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button class="strip-btn lock-toggle-btn" data-action="lock" data-index="${index}" title="${colorItem.locked ? "Разблокировать" : "Зафиксировать"}">
            ${colorItem.locked ? `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ` : `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            `}
          </button>
        </div>

        <div class="strip-meta-block" data-index="${index}">
          <div class="strip-hex-text" contenteditable="true" spellcheck="false" data-index="${index}">${colorItem.hex.replace("#", "")}</div>
          <div class="strip-color-title">${colorItem.name}</div>
        </div>
      `;

      strip.addEventListener("dragstart", (e) => {
        if (e.target.closest(".strip-btn, .strip-hex-text, .strip-insert-btn")) {
          e.preventDefault();
          return;
        }
        draggedColumnIndex = index;
        strip.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      strip.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        strip.classList.add("is-drag-target");
      });

      strip.addEventListener("dragleave", () => {
        strip.classList.remove("is-drag-target");
      });

      strip.addEventListener("dragend", () => {
        strip.classList.remove("is-dragging");
        strip.classList.remove("is-drag-target");
      });

      strip.addEventListener("drop", (e) => {
        e.preventDefault();
        strip.classList.remove("is-drag-target");
        if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
          const movedItem = paletteColors.splice(draggedColumnIndex, 1)[0];
          paletteColors.splice(index, 0, movedItem);
          recordHistory();
          renderPalette();
        }
        draggedColumnIndex = null;
      });

      strip.addEventListener("dblclick", (e) => {
        if (e.target.closest(".strip-btn, .strip-insert-btn")) return;
        openColorEditor(index);
      });

      paletteCanvas.appendChild(strip);
    });

    attachCanvasEvents();
  }

  function attachCanvasEvents() {
    paletteCanvas.querySelectorAll(".strip-btn, .strip-insert-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index, 10);
        handleStripAction(action, index);
      });
    });

    paletteCanvas.querySelectorAll(".strip-hex-text").forEach((hexElem) => {
      const index = parseInt(hexElem.dataset.index, 10);

      hexElem.addEventListener("click", (e) => e.stopPropagation());
      hexElem.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          hexElem.blur();
        }
      });

      hexElem.addEventListener("blur", () => {
        let inputVal = hexElem.innerText.trim().replace("#", "").toUpperCase();
        if (/^[0-9A-F]{6}$/.test(inputVal) || /^[0-9A-F]{3}$/.test(inputVal)) {
          if (inputVal.length === 3) {
            inputVal = inputVal.split("").map((c) => c + c).join("");
          }
          const validHex = `#${inputVal}`;
          if (paletteColors[index].hex !== validHex) {
            paletteColors[index].hex = validHex;
            recordHistory();
            renderPalette();
            showToast(`Установлен цвет ${validHex}`);
          }
        } else {
          hexElem.innerText = paletteColors[index].hex.replace("#", "");
        }
      });
    });

    paletteCanvas.querySelectorAll(".strip-meta-block").forEach((metaElem) => {
      metaElem.addEventListener("click", (e) => {
        if (e.target.classList.contains("strip-hex-text")) return;
        openColorEditor(parseInt(metaElem.dataset.index, 10));
      });
    });
  }

  function handleStripAction(action, index) {
    switch (action) {
      case "lock":
        paletteColors[index].locked = !paletteColors[index].locked;
        renderPalette();
        showToast(paletteColors[index].locked ? "Цвет зафиксирован 🔒" : "Цвет разблокирован 🔓");
        break;
      case "copy":
        copyToClipboard(paletteColors[index].hex, `Скопирован ${paletteColors[index].hex}`);
        break;
      case "remove":
        if (paletteColors.length > 2) {
          paletteColors.splice(index, 1);
          recordHistory();
          renderPalette();
        }
        break;
      case "shades":
        openShadesInspector(index);
        break;
      case "edit":
        openColorEditor(index);
        break;
      case "insert":
        if (paletteColors.length < 10) {
          const baseHex = paletteColors[index].hex;
          const shades = PaletteEngine.generateShades(baseHex, 6);
          const newHex = shades[Math.floor(Math.random() * shades.length)];
          paletteColors.splice(index + 1, 0, { hex: newHex, locked: false, name: "" });
          recordHistory();
          renderPalette();
        }
        break;
    }
  }

  function openColorEditor(index) {
    activeEditIndex = index;
    const currentHex = paletteColors[index].hex;
    updateEditorDisplay(currentHex);
    populateQuickSwatches();
    colorEditorModal.classList.add("is-visible");
  }

  function updateEditorDisplay(hex) {
    hex = hex.toUpperCase();
    editorColorSample.style.backgroundColor = hex;
    nativeColorPickerInput.value = hex;
    manualHexCodeInput.value = hex.replace("#", "");
    editorColorName.textContent = ColorNames.getName(hex);

    const contrastWhite = PaletteEngine.getContrastRatio(hex, "#FFFFFF");
    const contrastBlack = PaletteEngine.getContrastRatio(hex, "#000000");
    editorContrastRating.textContent = `Контраст: к белому ${contrastWhite}:1 / к черному ${contrastBlack}:1`;
  }

  function applyCustomHex(rawHex) {
    let cleanHex = rawHex.trim().toUpperCase();
    if (!cleanHex.startsWith("#")) cleanHex = `#${cleanHex}`;
    if (/^#[0-9A-F]{6}$/.test(cleanHex)) {
      paletteColors[activeEditIndex].hex = cleanHex;
      renderPalette();
      recordHistory();
      updateEditorDisplay(cleanHex);
    }
  }

  function populateQuickSwatches() {
    const swatches = [
      "#2A2B2A", "#5E4955", "#996888", "#C99DA3", "#C6DDF0",
      "#E63946", "#F4A261", "#E9C46A", "#2A9D8F", "#264653",
      "#3A86FF", "#8338EC", "#FF006E", "#00B4D8", "#03045E"
    ];
    quickSwatchesContainer.innerHTML = "";
    swatches.forEach((swatchHex) => {
      const tile = document.createElement("div");
      tile.className = "quick-color-tile";
      tile.style.backgroundColor = swatchHex;
      tile.title = swatchHex;
      tile.addEventListener("click", () => applyCustomHex(swatchHex));
      quickSwatchesContainer.appendChild(tile);
    });
  }

  nativeColorPickerInput.addEventListener("input", (e) => applyCustomHex(e.target.value));
  applyManualHexButton.addEventListener("click", () => applyCustomHex(manualHexCodeInput.value));
  manualHexCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyCustomHex(manualHexCodeInput.value);
  });
  closeColorEditorButton.addEventListener("click", () => colorEditorModal.classList.remove("is-visible"));

  function openShadesInspector(index) {
    activeEditIndex = index;
    const targetHex = paletteColors[index].hex;
    const colorTitle = ColorNames.getName(targetHex);
    shadesInspectorSubtitle.textContent = `${colorTitle} (${targetHex})`;

    const shades = PaletteEngine.generateShades(targetHex, 10);
    shadesGridContainer.innerHTML = "";

    shades.forEach((shadeHex) => {
      const isLight = PaletteEngine.isLightColor(shadeHex);
      const box = document.createElement("div");
      box.className = "shade-box";
      box.style.backgroundColor = shadeHex;
      box.style.color = isLight ? "#0f172a" : "#ffffff";
      box.innerHTML = `<span class="shade-code">${shadeHex}</span>`;

      box.addEventListener("click", () => {
        paletteColors[activeEditIndex].hex = shadeHex;
        renderPalette();
        recordHistory();
        shadesInspectorModal.classList.remove("is-visible");
        showToast(`Выбран оттенок ${shadeHex}`);
      });

      shadesGridContainer.appendChild(box);
    });

    shadesInspectorModal.classList.add("is-visible");
  }

  closeShadesInspectorButton.addEventListener("click", () => shadesInspectorModal.classList.remove("is-visible"));

  function openWebsiteMockup() {
    const colors = paletteColors;
    if (colors.length < 2) return;

    const sortedByLuminance = [...colors].sort((a, b) => PaletteEngine.getLuminance(a.hex) - PaletteEngine.getLuminance(b.hex));
    const darkest = sortedByLuminance[0].hex;
    const secondaryDark = sortedByLuminance[Math.min(1, sortedByLuminance.length - 1)].hex;
    const primaryAccent = colors[Math.floor(colors.length / 2)].hex;
    const lightest = sortedByLuminance[sortedByLuminance.length - 1].hex;
    const secondaryLight = sortedByLuminance[Math.max(0, sortedByLuminance.length - 2)].hex;

    mockupCanvasFrame.style.backgroundColor = lightest;
    mockupCanvasFrame.style.color = darkest;

    const navBtn = mockupCanvasFrame.querySelector(".mockup-nav-button");
    navBtn.style.backgroundColor = primaryAccent;
    navBtn.style.color = PaletteEngine.isLightColor(primaryAccent) ? "#0f172a" : "#ffffff";

    const chipTag = mockupCanvasFrame.querySelector(".mockup-chip-tag");
    chipTag.style.backgroundColor = secondaryLight;
    chipTag.style.color = PaletteEngine.isLightColor(secondaryLight) ? "#0f172a" : "#ffffff";

    const ctaPrimary = mockupCanvasFrame.querySelector(".mockup-primary-cta");
    ctaPrimary.style.backgroundColor = primaryAccent;
    ctaPrimary.style.color = PaletteEngine.isLightColor(primaryAccent) ? "#0f172a" : "#ffffff";

    const ctaSecondary = mockupCanvasFrame.querySelector(".mockup-secondary-cta");
    ctaSecondary.style.color = darkest;
    ctaSecondary.style.borderColor = darkest;

    const cards = mockupCanvasFrame.querySelectorAll(".mockup-card");
    cards.forEach((card, i) => {
      const cardBg = colors[i % colors.length].hex;
      card.style.backgroundColor = cardBg;
      card.style.color = PaletteEngine.isLightColor(cardBg) ? "#0f172a" : "#ffffff";
    });

    websiteMockupModal.classList.add("is-visible");
  }

  openPreviewButton.addEventListener("click", openWebsiteMockup);
  closeWebsiteMockupButton.addEventListener("click", () => websiteMockupModal.classList.remove("is-visible"));

  function updateExportCode() {
    copyExportContentButton.classList.remove("hidden-element");
    downloadImageButton.classList.add("hidden-element");
    exportImageCanvas.classList.add("hidden-element");
    exportSnippetPre.classList.remove("hidden-element");

    let snippet = "";
    switch (currentExportFormat) {
      case "css":
        snippet = ":root {\n" + paletteColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n") + "\n}";
        break;
      case "tailwind":
        snippet = "module.exports = {\n  theme: {\n    extend: {\n      colors: {\n" +
          paletteColors.map((c, i) => `        'palette-${i + 1}': '${c.hex}',`).join("\n") +
          "\n      }\n    }\n  }\n}";
        break;
      case "hex":
        snippet = paletteColors.map((c) => `${c.hex} - ${c.name}`).join("\n");
        break;
      case "json":
        snippet = JSON.stringify(
          paletteColors.map((c, i) => ({
            index: i + 1,
            hex: c.hex,
            name: c.name,
            rgb: PaletteEngine.hexToRgb(c.hex),
            hsl: PaletteEngine.rgbToHsl(PaletteEngine.hexToRgb(c.hex).r, PaletteEngine.hexToRgb(c.hex).g, PaletteEngine.hexToRgb(c.hex).b)
          })),
          null,
          2
        );
        break;
      case "image":
        renderPaletteCanvasImage();
        return;
    }
    exportSnippetPre.querySelector("code").textContent = snippet;
  }

  function renderPaletteCanvasImage() {
    exportSnippetPre.classList.add("hidden-element");
    exportImageCanvas.classList.remove("hidden-element");
    copyExportContentButton.classList.add("hidden-element");
    downloadImageButton.classList.remove("hidden-element");

    const canvasWidth = 1200;
    const canvasHeight = 675;
    exportImageCanvas.width = canvasWidth;
    exportImageCanvas.height = canvasHeight;
    const ctx = exportImageCanvas.getContext("2d");

    const totalColumns = paletteColors.length;
    const columnWidth = canvasWidth / totalColumns;

    paletteColors.forEach((color, i) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * columnWidth, 0, columnWidth, canvasHeight);

      const isLight = PaletteEngine.isLightColor(color.hex);
      ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";

      ctx.font = "bold 32px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(color.hex.replace("#", ""), i * columnWidth + columnWidth / 2, canvasHeight - 70);

      ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(color.name, i * columnWidth + columnWidth / 2, canvasHeight - 34);
    });
  }

  exportTabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      exportTabButtons.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentExportFormat = tab.dataset.format;
      updateExportCode();
    });
  });

  openExportButton.addEventListener("click", () => {
    updateExportCode();
    exportPaletteModal.classList.add("is-visible");
  });

  closeExportPaletteButton.addEventListener("click", () => exportPaletteModal.classList.remove("is-visible"));

  copyExportContentButton.addEventListener("click", () => {
    const code = exportSnippetPre.querySelector("code").textContent;
    copyToClipboard(code, "Код скопирован!");
  });

  downloadImageButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `palette-${Date.now()}.png`;
    link.href = exportImageCanvas.toDataURL("image/png");
    link.click();
    showToast("Картинка скачана!");
  });

  generatePaletteButton.addEventListener("click", generateNewPalette);
  undoHistoryButton.addEventListener("click", undoHistory);
  redoHistoryButton.addEventListener("click", redoHistory);

  decreaseColumnsButton.addEventListener("click", () => {
    if (paletteColors.length > 2) {
      paletteColors.pop();
      recordHistory();
      renderPalette();
    }
  });

  increaseColumnsButton.addEventListener("click", () => {
    if (paletteColors.length < 10) {
      const last = paletteColors[paletteColors.length - 1];
      const shades = PaletteEngine.generateShades(last.hex, 6);
      const newHex = shades[Math.floor(Math.random() * shades.length)];
      paletteColors.push({ hex: newHex, locked: false, name: "" });
      recordHistory();
      renderPalette();
    }
  });

  harmonyDropdownTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    harmonyDropdown.classList.toggle("is-open");
  });

  dropdownOptionItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownOptionItems.forEach((opt) => opt.classList.remove("is-selected"));
      item.classList.add("is-selected");
      currentHarmonyMode = item.dataset.value;
      selectedHarmonyLabel.textContent = item.textContent;
      harmonyDropdown.classList.remove("is-open");
      generateNewPalette();
      showToast(`Режим: ${item.textContent}`);
    });
  });

  document.addEventListener("click", () => {
    harmonyDropdown.classList.remove("is-open");
  });

  window.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : "";
    const isEditing = activeTag === "INPUT" || activeTag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable);

    if (e.key === "Escape") {
      harmonyDropdown.classList.remove("is-open");
      colorEditorModal.classList.remove("is-visible");
      shadesInspectorModal.classList.remove("is-visible");
      websiteMockupModal.classList.remove("is-visible");
      exportPaletteModal.classList.remove("is-visible");
      return;
    }

    if (isEditing) return;

    if (e.code === "Space") {
      e.preventDefault();
      generateNewPalette();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redoHistory();
      else undoHistory();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redoHistory();
    }
  });

  [colorEditorModal, shadesInspectorModal, websiteMockupModal, exportPaletteModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("is-visible");
    });
  });

  function initialize() {
    const fromUrl = readUrl();
    if (fromUrl) {
      paletteColors = fromUrl;
    }
    renderPalette();
    recordHistory();
  }

  initialize();
})();
