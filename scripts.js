// --- HANDLE CUSTOM CHARACTER SET INPUT ---    
const customCharacterSetInput = document.getElementById('customCharacterSet'); // TEXT AREAs

let currentAddedLetter;
let userSet;
let letterCount;
let canSave = false; // bool to check if user can save their custom set

const main = document.getElementById('main');
const customCharacterSetContainer = document.getElementById('customCharacterSetContainer');
const saveButton = document.getElementById('saveCustomCharacterSet');
const xButton = document.getElementById('x');

customCharacterSetInput.addEventListener('input', function() {
    let userSet = customCharacterSetInput.value;
    let uniqueSet = '';

    for (let i = 0; i < userSet.length; i++) {
        if (!uniqueSet.includes(userSet[i]) && userSet[i] !== ' ') {
            uniqueSet += userSet[i];
        }
    }

    customCharacterSetInput.value = uniqueSet; // Update the input field with the unique characters
    let letterCount = uniqueSet.length;

    if (letterCount < 2){
        canSave = false;
        saveButton.innerText = 'At least 2 characters are required to save.';
        saveButton.classList.remove('canSave');
    }
    else {
        canSave = true;
        saveButton.innerText = 'Save';
        saveButton.classList.add('canSave');
    }
});

xButton.addEventListener('click', function() {
    main.classList.remove('fade');
    customCharacterSetContainer.classList.remove('active');
    characterSetDropdown.value = 'classic';
    characterSet = '@%#*+=-:. ';
    if (firstRender) renderAscii = true;
});

saveButton.addEventListener('click', function(){
    if (!canSave) return;
    characterSet = customCharacterSetInput.value;
    main.classList.remove('fade');
    customCharacterSetContainer.classList.remove('active');
    characterSetDropdown.value = 'custom';
    if (firstRender) renderAscii = true;
});

// Global variables to hold user's modification choices
let scale = 0.5;
let brightness = 1;
let contrast = 1;
let invertionBool = false;
let rotate = 0;
let renderAscii = false;
let firstRender = false; // Variable to check if it's the first render
let characterSet = '@%#*+=-:. '; // Variable to hold the character set
let userCharacterSetChoice = 'classic'; // hold the choice of the user
let width = 1;
let height = 1;

// HTML elements that hold the values
const scaleSlider = document.getElementById('scale');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const widthSlider = document.getElementById('widthMultiplier');
const heightSlider = document.getElementById('heightMultiplier');
const rotateDropdown = document.getElementById('rotate');
const invertCheckbox = document.getElementById('inverted');
const characterSetDropdown = document.getElementById('characterSet');

// -- CHANGE SLIDER VALUES --

// SCALE SLIDER
const scaleValue = document.getElementById('scaleValue');

scaleSlider.addEventListener('input', function() {
    scaleValue.innerText = scaleSlider.value;
    scale = scaleSlider.value; // Update the global scale variable
    if (firstRender) renderAscii = true;
});

// BRIGHTNESS SLIDER
const brightnessValue = document.getElementById('brightnessValue');

brightnessSlider.addEventListener('input', function() {
    brightnessValue.innerText = brightnessSlider.value;
    brightness = brightnessSlider.value; // Update the global brightness variable
    if (firstRender) renderAscii = true;
});

// WIDTH SLIDER
const widthValue = document.getElementById('widthValue');

widthSlider.addEventListener('input', function() {
    widthValue.innerText = widthSlider.value;
    width = widthSlider.value; // Update the global width variable
    if (firstRender) renderAscii = true;
});

// HEIGHT SLIDER
const heightValue = document.getElementById('heightValue');

heightSlider.addEventListener('input', function() {
    heightValue.innerText = heightSlider.value;
    height = heightSlider.value; // Update the global height variable
    if (firstRender) renderAscii = true;
});

// CONTRAST SLIDER
const contrastValue = document.getElementById('contrastValue');

contrastSlider.addEventListener('input', function() {
    contrastValue.innerText = contrastSlider.value;
    contrast = contrastSlider.value; // Update the global contrast variable
    if (firstRender) renderAscii = true;
});

// ROTATE DROPDOWN
const rotateValue = document.getElementById('rotateValue');

rotateDropdown.addEventListener('change', function() {
    rotate = rotateDropdown.value; // Update the global rotate variable
    if (firstRender) renderAscii = true;
});

// INVERT CHECKBOX
const invertValue = document.getElementById('invertValue');

invertCheckbox.addEventListener('change', function() {
    invertionBool = invertCheckbox.checked; // Update the global invertionBool variable
    if (firstRender) renderAscii = true;
});

