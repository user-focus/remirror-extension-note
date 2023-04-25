import React, { useCallback, useEffect, useRef, useState } from "react";
import { UploadContext } from "@remirror/core";
import { NodeViewComponentProps, useCommands, useChainedCommands } from "@remirror/react";

import type { NoteAttributes } from "./note-extension";
import { parseTime } from './utils/parseTime';
import Tippy from '@tippyjs/react';

import { MoreOptionsIcon, DeleteIcon, ClusterIcon, ConvertToQuoteIcon } from "./icons";
import { CopyLinkIcon } from "./icons/CopyLinkIcon";

export type NoteComponentProps = NodeViewComponentProps & {
  variantComponents?: Record<string, React.ComponentType<NoteComponentProps>>;
  VariantDropdown?:  any;
  Loader?: React.ComponentType<{}> | null;
  context?: UploadContext;
  abort: () => void;
  isEditable?: boolean;
  reportType?: string;
};

const LabelSeperator = () => {
  return (
    <svg fill="none" height="6" width="5" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L.5 5.598V.402L5 3z" fill="#555" />
    </svg>
  )
}

const DEFAULT_CLUSTER_TITLE = 'Untitled cluster';

const ClusterButton = (props: { position: () => number; }) => {
  const chain = useChainedCommands();
  const { position } = props;

  const createCluster = () => {
    chain
      .focus(position()) // focus on the note
      .toggleCallout({ type: 'blank' }) // add the note to the callout
      .insertText(DEFAULT_CLUSTER_TITLE) // insert the title
      .selectText({
        from: position() + 1,
        to: position() + DEFAULT_CLUSTER_TITLE.length + 2
      }) // select the title
      .run();
  };

  return (
    <Tippy  placement="bottom" content={
      <span className="note-tooltip">Make cluster</span>
    } >
      <button className="more-options-button create-cluster-button" onClick={createCluster}>
        <ClusterIcon />
      </button>
    </Tippy>
  )
}

const ConvertToQuoteButton = (props: { position: () => number; id: any; noteUrl: string; subtitle?: string; interviewName?: string; }) => {
  const chain = useChainedCommands();
  const { position, id, noteUrl, subtitle, interviewName } = props;
  const handleConvertToQuote = () => {
    const subtitleText = subtitle || 'Transcription unavailable.';
    chain
      .convertToQuote({
        id,
        subtitle: subtitleText,
        interviewName,
        noteUrl
      }, position())
      .focus(position() + subtitleText.length + 2) // focus at end of quote
      .run();
  }
  return (
    <Tippy placement="bottom" content={
      <span className="note-tooltip">Convert note’s transcript to quote</span>
    } >
      <button className="more-options-button convert-to-quote-button" onClick={handleConvertToQuote}>
        <ConvertToQuoteIcon />
      </button>
    </Tippy>
  )
}

export const NoteComponent: React.FC<NoteComponentProps> = ({ node, getPosition, isEditable, VariantDropdown }) => {
  const noteDetails = node.attrs as NoteAttributes;
  const { noteUrl = ''} = noteDetails;
  const { deleteFile, updateVariant } = useCommands();
  const position = getPosition as () => number;
  const [showDropdown, setShowDropdown] = useState(false);
  const menuContainer = useRef<HTMLDivElement>(null);
  const [copyText, setCopyText] = useState('Copy note link');

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

  const onVariantSelect = useCallback((variant: string) => {
    updateVariant(position(), variant);
  }, [updateVariant, position]);

  const copyNoteLink = useCallback(() => {
    // copy to clipboard
    const key = noteDetails.key;
    const url = `${window.location.origin}/note/${key}/`;
    navigator.clipboard.writeText(url);
    setCopyText('Copied!');
    setTimeout(() => {
      setCopyText('Copy note share link');
    }, 2000);
    }, [noteDetails]);

  return (
    <div className={`NOTE_ROOT ${ isEditable ? 'NOTE_EDITABLE' : '' }`}>
      <a href={noteUrl} data-print-id="note-link" className="NOTE_LINK" />
      <div className="NOTE_LABELS_CONTAINER">
        {noteDetails.labels && Array.isArray(noteDetails.labels) && noteDetails.labels.map((label: any) => (
          <div className="NOTE_LABEL" key={label.id}>
            {label.parent && label.parent.length > 0 && label.parent.map((parent: any) => (
              <span key={parent.id}>{`${parent.text}`}<LabelSeperator /></span>
            ))}
            {label.text}
          </div>
        ))}
      </div>
      {noteDetails.title && noteDetails.title.length > 0 && (
        <p className="NOTE_TITLE">{noteDetails.title}</p>
      )}
      {noteDetails.description && noteDetails.description.length > 0 && (
        <p className="NOTE_DESCRIPTION">{noteDetails.description}</p>
      )}

      <div className="NOTE_FOOTER_WRAPPER">
        <div>
          <p className="NOTE_CREATED_BY">{noteDetails?.createdBy}</p>
          <div className="bullet"> </div>
          <p className="NOTE_CREATED_AT">{parseTime(noteDetails?.createdAt)}</p>
          <div className="bullet"> </div>
          <p className="NOTE_INTERVIEW_NAME">Source: {noteDetails.interviewName}</p>
        </div>
        <div ref={menuContainer} className="more-options-container">
          <ClusterButton position={position} />
          <ConvertToQuoteButton
            position={position}
            id={noteDetails.id}
            subtitle={noteDetails.subtitle}
            interviewName={noteDetails.interviewName}
            noteUrl={noteUrl} />
          <VariantDropdown selectedVariant="text" onVariantSelect={onVariantSelect}/>
          <button className="more-options-button" onClick={toggleDropdownMenu}><MoreOptionsIcon /></button>
          {showDropdown && (
            <div className="dropdown-content">
              <button className="copy-note-button" onClick={copyNoteLink}><CopyLinkIcon />{copyText}</button>
              <button className="delete-note-button" onClick={deleteNote}><DeleteIcon />Remove from Insight</button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

