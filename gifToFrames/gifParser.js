/**
 * Parses a GIF file from an ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @returns {Object} The parsed GIF data.
 * @throws {Error} If the file is not a valid GIF.
 */
export function parseGif(arrayBuffer) {
  if (!checkForGif(arrayBuffer)) {
    throw new Error("Not a valid GIF");
  }

  // Parse logical screen descriptor
  const logicalScreenDescriptor = getLogicalScreenDescriptor(arrayBuffer);

  let { globalColorTable, nextByteIndex } = logicalScreenDescriptor.hasGlobalColorTable
    ? extractGlobalColorTable(arrayBuffer, logicalScreenDescriptor.colorCount)
    : { globalColorTable: null, nextByteIndex: 13 };

  const frames = [];
  const comments = [];
  const plainTexts = [];

  let currentFrame = null;

  while (nextByteIndex < arrayBuffer.byteLength) {
    const { byteType, nextByteIndex: updatedIndex, rawData } = readCurrentByte(arrayBuffer, nextByteIndex);

    console.log(`Processing byte type: ${byteType} at index: ${nextByteIndex}`);

    switch (byteType) {
      case "GraphicControlExtension": {
        const gceData = extractGCEData(arrayBuffer, nextByteIndex);
        nextByteIndex = gceData.nextByteIndex;
        currentFrame = { gceData };
        break;
      }

      case "ImageDescriptor": {
        const imageDescriptor = extractImageDescriptor(arrayBuffer, nextByteIndex);

        let localColorTable = null;
        if (imageDescriptor.imageFlags.localColorTableFlag) {
          const lctData = extractLCT(arrayBuffer, imageDescriptor.imageFlags.localColorTableSize, imageDescriptor.nextByteIndex);
          localColorTable = lctData.colors;
          nextByteIndex = lctData.nextByteIndex;
        } else {
          nextByteIndex = imageDescriptor.nextByteIndex;
        }

        const imageDataBlock = extractImageDataBlock(arrayBuffer, nextByteIndex);
        if (currentFrame) {
          currentFrame.imageDescriptor = imageDescriptor;
          if (!globalColorTable) currentFrame.localColorTable = localColorTable;
          currentFrame.imageDataBlock = imageDataBlock;
          frames.push(currentFrame);
          currentFrame = null;
        } else {
          frames.push({ imageDescriptor, localColorTable, imageDataBlock });
        }
        nextByteIndex = imageDataBlock.nextByteIndex;
        break;
      }

      case "CommentExtension": {
        const commentData = extractCommentExtensionData(arrayBuffer, nextByteIndex);
        comments.push(commentData.comment);
        nextByteIndex = commentData.nextByteIndex;
        break;
      }

      case "PlainTextExtension": {
        const plainTextData = extractPlainTextData(arrayBuffer, nextByteIndex);
        plainTexts.push(plainTextData);
        nextByteIndex = plainTextData.nextByteIndex;
        break;
      }

      case "ApplicationExtension": {
        const appData = extractApplicationExtensionData(arrayBuffer, nextByteIndex);
        nextByteIndex = appData.nextByteIndex;
        break;
      }

      case "Trailer": {
        console.log("End of GIF file");
        console.log("Frames:", frames.length);
        console.log("Comments:", comments.length);
        console.log("Plain texts:", plainTexts.length);
        console.log("Frame data:", frames);
        console.log("Comment data:", comments);
        console.log("Plain text data:", plainTexts);
        // End of GIF file
        return {
          logicalScreenDescriptor,
          globalColorTable,
          frames,
          comments,
          plainTexts,
        };
      }

      default: {
        // Handle unknown or unexpected block types gracefully
        if (rawData) {
          console.warn(`Unknown block type: 0x${rawData[0].toString(16)}`);
        }
        nextByteIndex = updatedIndex;
        break;
      }
    }
  }

  return {
    logicalScreenDescriptor,
    globalColorTable,
    frames,
    comments,
    plainTexts,
  };
};

/**
 * Checks if the ArrayBuffer contains a valid GIF header.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @returns {boolean} True if the header is valid, false otherwise.
 */
