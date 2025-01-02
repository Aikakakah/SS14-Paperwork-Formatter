document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const textPreview = document.getElementById('text-preview');
    const errorMessageElement = document.getElementById('error-message');
    const toolbarButtons = document.querySelectorAll('.toolbar button');
    textPreview.innerHTML = parseText(textInput.value);

    textInput.addEventListener('input', () => {
        errorMessageElement.textContent = "";
        textPreview.innerHTML = parseText(textInput.value);
    });

    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.getAttribute('data-tag');
            insertTag(tag);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 'i') {
            event.preventDefault(); // Prevent default browser behavior
            insertTag('italic');
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'b') {
            event.preventDefault(); // Prevent default browser behavior
            insertTag('bold');
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'u') {
            event.preventDefault(); // Prevent default browser behavior
            insertTag('bolditalic');
        }
    });

    window.changeHeaderSize = function() {
    const selectElement = document.getElementById('header-select-select');
    const selectedValue = selectElement.value;

        if (selectedValue) {
            insertTag("head=" + selectedValue);
            // Reset the dropdown to the hidden option
            selectElement.selectedIndex = 0;
        }
    }

      window.changeBackgroundColor = function() {
        const selectElement = document.getElementById('background-select-select');
        const selectedValue = selectElement.value;
    
            if (selectedValue == "default") {
                document.body.style.backgroundColor = "#8a2929";
                //textInput.style.backgroundImage = "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_background_book.svg.96dpi.png?raw=true)";
                //textInput.style.backgroundRepeat = "no-repeat";
                //textInput.style.backgroundSize = "100% 50%";
                //textPreview.style.background= "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_background_book.svg.96dpi.png?raw=true) no-repeat";
            }
            if (selectedValue == "book") {
                 textInput.style.backgroundColor = "#d2cccc";
                 textPreview.style.backgroundColor = "#d2cccc";
                //textInput.style.background= "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_background_book.svg.96dpi.png?raw=true) no-repeat";
                //textPreview.style.background= "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_background_book.svg.96dpi.png?raw=true)";
            }
            if (selectedValue == "paper") {
                textInput.style.backgroundColor = "#ebebdb";
                textPreview.style.backgroundColor = "#ebebdb";
            }
            if (selectedValue == "office-paper") {
                textInput.style.backgroundColor = "#ffffff";
                textPreview.style.backgroundColor = "#ffffff";
                textInput.style.backgroundImage= "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_content_lined.svg.96dpi.png?raw=true)";
                textPreview.style.backgroundImage= "url(https://github.com/DeltaV-Station/Delta-v/blob/44413b0f7209d229e03a91ec6bf37f3260e1a467/Resources/Textures/Interface/Paper/paper_content_lined.svg.96dpi.png?raw=true)";
            }
        }

    function insertTag(tag) {
        console.log(tag);
        const startTag = `[${tag}]`;
        let strippedTag = tag.replace(/[^\a-zA-Z]/g, '');
        const endTag = `[/${strippedTag}]`;
        const { selectionStart, selectionEnd, value } = textInput;
        const selectedText = value.substring(selectionStart, selectionEnd);
        
    
        if (tag === 'bullet') {
            const newText = startTag + selectedText;
            textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
        }
        else {
            const newText = startTag + selectedText + endTag;
            textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
        }

        // Set caret position to directly after = sign if there is one, set to inside the tags otherwise
        let caretPosition;
        // Determine the new caret position
        const equalsIndex = startTag.indexOf('=');
        if (equalsIndex !== -1) {
            // Place the caret right after the '=' sign
            caretPosition = selectionStart + equalsIndex + 1;
        } else {
            // Place the caret after the closing tag
            caretPosition = selectionStart + startTag.length + selectedText.length + endTag.length;
        }
        // Update the input field and set focus
        textInput.focus();
        textInput.setSelectionRange(caretPosition, caretPosition);
        textPreview.innerHTML = parseText(textInput.value);
    }
});

/**
 * Tags taken in order from https://osu.ppy.sh/wiki/en/BBCode
 * @param {string} text
 * @returns {string}
 */