// CHARACTER SET DROPDOWN
const characterSetValue = document.getElementById('characterSetValue');

// listen for changes in the dropdown
characterSetDropdown.addEventListener('change', function() {
    // based on what the user clicks on, set the character set
    switch (characterSetDropdown.value){
        case 'classic':
            characterSet = '@%#*+=-:. ';
            break;
        case 'binary':
            characterSet = '10 ';
            break;
        case 'gradient':
            characterSet = '█▓▒░';
            break;
        case 'dense':
            characterSet = '@#$%&8BWM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^.';
            break;
        case 'stylized':
            characterSet = '█▇▆▅▄▃▂▁';
            break;
        case 'custom':
            customCharacterSetContainer.classList.add('active');
            main.classList.add('fade');
            break
        default:
            characterSet = '@%#*+=-:. ';
            break;
    }
    if (firstRender) renderAscii = true; // only re-render if the user has already pressed the convert button
});

// Capture input elements
const fileInput = document.getElementById('file'); // File input element
const convertButton = document.getElementById('convert'); // Convert button
const outputContainer = document.getElementById('ascii'); // Output container for displaying ASCII art
const fileLabel = document.getElementById('fileLabel'); // Label to display the file name

let uploadedFile = null; // Stores the uploaded file for processing

// Get the elements to show/hide when a file is uploaded
const notAddedFile = document.getElementById('notAddedFile');
const downloadButton = document.getElementById('download');
const clipboardButton = document.getElementById('clipboard');

function handleImage(blob, name){
    if (!blob || !blob.type.startsWith('image/')) {
        // Remove 'active' class with a slight delay to sync transitions
        setTimeout(function() {
            convertButton.classList.remove('active');
            notAddedFile.classList.remove('active');
            downloadButton.classList.remove('active');
            clipboardButton.classList.remove('active');
            outputContainer.innerText = ''; // Clear the output container
            downloadButton.innerHTML = 'Convert a file to download!';
            convertButton.innerHTML = 'Add a file to convert!';
            clipboardButton.innerHTML = 'Convert a file to copy into cliboard!';
            fileLabel.innerText = 'SELECT A FILE';

        }, 10); // Small delay to trigger transitions together
        console.error('Invalid file type. Please upload an image file.');
        return;
    }
    else{
        const fileName = name;
        // Add 'active' class with a slight delay to sync transitions
        setTimeout(function() {
            fileLabel.innerText = fileName;
            convertButton.classList.add('active');
            notAddedFile.classList.add('active');
            convertButton.innerHTML = 'Convert!';
        }, 10); // Small delay to trigger transitions
    }

    return blob;
}

document.addEventListener('paste', function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const name = blob.name || 'Pasted Image'; // Assign a default name if not available
            blob.name = name; 
            uploadedFile = handleImage(blob, name);
        }
    }
});

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const name = file.name || 'Uploaded Image'; // Use the file name or a default name
    uploadedFile = handleImage(file, name);
});

/**
 * Convert a brightness value to ASCII character
 * @param {number} brightness - The brightness value of a pixel (0-255)
 * @param {Array} characterSet - The set of characters to choose from
 * @returns {string} - The corresponding ASCII character for the brightness
 */
function brightnessToCharacter(brightness, characterSet){
    let index = Math.round(brightness / 255 * (characterSet.length - 1));
    return characterSet[index];
}

/**
 * Converts image data to a 2D array of brightness values.
 *
 * @param {ImageData} imgData - The image data object containing pixel data.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @returns {number[][]} A 2D array where each element represents the brightness of a pixel.
 */
function get2DArrayOfBrightness(imgData, width, height) {
    let brightnessData = [];
    let pixelIndex = 0;

    // Loop through the pixels to extract brightness data
    for (let row = 0; row < height; row++) { // iterate through rows
        let rowData = [];
        for (let col = 0; col < width; col++) { // iterate through columns
            const grayScaleBrightness = imgData.data[pixelIndex]; // Grayscale brightness (R = G = B)
            rowData.push(grayScaleBrightness); // Add brightness value to row data
            pixelIndex += 4; // Move to the next pixel (RGBA)
        }
        brightnessData.push(rowData); // Add row data to brightness data array
    }

    return brightnessData;
}

