/**
 *
 * @param {string} noteUrl
 * @returns string
 */
export const getNoteKeyFromNoteUrl = (noteUrl: string = "") => {
    let noteKey;
    if (noteUrl.includes("/annotation_tool/event/")) {
        noteKey = noteUrl.split("/annotation_tool/event/")[1] || "";
    } else if (noteUrl.includes("/note/")) {
        noteKey = noteUrl.split("/note/")[1] || "";
    }
    if (noteKey.endsWith("/")) {
        return noteKey.slice(0, -1);
    }
    return noteKey;
};
