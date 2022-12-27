import { INote } from "./typings";
import { NoteAttributes } from "../note-extension";

/* eslint-disable babel/camelcase */
/**
 * Get note object as expected by extension from
 * the note object in db
 * 
 * @param updatedNoteObject - db note object
 * @param previousNoteObject - previous attributes of the note object
 * @returns 
 */
export const getNoteExtensionObject = (
  updatedNoteObject: INote,
  previousNoteObject: NoteAttributes = {}
) => {
  if (typeof updatedNoteObject === "undefined" || updatedNoteObject === null)
    return null;
  const {
    name,
    description,
    interview,
    created_at,
    labels,
    event_class: id,
    end_time,
    start_time,
    subtitle,
    wav,
    author,
    thumbnail_url
  } = updatedNoteObject;
  if (
    typeof previousNoteObject === "object" &&
    !Array.isArray(previousNoteObject) &&
    previousNoteObject !== null
  )
    return {
      ...previousNoteObject,
      id,
      interviewUrl: interview?.url,
      title: name,
      description,
      duration: end_time - start_time,
      interviewName: wav?.name,
      createdAt: created_at,
      createdBy: author,
      labels,
      subtitle,
      wavUrl: wav?.file,
      fileType: wav?.file_type,
      interviewLength: wav?.interview_length,
      startTime: start_time,
      endTime: end_time,
      thumbnailUrl: thumbnail_url
    };
  return null;
};
