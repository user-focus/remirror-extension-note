import React, { useState, useEffect, useRef } from "react";
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.40541" y="5.40541" width="16.1004" height="11.063" rx="0.970516" stroke="#FB3569" strokeWidth="0.810811" />
      <rect x="4.59827" y="8.23828" width="9.71493" height="0.848129" rx="0.424064" fill="#FB3569" />
      <rect x="4.59827" y="10.3975" width="9.71493" height="0.848129" rx="0.424064" fill="#FB3569" />
      <rect x="4.59827" y="12.5557" width="9.71493" height="0.848129" rx="0.424064" fill="#FB3569" />
      <circle cx="16" cy="14" r="7" fill="white" />
      <circle cx="16.0885" cy="13.9052" r="4.68337" fill="#FB3569" stroke="#FB3569" strokeWidth="0.810811" />
      <path d="M14.0947 11.7852L16.215 13.9055M16.215 13.9055L18.3354 16.0258M16.215 13.9055L18.3354 11.7852M16.215 13.9055L14.0947 16.0258" stroke="white" strokeWidth="0.810811" strokeLinecap="round" />
    </svg>
  )
}


export const NoteComponent: React.FC<NoteComponentProps> = ({ node, getPosition }) => {
  const attrs = node.attrs as NoteAttributes;
  const { labels, title, description, createdBy, createdAt, interviewName } = attrs;
  const { deleteFile } = useCommands();
  const position = getPosition as () => number;
  const [showDropdown, setShowDropdown] = useState(false);
  const menuContainer = useRef<HTMLDivElement>(null);

  const deleteNote = () => {
    deleteFile(position());
  };

  const toggleDropdownMenu = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainer.current !== null && e.target !== null && menuContainer.current.contains(e.target as Node)) {
        // inside click
        return;
      }
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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
        <div ref={menuContainer} className="more-options-container">
          <button className="more-options-button" onClick={toggleDropdownMenu}><MoreOptionsIcon /></button>
          {showDropdown && (
            <div className="dropdown-content">
              <button className="delete-note-button" onClick={deleteNote}><DeleteIcon />Remove from Insight</button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

