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
            img.onload = function (event) {
                // Dynamically create a canvas element
                let canvas = document.createElement("canvas");

                // let canvas = document.getElementById("canvas");
                let ctx = canvas.getContext("2d");

                // Actual resizing
                img.width = 300;
                img.height = 150;
                ctx.drawImage(img, 0, 0, 300, 150);

                // Show resized image in preview element
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