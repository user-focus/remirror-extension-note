import React from "react";
import { UploadContext } from "@remirror/core";
import { NodeViewComponentProps } from "@remirror/react";

import type { NoteAttributes } from "./note-extension";

export type NoteComponentProps = NodeViewComponentProps & {
  context?: UploadContext;
  abort: () => void;
};

function openNote(url: string | undefined): void {
  // opens url in new tab
  window.open(url, "_blank");
}

const LabelSeperator = () => {
  return (
    <svg fill="none" height="6" width="5" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L.5 5.598V.402L5 3z" fill="#555" />
    </svg>
  )
}

export const NoteComponent: React.FC<NoteComponentProps> = ({ node }) => {
  const attrs = node.attrs as NoteAttributes;
  return (
    <div
      className="NOTE_ROOT"
      onClick={() => openNote(attrs.noteUrl)}
    >
      <div className="NOTE_LABELS_CONTAINER">
        {attrs.labels && Array.isArray(attrs.labels) && attrs.labels.map((label) => (
          <div className="NOTE_LABEL" key={label.id}>
            {label.parent && label.parent.length > 0 && label.parent.map((parent: any) => (
              <span key={parent.id}>{`${parent.text}`}<LabelSeperator /></span>
            ))}
            {label.text}
          </div>
        ))}
      </div>
      <p className="NOTE_TITLE">{attrs.title}</p>
      <p className="NOTE_DESCRIPTION">{attrs.description}</p>

      <div className="NOTE_FOOTER_WRAPPER">
        <p className="NOTE_CREATED_BY">{attrs.createdBy}</p>
        <div className="bullet"> </div>
        <p className="NOTE_CREATED_AT">{attrs.createdAt}</p>
        <div className="bullet"> </div>
        <p className="NOTE_INTERVIEW_NAME">Source: {attrs.interviewName}</p>
      </div>
    </div >
  );
};
