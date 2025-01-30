document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const textPreview = document.getElementById('text-preview');
    const errorMessageElement = document.getElementById('error-message');
    const toolbarButtons = document.querySelectorAll('.toolbar button');
    textPreview.innerHTML = parseText(textInput.value);
    const colorPicker = document.querySelector('.toolbar input[type="color"]');
    const colorPreview = document.querySelector('.toolbar .color-preview');
    const textField = document.getElementById('text-input'); // Get the text field

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

colorPicker.addEventListener("input", colorUpdaterPreview);
colorPicker.addEventListener("change", hexChanger);

let isColorTagPending = false; // Flag to track pending color tag insertion

    colorPicker.addEventListener("change", () => { // Trigger on color selection
        if (isColorTagPending && document.activeElement === textInput) {
            const hexColor = colorPicker.value;
            insertTag('color=', hexColor);
        }
        isColorTagPending = false; // Reset the flag
    });

function colorUpdaterPreview(event) {
    const chosenColor = event.target.value; // Get the hex code of the chosen color
    colorPreview.style.backgroundColor = chosenColor; 
    return chosenColor;
}


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
            selectElement.selectedIndex = 0;// Reset the dropdown to the hidden option
        }
    }

    window.changeBackgroundColor = function() {
        const selectElement = document.getElementById('background-select-select');
        const selectedValue = selectElement.value;
    
        if (selectedValue == "paper") {
            textInput.style.backgroundColor = "#ebebdb";
            textPreview.style.backgroundColor = "#ebebdb";
            textPreview.style.backgroundImage= '';
        }
        if (selectedValue == "book") {
                textInput.style.backgroundColor = "#d2cccc";
                textPreview.style.backgroundColor = "#d2cccc";
                textPreview.style.backgroundImage= '';
        }
        if (selectedValue == "office-paper") {
            textInput.style.backgroundColor = "#ffffff";
            textPreview.style.backgroundColor = "#ffffff";
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
        
        let caretPosition;
        let newText;
        const equalsIndex = startTag.indexOf('=');

        if (tag === 'bullet') {
            newText = startTag + selectedText;
            textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
            caretPosition = selectionStart + newText.length;
        } 
        else if (tag === 'color=') {
            const hexColor = colorPicker.value; // Get the hex color
            newText = `[color=${hexColor}]${selectedText}[/color]`;
            //textInput.setRangeText(hexColor);
            textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
            caretPosition = selectionStart + `[color=${hexColor}]`.length; // Position after the hex code
        }  else if (tag.startsWith('head=')) { // Corrected handling for head tags
            if (selectedText) {
                newText = startTag + selectedText + endTag;
            } else {
                newText = startTag + endTag;
            }
            textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
            caretPosition = selectionStart + startTag.length; // Correct caret position
        }   else {
            const equalsIndex = startTag.indexOf('=');
    
            if (selectedText) {
                newText = startTag + selectedText + endTag;
                textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
    
                if (equalsIndex !== -1) {
                    caretPosition = selectionStart + equalsIndex + 1;
                } else {
                    caretPosition = selectionStart + newText.length;
                }
            } else {
                newText = startTag + endTag;
                textInput.setRangeText(newText, selectionStart, selectionEnd, 'end');
    
                if (equalsIndex !== -1) {
                    caretPosition = selectionStart + equalsIndex + 1;
                } else {
                    caretPosition = selectionStart + startTag.length;
                }
            }
        }

        // Update the input field and set focus
        textInput.focus();
        textInput.setSelectionRange(caretPosition, caretPosition);
        textPreview.innerHTML = parseText(textInput.value);
    }
});

toolbarButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        if (tag) {
            insertTag(tag);
        }
    });
});

function hexChanger() {
    var hexColor = colorUpdaterPreview();
    alert(hexColor);
    console.log(`Chosen ALERT: ${hexColor}`); // Debug log
    textField.setRangeText(`Chosen ALERT: ${hexColor}`);
}

function parseText(text) {
    let parsedText = text.replace(/\n/g, '<br>');

    const tags = {
        bold: { open: '<strong>', close: '</strong>' },
        italic: { open: '<em>', close: '</em>' },
        bolditalic: { open: '<b><em>', close: '</em></b>' },
        head: {
            regex: /\[head=([0-9]+)](.*?)\[\/\s*head]/gis, // Match any number 0-9
            replace: (match, level, content) => {
                level = parseInt(level, 10); // Parse level as integer
                if (isNaN(level) || level < 1) {
                    level = 1; // Default to head=1 if invalid or less than 1
                } else if (level > 3) {
                    level = 3; // Cap at head=3 if greater than 3
                }
                return `<span style="font-size:${[2, 1.5, 1.17][level - 1]}em;font-weight:bold;line-height:.5">${content}</span>`;
            }
        },
        size: {
            regex: /\[size=(.*?)](.*?)\[\/size]/gis,
            replace: (match, p1, p2) => `<span style="font-size:${p1}%;">` + p2 + '</span>'
        },
        bullet: { regex: /\[bullet](.*?)/gis, replace: '• $1' },
    };

    // Apply simple replacements first (for tags with replace functions)
    for (const tagName in tags) {
        if (tags[tagName].replace && tags[tagName].regex) {
            parsedText = parsedText.replace(tags[tagName].regex, tags[tagName].replace);
        }
    }

    // Nested tag processing (for tags with open/close properties)
    const nestedTags = Object.keys(tags).filter(key => tags[key].open && key !== "color"); // Exclude color here
    const escapedNestedTags = nestedTags.map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    if (escapedNestedTags.length > 0) {
        const tagRegex = new RegExp(`\\[(${escapedNestedTags.join('|')})\\]|\\[\\/\\s*(${escapedNestedTags.join('|')})\\]`, 'gi');
        const tagStack = [];
        let lastIndex = 0;
        let tempParsed = "";
        let workingText = parsedText;

        while ((match = tagRegex.exec(workingText))) {
            const fullMatch = match[0];
            const openTag = match[1];
            const closeTag = match[2];

            tempParsed += workingText.substring(lastIndex, match.index);
            lastIndex = match.index + fullMatch.length;

            if (openTag) {
                tagStack.push(openTag);
                tempParsed += tags[openTag].open;
            } else if (closeTag) {
                const expectedOpenTag = tagStack.pop();
                if (expectedOpenTag === closeTag) {
                    tempParsed += tags[closeTag].close;
                } else {
                    if (expectedOpenTag) {
                        tempParsed += tags[expectedOpenTag].open;
                        tagStack.push(expectedOpenTag);
                    }
                    tempParsed += fullMatch;
                }
            }
        }

        tempParsed += workingText.substring(lastIndex);
        while (tagStack.length > 0) {
            const openTag = tagStack.pop();
            tempParsed += tags[openTag].close;
        }
        parsedText = tempParsed;
    }

    parsedText = parseColors(parsedText); // Call the original parseColors function

    return parsedText;
}

function parseColors(text) {
    let parsedText = "";
    const colorRegex = /\[color=(.*?)\]|\[\/color\]/gi;
    const colorStack = [];

    let match;
    let lastIndex = 0;

    while ((match = colorRegex.exec(text))) {
        const matchText = match[0];
        const color = match[1];

        parsedText += text.substring(lastIndex, match.index);
        lastIndex = match.index + matchText.length;

        if (color) {
            colorStack.push(color);
            parsedText += `<span style="color:${color}">`;
        } else if (colorStack.length > 0) {
            parsedText += "</span>";
            colorStack.pop();
        }
    }

    parsedText += text.substring(lastIndex);

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