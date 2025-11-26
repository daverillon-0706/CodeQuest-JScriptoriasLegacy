export function wrapText(text, maxChars = 50) {
    const words = text.split(" ");
    let currentLine = "";
    let lines = [];

    for (let word of words) {
        if ((currentLine + word).length > maxChars) {
            lines.push(currentLine.trim());
            currentLine = "";
        }
        currentLine += word + " ";
    }

    if (currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
    }

    return lines;  // <-- now returns array of lines
}