function checkForGif(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer, 0, 6);
  const header = String.fromCharCode(...bytes);
  console.log("Header:", header);
  return header === "GIF89a";
}

/**
 * Extracts the logical screen descriptor from the GIF data.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @returns {Object} The logical screen descriptor.
 */
function getLogicalScreenDescriptor(arrayBuffer) {
  const bytes = new DataView(arrayBuffer, 6, 7);
  const width = bytes.getUint16(0, true);
  const height = bytes.getUint16(2, true);
  const flagBites = bytes.getUint8(4);
  const hasGlobalColorTable = (flagBites & 0x80) >> 7;
  const colorCount = hasGlobalColorTable ? 2 ** ((flagBites & 0x07) + 1) : 0;

  console.log(`Width: ${width}, Height: ${height}, Global color table: ${hasGlobalColorTable}, Color count: ${colorCount}`);

  return {
    width,
    height,
    hasGlobalColorTable,
    colorCount,
  };
}

/**
 * Extracts the global color table from the GIF data.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} colorCount - The number of colors in the global color table.
 * @returns {Object} The global color table and the next byte index.
 */
function extractGlobalColorTable(arrayBuffer, colorCount) {
  const lengthInBytes = colorCount * 3;
  const bytes = new Uint8Array(arrayBuffer, 13, lengthInBytes);
  const globalColorTable = [];

  for (let i = 0; i < bytes.length; i += 3) {
    globalColorTable.push({
      r: bytes[i],
      g: bytes[i + 1],
      b: bytes[i + 2],
    });
  }

  console.log(`Global color table data: ${globalColorTable}`);

  return {
    globalColorTable,
    nextByteIndex: 13 + lengthInBytes,
  };
}

/**
 * Reads the current byte and determines the block type.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} nextByteIndex - The current byte index.
 * @returns {Object} The block type and the next byte index.
 */
function readCurrentByte(arrayBuffer, nextByteIndex) {
  if (nextByteIndex < 0 || nextByteIndex >= arrayBuffer.byteLength) {
    throw new Error("Index out of bounds");
  }

  const byte = new Uint8Array(arrayBuffer, nextByteIndex, 1)[0];

  switch (byte) {
    case 0x3b:
      return { byteType: "Trailer", nextByteIndex: nextByteIndex + 1 };
    case 0x21:
      const extensionByte = new Uint8Array(arrayBuffer, nextByteIndex + 1, 1)[0];
      switch (extensionByte) {
        case 0xf9:
          return { byteType: "GraphicControlExtension", nextByteIndex: nextByteIndex + 8 };
        case 0xff:
          return { byteType: "ApplicationExtension", nextByteIndex: nextByteIndex + 3 };
        case 0xfe:
          return { byteType: "CommentExtension", nextByteIndex: nextByteIndex + 2 };
        case 0x01:
          return { byteType: "PlainTextExtension", nextByteIndex: nextByteIndex + 2 };
        default:
          return { byteType: "UnknownExtension", nextByteIndex: nextByteIndex + 1 };
      }
    case 0x2c:
      return { byteType: "ImageDescriptor", nextByteIndex: nextByteIndex + 10 };
    default:
      return { byteType: "Unknown", nextByteIndex: nextByteIndex + 1, rawData: [byte] };
  }
}

/**
 * Extracts the Graphic Control Extension (GCE) data from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The GCE data and the next byte index.
 */
function extractGCEData(arrayBuffer, readingStart) {
  const bytes = new Uint8Array(arrayBuffer, readingStart, 8);
  if (bytes[0] !== 0x21 || bytes[1] !== 0xf9) {
    throw new Error("Invalid GCE data");
  }

  const flags = bytes[3];
  const transparentColorIndex = bytes[4];
  const delayTime = bytes[5] | (bytes[6] << 8);
  const isTransparent = (flags & 0x04) !== 0;
  const disposalMethod = (flags & 0x70) >> 4;

  console.log(`Disposal method: ${disposalMethod}, Delay time: ${delayTime}, Transparent color index: ${transparentColorIndex}`);

  return {
    byteType: "GraphicControlExtension",
    isTransparent,
    disposalMethod,
    delayTime,
    transparentColorIndex,
    nextByteIndex: readingStart + 8,
  };
}

