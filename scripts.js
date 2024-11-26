// Global variables to hold user's modification choices
let scale = 0.5;
let brightness = 1;
let contrast = 1;
let rotate = 0;

// HTML elements that hold the values
const scaleSlider = document.getElementById('scale');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const rotateDropdown = document.getElementById('rotate');

// -- CHANGE SLIDER VALUES --

// SCALE SLIDER
const scaleValue = document.getElementById('scaleValue');

scaleSlider.addEventListener('input', function() {
    scaleValue.innerText = scaleSlider.value;
});

// BRIGHTNESS SLIDER
const brightnessValue = document.getElementById('brightnessValue');

brightnessSlider.addEventListener('input', function() {
    brightnessValue.innerText = brightnessSlider.value;
});

// CONTRAST SLIDER
const contrastValue = document.getElementById('contrastValue');

contrastSlider.addEventListener('input', function() {
    contrastValue.innerText = contrastSlider.value;
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
 * Get a 2D array of brightness values from the image data
 * @param {ImageData} imgData - The image data object containing pixel color values
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {Array} - 2D array representing pixel brightness values
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

// Event listener for the Convert button
convertButton.addEventListener('click', function() {
    if (!uploadedFile) {
        alert("Please upload a file before clicking Convert.");
        return;
    }

    scale

    const reader = new FileReader(); // Initialize FileReader to read the image file
    reader.onload = function(e) {
        const img = new Image(); // Create a new image object
        img.onload = function() {
            const originalWidth = img.width;
            const originalHeight = img.height;

            // Set the new dimensions (half the original size)
            const newWidth = Math.floor(originalWidth / 2);
            const newHeight = Math.floor(originalHeight / 2);

            // Create a canvas to downscale the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the downscaled image onto the canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convert the image to grayscale
            const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
            for (let i = 0; i < imgData.data.length; i += 4) {
                const grayscale = (0.2126 * imgData.data[i]) + 
                                  (0.7152 * imgData.data[i + 1]) + 
                                  (0.0722 * imgData.data[i + 2]);

                imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = grayscale;
                // Alpha channel remains unchanged
            }

            // Get the pixel brightness data from the grayscale image
            const brightnessData = get2DArrayOfBrightness(imgData, newWidth, newHeight);

            // Convert the brightness data to ASCII characters
            const asciiArray = convertToAscii(brightnessData);

            // Display the ASCII art in the output container
            displayAsciiArray(asciiArray);

            // No need to display the image now
        };
        img.onerror = function() {
            alert("Failed to load image.");
        };
        img.src = e.target.result; // Set the image source to the uploaded file data
    };
    reader.readAsDataURL(uploadedFile); // Read the uploaded file as a data URL
});