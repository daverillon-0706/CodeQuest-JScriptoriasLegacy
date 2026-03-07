export function wrapText(text, maxChars = 100) {

    if (typeof text !== "string") {
        text = String(text ?? "");
    }

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

    return lines;
}