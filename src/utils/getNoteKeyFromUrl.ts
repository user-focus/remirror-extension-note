/**
 *
 * @param {string} noteUrl
 * @returns string
 */
export const getNoteKeyFromNoteUrl = (noteUrl:string = '') => {
  const noteKey = noteUrl.split('/annotation_tool/event/')[1] || '';
  if (noteKey.endsWith('/')) {
    return noteKey.slice(0, -1);
  }
  return noteKey;
};
