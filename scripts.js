/**
 * Converts an image to grayscale.
 *
 * @param {HTMLImageElement} img - The image element to be converted.
 * @param {HTMLCanvasElement} canvas - The canvas element where the image will be drawn.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the drawing surface of the canvas.
 * @returns {ImageData} The ImageData object containing the grayscale image data.
 */
function convertImageToGrayscale(img, canvas, ctx){
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
        let grayscale = (0.2126 * imgData.data[i]) + 
                        (0.7152 * imgData.data[i + 1]) + 
                        (0.0722 * imgData.data[i + 2]);

        imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = grayscale;
        imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    return imgData;
}

// capture the image input by user

const fileInput = document.getElementById('file');
const convertButton = document.getElementById('convert');
let fileAdded = false; // bool to check if it was added or not
let file; // file that the user inputs

// event listener to check for a change (e.g. if a user inputs a file)
fileInput.addEventListener('change', function(event) {
    file = event.target.files[0];
    // set the fileAdded flag to true
    if (file) {
        fileAdded = true;
    }
    else {
        fileAdded = false;
    }
});

// what happens after the user clicks on the convert button
convertButton.addEventListener('click', function() {
    // check if a file has been added, if it wasn't, alert the user
    if (fileAdded){
        let reader = new FileReader();
        reader.onload = function (e) {
            let img = document.createElement("img");
            img.onload = function () {
                // Dynamically create a canvas element
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");

                // Set canvas dimensions
                canvas.width = 300;
                canvas.height = 150;    

                // Actual resizing
                img.width = 300;
                img.height = 150;

                convertImageToGrayscale(img, canvas, ctx);
                let dataurl = canvas.toDataURL(file.type);
                document.getElementById("ascii").src = dataurl;
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    else{
        alert("Select a file before proceeding!");
    }
});