/**
 * Extracts the Application Extension data from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The Application Extension data and the next byte index.
 */
function extractApplicationExtensionData(arrayBuffer, readingStart) {
  const bytes = new Uint8Array(arrayBuffer, readingStart, 19);
  if (bytes[0] !== 0x21 || bytes[1] !== 0xff) {
    throw new Error("Invalid Application Extension data");
  }

  const blockSize = bytes[2];
  if (blockSize !== 11) {
    throw new Error("Invalid Application Extension block size");
  }

  const applicationIdentifier = String.fromCharCode(...bytes.slice(3, 11));
  const applicationAuthenticationCode = String.fromCharCode(...bytes.slice(11, 14));

  let subBlockStart = readingStart + 14;
  let subBlockSize = bytes[14];
  const subBlockData = [];

  while (subBlockSize !== 0x00) {
    subBlockStart++;
    subBlockData.push(...new Uint8Array(arrayBuffer, subBlockStart, subBlockSize));
    subBlockStart += subBlockSize;
    subBlockSize = new Uint8Array(arrayBuffer, subBlockStart, 1)[0];
  }

  console.log(`Application identifier: ${applicationIdentifier}, Authentication code: ${applicationAuthenticationCode}`);

  return {
    byteType: "ApplicationExtension",
    applicationIdentifier,
    applicationAuthenticationCode,
    subBlockData,
    nextByteIndex: subBlockStart + 1,
  };
}

/**
 * Extracts the Comment Extension data from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The Comment Extension data and the next byte index.
 */
function extractCommentExtensionData(arrayBuffer, readingStart) {
  const bytes = new Uint8Array(arrayBuffer, readingStart);
  if (bytes[0] !== 0x21 || bytes[1] !== 0xfe) {
    throw new Error("Invalid Comment Extension data");
  }

  let comment = "";
  let subBlockStart = readingStart + 2;
  let subBlockSize = bytes[subBlockStart];

  while (subBlockSize !== 0x00) {
    subBlockStart++;
    const subBlockData = bytes.slice(subBlockStart, subBlockStart + subBlockSize);
    comment += String.fromCharCode(...subBlockData);
    subBlockStart += subBlockSize;
    subBlockSize = bytes[subBlockStart];
  }

  console.log(`Comment: ${comment}`);

  return {
    byteType: "CommentExtension",
    comment,
    nextByteIndex: subBlockStart + 1,
  };
}

/**
 * Extracts the Plain Text Extension data from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The Plain Text Extension data and the next byte index.
 */
function extractPlainTextData(arrayBuffer, readingStart) {
  const bytes = new Uint8Array(arrayBuffer, readingStart);
  if (bytes[0] !== 0x21 || bytes[1] !== 0x01) {
    throw new Error("Invalid Plain Text data");
  }

  if (bytes[2] !== 0x0C) {
    throw new Error("Invalid Plain Text block size");
  }

  const metadataBytes = new DataView(arrayBuffer, readingStart + 3, 12);
  const leftPosition = metadataBytes.getUint16(0, true);
  const topPosition = metadataBytes.getUint16(2, true);
  const textGridWidth = metadataBytes.getUint16(4, true);
  const textGridHeight = metadataBytes.getUint16(6, true);
  const characterCellWidth = metadataBytes.getUint8(8);
  const characterCellHeight = metadataBytes.getUint8(9);
  const textForegroundColorIndex = metadataBytes.getUint8(10);
  const textBackgroundColorIndex = metadataBytes.getUint8(11);

  const metadata = {
    leftPosition,
    topPosition,
    textGridWidth,
    textGridHeight,
    characterCellWidth,
    characterCellHeight,
    textForegroundColorIndex,
    textBackgroundColorIndex,
  };

  let subBlockStart = readingStart + 15;
  let subBlockSize = bytes[subBlockStart];
  let text = "";

  while (subBlockSize !== 0x00) {
    subBlockStart++;
    const subBlockData = bytes.slice(subBlockStart, subBlockStart + subBlockSize);
    text += String.fromCharCode(...subBlockData);
    subBlockStart += subBlockSize;
    subBlockSize = bytes[subBlockStart];
  }

  console.log(`Text: ${text}, Metadata: ${metadata}`);

  return {
    byteType: "PlainTextExtension",
    metadata,
    text,
    nextByteIndex: subBlockStart + 1,
  };
}