/**
 * Modifies the brightness of the given brightness data by a specified brightness value.
 *
 * @param {number[][]} brightnessData - A 2D array representing the brightness values of an image.
 * @param {number} brightnessValue - The value by which to modify the brightness. 
 *                                    Values greater than 1 will increase brightness, 
 *                                    values between 0 and 1 will decrease brightness.
 * @returns {number[][]} A new 2D array with the modified brightness values, clamped between 0 and 255.
 */
function modifyBrightness(brightnessData, brightnessValue) {
    let newBrightnessData = [];

    for (let row = 0; row < brightnessData.length; row++) {
        let newBrightnessRow = [];
        for (let col = 0; col < brightnessData[row].length; col++) {
            let newBrightness = brightnessData[row][col] * brightnessValue;
            newBrightness = Math.min(255, Math.max(0, newBrightness)); // Clamp the value between 0 and 255
            newBrightnessRow.push(newBrightness);
        }
        newBrightnessData.push(newBrightnessRow);
    }

    return newBrightnessData;   
}

/**
 * Modifies the contrast of a given grayscale image data.
 *
 * @param {number[][]} imageData - A 2D array representing the grayscale values of the image.
 * @param {number} contrastValue - The contrast adjustment value. Values > 1 increase contrast, values < 1 decrease contrast.
 * @returns {number[][]} A new 2D array with the contrast-adjusted grayscale values.
 */
function modifyContrast(imageData, contrastValue) {
    let newContrastData = [];
    const midpoint = 128; // midpoint for grayscale images

    for (let row = 0; row < imageData.length; row++) {
        let newContrastRow = [];
        for (let col = 0; col < imageData[row].length; col++) {
            let newContrast = midpoint + (imageData[row][col] - midpoint) * contrastValue; // formula for contrast
            newContrast = Math.min(255, Math.max(0, newContrast)); // Clamp the value between 0 and 255
            newContrastRow.push(newContrast);
        }
        newContrastData.push(newContrastRow);
    } 
    return newContrastData;
}

/*
 * Inverts the colors of the given image data if the invertionBool is true.
 *
 * @param {ImageData} imageData - The image data to be inverted.
 * @param {boolean} invertionBool - A boolean indicating whether to invert the image data.
 * @returns {ImageData} The modified image data with inverted colors if invertionBool is true.
 */
function invert(imageData, invertionBool) {
    if (invertionBool) { // if checked, invert the image data
        for (let pixelIndex = 0; pixelIndex < imageData.data.length; pixelIndex += 4) {
            imageData.data[pixelIndex] = 255 - imageData.data[pixelIndex];     // Red
            imageData.data[pixelIndex + 1] = 255 - imageData.data[pixelIndex + 1]; // Green
            imageData.data[pixelIndex + 2] = 255 - imageData.data[pixelIndex + 2]; // Blue
            // Alpha channel remains unchanged
        }
    }
    return imageData; // Return the modified imageData
}

/**
 * Rotates the canvas and draws the image at the specified angle.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the drawing surface of the canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas element to be rotated.
 * @param {HTMLImageElement} img - The image to be drawn on the rotated canvas.
 * @param {number} angle - The angle in degrees to rotate the canvas (e.g., 90, 180, 270).
 * @param {number} newWidth - The new width of the canvas after rotation.
 * @param {number} newHeight - The new height of the canvas after rotation.
 */
function rotateCanvas(ctx, canvas, img, angle, newWidth, newHeight) {
    // Adjust canvas size based on rotation
    if (angle === 90 || angle === 270) {
        canvas.width = newHeight;
        canvas.height = newWidth;
    } else {
        canvas.width = newWidth;
        canvas.height = newHeight;
    }

    // Set the canvas origin point to the center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2); // Move the origin to the center of the canvas

    // Rotate the canvas based on the angle in degrees (convert to radians)
    ctx.rotate((angle * Math.PI) / 180); // Convert degrees to radians

    // Draw the image on the rotated canvas
    ctx.drawImage(img, -newWidth / 2, -newHeight / 2, newWidth, newHeight);

    // Reset canvas transformation (so that future drawings aren't affected by rotation)
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Resets transformation matrix
}

/**
 * Convert 2D array of brightness values to ASCII characters
 * @param {Array} brightnessData - 2D array containing pixel brightness values
 * @returns {Array} - 2D array of ASCII characters representing the image
 */
function convertToAscii(brightnessData, characterSet){
    let asciiData = [];

    // Loop through the brightness data and convert to ASCII characters
    for (let row = 0; row < brightnessData.length; row++){ 
        let asciiRow = [];
        for (let col = 0; col < brightnessData[row].length; col++){ 
            const asciiChar = brightnessToCharacter(brightnessData[row][col], characterSet); // Get ASCII for brightness
            asciiRow.push(asciiChar); // Add the ASCII character to the row
        }
        asciiData.push(asciiRow); // Add the row of ASCII characters to the main data
    }

    return asciiData;
}

