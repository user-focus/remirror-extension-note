import React, { useCallback, useEffect, useRef, useState } from "react";
import { UploadContext } from "@remirror/core";
import { NodeViewComponentProps, useCommands, useChainedCommands } from "@remirror/react";

import type { NoteAttributes } from "./note-extension";
import { parseTime } from './parseTime';
import Tippy from '@tippyjs/react';

import { MoreOptionsIcon, DeleteIcon, ClusterIcon, ConvertToQuoteIcon } from "./icons";

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
    <Tippy content="Make cluster">
      <button className="create-cluster-button" onClick={createCluster}><ClusterIcon /></button>
    </Tippy>
  )
}

// const quoteString = `<blockquote style=""><p style="">Voluptatem Est velit nisi nostrud temporibus incidunt iure earum dolore autd</p><p style=""><br class="ProseMirror-trailingBreak"></p><p style="">Santosh Viswanatham - <a href="//www.google.com" rel="noopener noreferrer nofollow" data-link-auto="">www.google.com</a></p></blockquote>`;
// const quoteString = `<p>Hello world</p>`;
const ConvertToQuoteButton = (props: { position: () => number; id: any; noteUrl: string; subtitle: string; interviewName: string; }) => {
  // const chain = useChainedCommands();
  const { convertToQuote } = useCommands();
  const { position, id, noteUrl, subtitle, interviewName } = props;
  console.log(position());
  const handleConvertToQuote = () => {
    convertToQuote({
      id,
      subtitle: subtitle || 'Transcription unavailable.',
      interviewName,
      noteUrl
    }, position());
  }
  return (
    <button className="convert-to-quote-button" onClick={handleConvertToQuote}><ConvertToQuoteIcon />Convert note’s transcript to quote</button>
  )
}

export const NoteComponent: React.FC<NoteComponentProps> = ({ node, getPosition }) => {
  const attrs = node.attrs as NoteAttributes;
  const { noteUrl = '' } = attrs;
  const { deleteFile } = useCommands();
  const position = getPosition as () => number;
  const [showDropdown, setShowDropdown] = useState(false);
  const menuContainer = useRef<HTMLDivElement>(null);
  const [noteDetails, setNoteDetails] = useState<any>({});

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

  const getNoteDetails = useCallback(async () => {
    // get note details
    try {
      const response = await fetch(noteUrl.replace('event', 'notes'));
      const data: any[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setNoteDetails(data[0]);
      } else {
        deleteNote();
      }
    } catch (error) {
      console.error('Error while fetching note details', error);
    }
  }, [noteUrl]);

  useEffect(() => {
    getNoteDetails();
  }, [getNoteDetails]);

  return (
    <div className="NOTE_ROOT">
      {Object.keys(noteDetails).length > 0 ? (
        <>
          <ClusterButton position={position} />
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
          {noteDetails.comment && noteDetails.comment.length > 0 && (
            <p className="NOTE_DESCRIPTION">{noteDetails.comment}</p>
          )}

          <div className="NOTE_FOOTER_WRAPPER">
            <div>
              <p className="NOTE_CREATED_BY">{noteDetails?.created_by?.first_name}</p>
              <div className="bullet"> </div>
              <p className="NOTE_CREATED_AT">{parseTime(noteDetails.created_at)}</p>
              <div className="bullet"> </div>
              <p className="NOTE_INTERVIEW_NAME">Source: {noteDetails.interview.name}</p>
            </div>
            <div ref={menuContainer} className="more-options-container">
              <button className="more-options-button" onClick={toggleDropdownMenu}><MoreOptionsIcon /></button>
              {showDropdown && (
                <div className="dropdown-content">
                  <ConvertToQuoteButton
                    position={position}
                    id={noteDetails.id}
                    subtitle={noteDetails.subtitle}
                    interviewName={noteDetails.interview.name}
                    noteUrl={noteUrl} />
                  <button className="delete-note-button" onClick={deleteNote}><DeleteIcon />Remove from Insight</button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="shimmer loading-message"></p>
          <p className="shimmer loading-message"></p>
          <p className="shimmer loading-message loading-message-half"></p>
        </>
      )}
    </div >
  );
};