/**
 * Extracts the Image Descriptor data from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The Image Descriptor data and the next byte index.
 */
function extractImageDescriptor(arrayBuffer, readingStart) {
  const bytes = new DataView(arrayBuffer, readingStart, 10);
  if (bytes.getUint8(0) !== 0x2c) {
    throw new Error("Invalid Image Descriptor data");
  }

  const imageLeftPosition = bytes.getUint16(1, true);
  const imageTopPosition = bytes.getUint16(3, true);
  const imageWidth = bytes.getUint16(5, true);
  const imageHeight = bytes.getUint16(7, true);
  const flags = bytes.getUint8(9);

  const localColorTableFlag = (flags & 0x80) >> 7;
  const interlaceFlag = (flags & 0x40) >> 6;
  const sortFlag = (flags & 0x20) >> 5;
  const localColorTableSize = localColorTableFlag ? (flags & 0x07) : 0;

  const imageFlags = {
    localColorTableFlag,
    interlaceFlag,
    sortFlag,
    localColorTableSize,
  };

  console.log(`Image left position: ${imageLeftPosition}, Image top position: ${imageTopPosition}, Image width: ${imageWidth}, Image height: ${imageHeight}, Flags: ${JSON.stringify(imageFlags)}`);

  return {
    byteType: "ImageDescriptor",
    imageLeftPosition,
    imageTopPosition,
    imageWidth,
    imageHeight,
    imageFlags,
    nextByteIndex: readingStart + 10,
  };
}

/**
 * Extracts the Local Color Table (LCT) from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} lctSize - The size of the local color table.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The LCT colors and the next byte index.
 */
function extractLCT(arrayBuffer, lctSize, readingStart) {
  const lctSizeInBytes = 3 * (2 ** (lctSize + 1));
  
  // Check if the lctSizeInBytes is valid
  if (lctSizeInBytes <= 0 || lctSizeInBytes > arrayBuffer.byteLength - readingStart) {
    throw new Error(`Invalid LCT size: ${lctSizeInBytes}`);
  }

  const lctBytes = new Uint8Array(arrayBuffer, readingStart, lctSizeInBytes);
  const colors = [];

  for (let i = 0; i < lctSizeInBytes; i += 3) {
    colors.push({ r: lctBytes[i], g: lctBytes[i + 1], b: lctBytes[i + 2] });
  }

  console.log(`Local color table data: ${colors}`);

  return {
    colors,
    nextByteIndex: readingStart + lctSizeInBytes,
  };
}

/**
 * Extracts the Image Data Block from the GIF.
 * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer containing the GIF data.
 * @param {number} readingStart - The starting byte index.
 * @returns {Object} The Image Data Block and the next byte index.
 */
function extractImageDataBlock(arrayBuffer, readingStart) {
  const lzwMinimumCodeSize = new DataView(arrayBuffer, readingStart, 1).getUint8(0);
  let subBlockStart = readingStart + 1;
  let subBlockSize = new DataView(arrayBuffer, subBlockStart, 1).getUint8(0);
  const imageData = [];

  while (subBlockSize !== 0x00) {
    subBlockStart++;
    const subBlockData = new Uint8Array(arrayBuffer, subBlockStart, subBlockSize);
    imageData.push(...subBlockData);
    subBlockStart += subBlockSize;
    subBlockSize = new DataView(arrayBuffer, subBlockStart, 1).getUint8(0);
  }

  console.log(`LZW minimum code size: ${lzwMinimumCodeSize}, Image data: ${imageData}`);

  return {
    byteType: "imageDataBlock",
    lzwMinimumCodeSize,
    imageData,
    nextByteIndex: subBlockStart + 1,
  };
}