function parseText(text) {
    let parsedText = text;

    // Newlines
    parsedText = parsedText.replace(/\n/g, '<br>');
    //parsedText = parsedText.replace(/\[\/head]<br>/g, '[/head]');

    // Bold
    parsedText = parsedText.replace(/\[bold](.*?)\[\/bold]/gis, '<strong>$1</strong>');

    // Italic
    parsedText = parsedText.replace(/\[italic](.*?)\[\/italic]/gis, '<em>$1</em>');

    // Bolditalic
    parsedText = parsedText.replace(/\[bolditalic](.*?)\[\/bolditalic]/gis, '<b><em>$1</em></b>');

    // Headers
    parsedText = parsedText.replace(/\[head=1](.*?)\[\/head]/gis, '<span style="font-size:2em;font-weight:bold;line-height:.5">$1</span>');
    parsedText = parsedText.replace(/\[head=2](.*?)\[\/head]/gis, '<span style="font-size:1.5em;font-weight:bold;line-height:.5">$1</span>');
    parsedText = parsedText.replace(/\[head=3](.*?)\[\/head]/gis, '<span style="font-size:1.17em;font-weight:bold;line-height:.5">$1</span>');
     
    // Size
    parsedText = parsedText.replace(/\[size=(.*?)](.*?)\[\/size]/gis, function(match, p1, p2) {
        return '<span style="font-size:' + p1 + '%;">' + p2 + '</span>';
    });

    // Bullet
    parsedText = parsedText.replace(/\[bullet](.*?)/gis, '• $1');

    // Font size
    parsedText = parsedText.replace(/\[size=(.*?)](.*?)\[\/size]/gis, function(match, p1, p2) {
        return '<span style="font-size:' + p1 + '%;">' + p2 + '</span>';
    });

    // Color
    parsedText = parseColors(parsedText);

    return parsedText;
}

function parseColors(text) {
    let parsedText = "";
    const colorRegex = /\[color=(.*?)\]|\[\/color\]/gi; // Matches opening and closing tags
    const colorStack = [];

    let match;
    let lastIndex = 0;

    while ((match = colorRegex.exec(text))) {
        const matchText = match[0];
        const color = match[1];

        // Add the text before the tag to the parsed text
        parsedText += text.substring(lastIndex, match.index);
        lastIndex = match.index + matchText.length;

        if (color) { // Opening tag
            colorStack.push(color);
            parsedText += `<span style="color:${color}">`;
        } else if (colorStack.length > 0) { // Closing tag (only if stack is not empty)
            parsedText += "</span>";
            colorStack.pop();
        }
    }

    // Add any remaining text after the last tag
    parsedText += text.substring(lastIndex);

    // Close any remaining open spans (for unclosed tags)
    while (colorStack.length > 0) {
        parsedText += "</span>";
        colorStack.pop();
    }

    return parsedText;
}

function errorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

let boxCounters = {}

function parseBoxes(text) {
    const boxOpenRegex = /\[box=(.*?)]([\s\S]*)/i;
    const boxCloseRegex = /([\s\S]*?)\[\/box]/i;
    let match, matchNew, textNew;

    while (match = boxOpenRegex.exec(text)) {
        const boxName = match[1];
        !boxCounters[boxName] ? boxCounters[boxName] = 1 : boxCounters[boxName] += 1
        textNew = text.substring(0, match.index);

        matchNew = boxCloseRegex.exec(match[2]);

        try {
            const boxContent = matchNew[1];
            textNew += createBox(boxName, boxContent);
            textNew += text.substring(match.index + 6 + boxName.length + matchNew[0].length);

            text = textNew;
        } catch ({ name, message }) {
            errorMessage("An error occurred while parsing boxes. Please make sure all your boxes are terminated with a [/box] tag.");
            return text;
        }

    }
    boxCounters = {}
    return text;
}

function createBox(name, content) {
    content = content.replace(/^<br>/,"");
    content = content.replace(/<br>$/,"");
    const boxId = `box-${name.substring(0, 9)}-${boxCounters[name]}`;
    const isOpen = boxStates[boxId] === 'open';
    return `
        <div class="box" onclick="toggleBox('${boxId}', this)">
            <i class="fa-solid ${isOpen ? 'fa-angle-down' : 'fa-angle-right'} arrow"></i><strong>${name}</strong>
        </div>
        <div class="box-content" id="${boxId}" style="display: ${isOpen ? 'block' : 'none'};">
            ${content}
        </div>
    `;
}

const boxStates = {};

function toggleBox(boxId, element) {
    const boxContent = document.getElementById(boxId);
    const icon = element.querySelector('.arrow');
    const isOpen = boxContent.style.display === "block";

    if (!isOpen) {
        boxContent.style.display = "block";
        icon.classList.remove('fa-angle-right');
        icon.classList.add('fa-angle-down');
        boxStates[boxId] = 'open';
    } else {
        boxContent.style.display = "none";
        icon.classList.remove('fa-angle-down');
        icon.classList.add('fa-angle-right');
        boxStates[boxId] = 'closed';
    }
}
