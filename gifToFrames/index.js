import { parseGif } from './gifParser.js';

const fileInput = document.getElementById('file');

// Listen for file selection
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        convertGifToArrayBuffer(file, (arrayBuffer) => {
            parseGif(arrayBuffer); 
        });
    } else {
        console.error('No file selected');
    }
});

// Function to read the file as ArrayBuffer and pass it to the callback
function convertGifToArrayBuffer(file, callback) {
    const reader = new FileReader();

    // Handle successful file reading
    reader.onload = function(e) {
        callback(e.target.result);  // Pass the ArrayBuffer to the callback
    };

    // Handle error during file reading
    reader.onerror = function(e) {
        console.error('Error reading file:', e);
    };

    reader.readAsArrayBuffer(file);  // Read the file as ArrayBuffer
}