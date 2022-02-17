import React, { useState } from "react";
import { UploadContext } from "@remirror/core";
import { NodeViewComponentProps, useCommands } from "@remirror/react";

import type { NoteAttributes } from "./note-extension";

export type NoteComponentProps = NodeViewComponentProps & {
  context?: UploadContext;
  abort: () => void;
};

const LabelSeperator = () => {
  return (
    <svg fill="none" height="6" width="5" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L.5 5.598V.402L5 3z" fill="#555" />
    </svg>
  )
}

export const NoteComponent: React.FC<NoteComponentProps> = ({ node, getPosition }) => {
  const attrs = node.attrs as NoteAttributes;
  const { labels, title, description, createdBy, createdAt, interviewName } = attrs;
  const { deleteFile } = useCommands();
  const position = getPosition as () => number;
  const [showDropdown, setShowDropdown] = useState(false);

  const deleteNote = () => {
    deleteFile(position());
  };

  const toggleDropdownMenu = () => {
    setShowDropdown(!showDropdown);
  }

  return (
    <div className="NOTE_ROOT">
      <div className="NOTE_LABELS_CONTAINER">
        {labels && Array.isArray(labels) && labels.map((label) => (
          <div className="NOTE_LABEL" key={label.id}>
            {label.parent && label.parent.length > 0 && label.parent.map((parent: any) => (
              <span key={parent.id}>{`${parent.text}`}<LabelSeperator /></span>
            ))}
            {label.text}
          </div>
        ))}
      </div>
      {title && title.length > 0 && (
        <p className="NOTE_TITLE">{title}</p>
      )}
      {description && description.length > 0 && (
        <p className="NOTE_DESCRIPTION">{description}</p>
      )}

      <div className="NOTE_FOOTER_WRAPPER">
        <div>
          <p className="NOTE_CREATED_BY">{createdBy}</p>
          <div className="bullet"> </div>
          <p className="NOTE_CREATED_AT">{createdAt}</p>
          <div className="bullet"> </div>
          <p className="NOTE_INTERVIEW_NAME">Source: {interviewName}</p>
        </div>
        <div className="more-options-container">
          <button className="more-options-button" onClick={toggleDropdownMenu}><MoreOptionsIcon /></button>
          {showDropdown && (
            <div className="dropdown-content">
              <button onClick={deleteNote}><DeleteIcon />Remove from Insight</button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

const MoreOptionsIcon = () => {
  return (
    <svg width="3" height="15" viewBox="0 0 3 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#8C95A8" />
      <circle cx="1.5" cy="7.5" r="1.5" fill="#8C95A8" />
      <circle cx="1.5" cy="13.5" r="1.5" fill="#8C95A8" />
    </svg>
  );
}

const DeleteIcon = () => {
  return (
    <svg width="3" height="15" viewBox="0 0 3 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#8C95A8" />
      <circle cx="1.5" cy="7.5" r="1.5" fill="#8C95A8" />
      <circle cx="1.5" cy="13.5" r="1.5" fill="#8C95A8" />
    </svg>
  )
}
