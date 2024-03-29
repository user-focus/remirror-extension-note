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
  VariantDropdown?: any;
  Loader?: React.ComponentType<{}> | null;
  context?: UploadContext;
  abort: () => void;
  getCanEdit?: () => boolean;
  reportType?: string;
};

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
      .toggleHeading({ level: 4 }) // toggle the heading
      .run();
  };

  return (
    <Tippy placement="bottom" content={
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

export const NoteComponent: React.FC<NoteComponentProps> = ({ node, getPosition, getCanEdit, VariantDropdown }) => {
  const noteDetails = node.attrs as NoteAttributes;
  const { noteUrl = '' } = noteDetails;
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

  const copyNoteLink = useCallback(async () => {
    // copy to clipboard
    try {
      const key = noteDetails.key;
      const url = `${window.location.origin}/note/${key}/`;
      await navigator.clipboard.writeText(url);
      setCopyText('Copied!');
      setTimeout(() => {
        setCopyText('Copy note share link');
      }, 2000);
    } catch (err) {
      console.log('Failed to copy: ', err);
    }
  }, [noteDetails]);

  return (
    <div className={`NOTE_ROOT ${getCanEdit?.() ? 'NOTE_EDITABLE' : ''}`}>
      <a href={noteUrl} data-print-id="note-link" className="NOTE_LINK" />
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
          {noteDetails.fileType === 'VIDEO' && <VariantDropdown selectedVariant="text" onVariantSelect={onVariantSelect} />}
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

