import React from "react";
import { UploadContext } from "@remirror/core";
import { NodeViewComponentProps } from "@remirror/react";

import type { NoteAttributes } from "./note-extension";

export type NoteComponentProps = NodeViewComponentProps & {
  context?: UploadContext;
  abort: () => void;
};

// function openNote(url: string | undefined): void {
//   // opens url in new tab
//   window.open(url, "_blank");
// }

export const NoteComponent: React.FC<NoteComponentProps> = ({ node }) => {
  const attrs = node.attrs as NoteAttributes;
  return (
    <div
      className="NOTE_ROOT"
    // onClick={() => openNote(attrs.url)}
    >
      <p className="NOTE_TITLE">{attrs.title}</p>
      <p className="NOTE_DESCRIPTION">{attrs.description}</p>

      <div className="NOTE_FOOTER_WRAPPER">
        <p className="NOTE_DURATION">{attrs.duration}</p>
        <p className="NOTE_INTERVIEW_NAME">
          {attrs.interviewName}
        </p>
      </div>
    </div>
  );
};
