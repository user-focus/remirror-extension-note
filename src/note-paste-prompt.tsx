import React from 'react'

interface INotePastePrompt { 
  noteUrl: string;
  handleInsertNote: () => void;
  handleRevertClick: () => void;
 }

export const NotePastePrompt:React.FC<INotePastePrompt> = ({noteUrl, handleInsertNote, handleRevertClick}) => {
  return (
    <div className="NOTE_LOADING_CONTAINER">
      <div className="NOTE_REPLACE_INFO">
        <a className="NOTE_INFO_LINK" href={noteUrl} rel="noopener noreferrer" target="_blank">
          {noteUrl}
        </a>
        <p>Looks like a link to a note. Do you want to insert a note ?</p>
      </div>
      <div className="NOTE_REPLACE_ACTIONS">
        <button onClick={handleInsertNote} className="NOTE_REPLACE_PRIMARY">Yes</button>
        <button onClick={handleRevertClick} className="NOTE_REPLACE_SECONDARY">No</button>
      </div>
    </div>
  )
}
