function parseGif(arrayBuffer){
    // Check if the file is a gif
    if (!checkForGif(arrayBuffer)) {
        console.error('File is not a gif');
        return;
    }

    // Get the LSD (Logical Screen Descriptor) of the gif
}

function checkForGif(arrayBuffer) {
    // Get the first 6 bytes of the file
    const bytes = new Uint8Array(arrayBuffer).slice(0, 6);
    
    // Convert the bytes into a string 
    const header = String.fromCharCode(...bytes); /// the ... basically "spreads" the array into the specific elements
    
    // Check if the file is actually a gif
    if (header === 'GIF89a' || header === 'GIF87a') {
        return true;
    } else {
        return false;
    }
}

function getLogicalScreenDescriptor(arrayBuffer) {
    // Get the next 5 bytes of the file starting at byte 6 (LSD)
    const bytes = new Uint8Array(arrayBuffer).slice(6, 11);

    // Access the flags byte to check if the gif has a global color table
    const flagBites = bytes[4];
    const width = bytes[0] | (bytes[1] << 8); // Combine the first two bytes for width
    const height = bytes[2] | (bytes[3] << 8); // Combine the next two bytes for height
    const hasGlobalColorTable = (flagBites & 0x80) >> 7; // Global Color Table flag

    // Initialize colorCount to 0 in case the GIF does not have a Global Color Table
    let colorCount = 0;

    // If there is a Global Color Table
    if (hasGlobalColorTable) {
        const colorCountBytes = new Uint8Array(arrayBuffer).slice(11, 13); // Get the next 2 bytes
        const bites1 = colorCountBytes[0];
        const bites2 = colorCountBytes[1];

        const n = bites2 << 8 | bites1; // Combine the two bytes into a 16-bit number

        colorCount = 2 ** (n + 1); // Calculate the number of colors in the GCT
    }

    // Return the extracted information
    return {
        width,
        height,
        hasGlobalColorTable,
        colorCount
    };
}

function extractGlobalColorTable(arrayBuffer, colorCount){
    const lenghtInBytes = colorCount * 3; // 3 bytes per color
    const bytes = new Uint8Array(arrayBuffer).slice(13, 13 + lenghtInBytes); // Get the next n bytes
    let currentPixelIndex = 0;
    let globalColorTable = [];

    for (let i = 0; i < bytes.length; i += 3) {
        const r = bytes[i];
        const g = bytes[i + 1];
        const b = bytes[i + 2];

        // Create a new color object
        const color = {
            r,
            g,
            b
        };

        // Add the color to the globalColorTable
        globalColorTable.push(color);
    }
    return globalColorTable;
}