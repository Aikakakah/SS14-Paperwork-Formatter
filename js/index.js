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
            }
            if (selectedValue == "book") {
                textInput.style.backgroundColor = "#d2cccc";
                textPreview.style.backgroundColor = "#d2cccc";
            }
            if (selectedValue == "paper") {
                textInput.style.backgroundColor = "#ebebdb";
                textPreview.style.backgroundColor = "#ebebdb";
            }
            if (selectedValue == "office-paper") {
                textInput.style.backgroundColor = "#ffffff";
                textPreview.style.backgroundColor = "#ffffff";
            }
        }

    function insertTag(tag) {
        console.log(tag);
        const startTag = `[${tag}]`;
        let strippedTag = tag.replace(/[^\a-zA-Z]/g, '');
        const endTag = `[/${strippedTag}]`;
        const { selectionStart, selectionEnd, value } = textInput;
        const selectedText = value.substring(selectionStart, selectionEnd);

        // Set caret position to directly after = sign if there is one, set to inside the tags otherwise
        let caretPosition;
        if (tag.length === strippedTag.length + 1) {
            caretPosition = selectionStart + startTag.length - 1;
        } else {
            caretPosition = selectionStart + startTag.length;
        }
        const newText = startTag + selectedText + endTag;

        textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
        textInput.focus();
        textInput.setSelectionRange(caretPosition, caretPosition);
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
    parsedText = parsedText.replace(/\[head=1](.*?)\[\/head]/gis, '<span style="font-size:2em;font-weight:bold">$1</span>');
    parsedText = parsedText.replace(/\[head=2](.*?)\[\/head]/gis, '<span style="font-size:1.5em;font-weight:bold">$1</span>');
    parsedText = parsedText.replace(/\[head=3](.*?)\[\/head]/gis, '<span style="font-size:1.17em;font-weight:bold">$1</span>');
    
    // Size
    parsedText = parsedText.replace(/\[size=(.*?)](.*?)\[\/size]/gis, function(match, p1, p2) {
        return '<span style="font-size:' + p1 + '%;">' + p2 + '</span>';
    });

    // Bullet
    parsedText = parsedText.replace(/\[\/bullet](.*?)<br>/gis, '• $1');

    // Color
    parsedText = parsedText.replace(/\[color=(.*?)](.*?)\[\/color]/gis, '<span style="color:$1;">$2</span>');

    // Font size
    parsedText = parsedText.replace(/\[size=(.*?)](.*?)\[\/size]/gis, function(match, p1, p2) {
        return '<span style="font-size:' + p1 + '%;">' + p2 + '</span>';
    });

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
