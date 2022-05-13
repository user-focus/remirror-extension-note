import { INote } from "./typings";
import { NoteAttributes } from "../note-extension";

/* eslint-disable babel/camelcase */
export const getNoteExtensionObject = (
  updatedNoteObject: INote,
  previousNoteObject: NoteAttributes = {}
) => {
  if (typeof updatedNoteObject === "undefined" || updatedNoteObject === null)
    return null;
  const {
    title,
    comment,
    interview,
    created_at,
    created_by: createdBy,
    labels,
    id,
    end_time,
    start_time,
    subtitle,
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
      title,
      description: comment,
      duration: end_time - start_time,
      interviewName: interview?.name,
      createdAt: created_at,
      createdBy: createdBy?.first_name,
      labels,
      subtitle,
    };
  return null;
};
