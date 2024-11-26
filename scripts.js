// Global variables to hold user's modification choices
let scale = 0.5;
let brightness = 1;
let contrast = 1;
let invertionBool = false;
let rotate = 0;
let renderAscii = false;

// HTML elements that hold the values
const scaleSlider = document.getElementById('scale');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const rotateDropdown = document.getElementById('rotate');
const invertCheckbox = document.getElementById('inverted');

// -- CHANGE SLIDER VALUES --

// SCALE SLIDER
const scaleValue = document.getElementById('scaleValue');

scaleSlider.addEventListener('input', function() {
    scaleValue.innerText = scaleSlider.value;
    scale = scaleSlider.value; // Update the global scale variable`
    renderAscii = true;
});

// BRIGHTNESS SLIDER
const brightnessValue = document.getElementById('brightnessValue');

brightnessSlider.addEventListener('input', function() {
    brightnessValue.innerText = brightnessSlider.value;
    brightness = brightnessSlider.value; // Update the global brightness variable
    renderAscii = true;
});

// CONTRAST SLIDER
const contrastValue = document.getElementById('contrastValue');

contrastSlider.addEventListener('input', function() {
    contrastValue.innerText = contrastSlider.value;
    contrast = contrastSlider.value; // Update the global contrast variable
    renderAscii = true;
});

// ROTATE DROPDOWN
const rotateValue = document.getElementById('rotateValue');

rotateDropdown.addEventListener('change', function() {
    rotateValue.innerText = rotateDropdown.value;
    rotate = rotateDropdown.value; // Update the global rotate variable
    renderAscii = true;
});

// INVERT CHECKBOX
const invertValue = document.getElementById('invertValue');

invertCheckbox.addEventListener('change', function() {
    invertionBool = invertCheckbox.checked; // Update the global invertionBool variable
    renderAscii = true;
});

// Capture input elements
const fileInput = document.getElementById('file'); // File input element
const convertButton = document.getElementById('convert'); // Convert button
const outputContainer = document.getElementById('ascii'); // Output container for displaying ASCII art

let uploadedFile = null; // Stores the uploaded file for processing

/**
 * Event listener to capture the uploaded file
 */
fileInput.addEventListener('change', function(event) {
    uploadedFile = event.target.files[0]; // Get the selected file
    if (!uploadedFile) {
        alert("No file selected. Please upload an image.");
        return;
    }
    console.log('File selected:', uploadedFile.name);
});

/**
 * Convert brightness values to ASCII characters
 * @param {number} brightness - The brightness value of a pixel (0-255)
 * @returns {string} - The corresponding ASCII character for the brightness
 */
function returnAsciiFromBrightness(brightness){
    let ascii;

    if (brightness >= 0 && brightness <= 25){
        ascii = '@';
    }
    else if (brightness >= 26 && brightness <= 50){
        ascii = '%';
    }
    else if (brightness >= 51 && brightness <= 75){
        ascii = '#';
    }
    else if (brightness >= 76 && brightness <= 100){
        ascii = '*';
    }
    else if (brightness >= 101 && brightness <= 125){
        ascii = '+';
    }
    else if (brightness >= 126 && brightness <= 150){
        ascii = '=';
    }
    else if (brightness >= 151 && brightness <= 175){
        ascii = '-';
    }
    else if (brightness >= 176 && brightness <= 200){
        ascii = ':';
    }
    else if (brightness >= 201 && brightness <= 225){
        ascii = '.';
    }
    else {
        ascii = ' ';
    }

    return ascii;
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

/**
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
 * Convert 2D array of brightness values to ASCII characters
 * @param {Array} brightnessData - 2D array containing pixel brightness values
 * @returns {Array} - 2D array of ASCII characters representing the image
 */
function convertToAscii(brightnessData){
    let asciiData = [];

    // Loop through the brightness data and convert to ASCII characters
    for (let row = 0; row < brightnessData.length; row++){ 
        let asciiRow = [];
        for (let col = 0; col < brightnessData[row].length; col++){ 
            const asciiChar = returnAsciiFromBrightness(brightnessData[row][col]); // Get ASCII for brightness
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

function makeTheAscii(){
    if (!uploadedFile) {
        alert("Please upload a file before clicking Convert.");
        return;
    }

    const reader = new FileReader(); // Initialize FileReader to read the image file
    reader.onload = function(e) {
        const img = new Image(); // Create a new image object
        img.onload = function() {
            const originalWidth = img.width;
            const originalHeight = img.height;

            const newWidth = Math.floor(originalWidth / (1 / scale));
            const newHeight = Math.floor(originalHeight / (1 / scale));

            // Create a canvas to downscale the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the downscaled image onto the canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convert the image to grayscale
            let imgData = ctx.getImageData(0, 0, newWidth, newHeight);

            // Invert the image data if the user wants to
            imgData = invert(imgData, invertionBool);

            // Convert the image to grayscale
            for (let i = 0; i < imgData.data.length; i += 4) {
                const grayscale = (0.2126 * imgData.data[i]) + 
                                  (0.7152 * imgData.data[i + 1]) + 
                                  (0.0722 * imgData.data[i + 2]);

                imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = grayscale;
                // Alpha channel remains unchanged
            }

            // Get the pixel brightness data from the grayscale image
            let modifiedImageData = get2DArrayOfBrightness(imgData, newWidth, newHeight);

            // Add the user brightness modification
            modifiedImageData = modifyBrightness(modifiedImageData, brightness);

            // Add the user contrast modification
            modifiedImageData = modifyContrast(modifiedImageData, contrast);

            // Convert the brightness data to ASCII characters
            const asciiArray = convertToAscii(modifiedImageData);

            // Display the ASCII art in the output container
            displayAsciiArray(asciiArray);
        };
        img.onerror = function() {
            alert("Failed to load image.");
        };
        img.src = e.target.result; // Set the image source to the uploaded file data
    };
    reader.readAsDataURL(uploadedFile); // Read the uploaded file as a data URL
}

// Event listener for the Convert button
convertButton.addEventListener('click', function() {
    renderAscii = true;
});

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