/**
 * Display the ASCII array as text inside the output container
 * @param {Array} asciiArray - The 2D array of ASCII characters to display
 */
function displayAsciiArray(asciiArray) {
    let asciiArt = asciiArray.map(row => row.join('')).join('\n'); // Join each row into a string and combine all rows
    outputContainer.innerText = asciiArt; // Set the ASCII art as the inner text of the container
}

/**
 * Converts an uploaded image file to ASCII art and displays it.
 * 
 * This function performs the following steps:
 * 1. Checks if a file has been uploaded.
 * 2. Reads the uploaded file using FileReader.
 * 3. Loads the image and scales it based on user input.
 * 4. Rotates the canvas if needed.
 * 5. Inverts the image colors if required.
 * 6. Converts the image to grayscale.
 * 7. Converts the grayscale image data to a 2D brightness array.
 * 8. Modifies the brightness and contrast of the image.
 * 9. Converts the brightness data to ASCII characters.
 * 10. Displays the resulting ASCII art in the output container.
 * 
 * @function makeTheAscii
 * @returns {void}
 */
function makeTheAscii() {
    if (!uploadedFile) {
        alert("Please upload a file before clicking Convert.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const originalWidth = img.width;
            const originalHeight = img.height;

            // Scale the image based on the user's scale choice
            const newWidth = Math.floor(originalWidth * (scale / 3) * width);
            const newHeight = Math.floor(originalHeight * (scale / 3) * height);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Call the rotate function
            rotateCanvas(ctx, canvas, img, rotate, newWidth, newHeight);

            // Get the image data after drawing the rotated image
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Apply inversion if needed
            imgData = invert(imgData, invertionBool);

            // Convert to grayscale
            for (let i = 0; i < imgData.data.length; i += 4) {
                const grayscale = (0.2126 * imgData.data[i]) + 
                                  (0.7152 * imgData.data[i + 1]) + 
                                  (0.0722 * imgData.data[i + 2]);

                imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = grayscale;
            }

            // Convert image data to 2D brightness array
            let modifiedImageData = get2DArrayOfBrightness(imgData, canvas.width, canvas.height);

            // Apply user-selected brightness and contrast modifications
            modifiedImageData = modifyBrightness(modifiedImageData, brightness);
            modifiedImageData = modifyContrast(modifiedImageData, contrast);

            // Convert brightness data to ASCII characters
            const asciiArray = convertToAscii(modifiedImageData, characterSet);

            // Display the ASCII art in the output container
            displayAsciiArray(asciiArray);
        };

        img.onerror = function() {
            alert("Failed to load image.");
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(uploadedFile);
}

/**
 * Downloads the content of the converted image as a text file.
 * The content is saved in a file named 'ascii.txt'.
 */
function downloadAsciiFile() {
    // Get the content from the <pre> tag
    const preContent = document.getElementById('ascii').textContent;

    // Create a Blob from the preformatted content
    const blob = new Blob([preContent], { type: 'text/plain' });

    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'ascii.txt'; // Name of the file to be downloaded

    // Programmatically click the link to trigger the download
    downloadLink.click();
}

function copyToClipboard() {
    // Get the content of the <pre> tag
    const preContent = document.getElementById('ascii').textContent;

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(preContent)
        .then(() => {
            // Success message
            alert('Content copied to clipboard!');
        })
        .catch(err => {
            // Handle errors, if any
            console.error('Failed to copy:', err);
            alert('Failed to copy content. Please try again.');
        });
}

// Event listener for the Convert button
convertButton.addEventListener('click', function() {
    renderAscii = true;
    if (!firstRender) firstRender = true;
    downloadButton.classList.add('active');
    downloadButton.innerHTML = 'Download ASCII! (.txt)';
    clipboardButton.classList.add('active');
    clipboardButton.innerHTML = 'Copy to Clipboard!';
});

downloadButton.addEventListener('click', downloadAsciiFile); // IF you click the button, download the converted image to ascii as txt
clipboardButton.addEventListener('click', copyToClipboard); // IF you click the button, copy the converted image to ascii to clipboard

// "Render loop"
function renderLoop() {
    if (renderAscii) {
        makeTheAscii();
        renderAscii = false;
    }
    requestAnimationFrame(renderLoop);
}

// Start the render loop
requestAnimationFrame(renderLoop);