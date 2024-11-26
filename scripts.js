// Capture input elements
const fileInput = document.getElementById('file'); // File input element
const convertButton = document.getElementById('convert'); // Convert button
const outputContainer = document.getElementById('ascii'); // Output container for displaying the downscaled image

let uploadedFile = null; // Stores the uploaded file for processing

// Event listener to capture the uploaded file
fileInput.addEventListener('change', function(event) {
    uploadedFile = event.target.files[0]; // Get the selected file
    if (!uploadedFile) {
        alert("No file selected. Please upload an image.");
        return;
    }
    console.log('File selected:', uploadedFile.name);
});

// Event listener for the Convert button
convertButton.addEventListener('click', function() {
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
            ctx.putImageData(imgData, 0, 0);

            // Generate the downscaled image as a data URL
            const dataUrl = canvas.toDataURL('image/png');

            // Display the resulting image in the "ascii" container
            outputContainer.innerHTML = ''; // Clear previous content
            const resultImg = document.createElement('img');
            resultImg.src = dataUrl;
            outputContainer.appendChild(resultImg);
        };
        img.src = e.target.result; // Set the image source to the uploaded file data
    };
    reader.readAsDataURL(uploadedFile); // Read the uploaded file as a data URL
});