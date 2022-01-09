/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback } from 'react';
// import logo from './logo.svg';
import './App.css';

import NoteEditorComponent from 'typescript-react-test';

const DummyNoteObject = {
  id: null,
  url: 'https://app.heymarvin.com/annotation_tool/event/250a71fb-de29-44b2-bd9f-16c5e44f90bf/',
  title: 'What do you like the most?',
  description: 'People have been asking for a way to sort the order of playlist. This has been asked before this also.',
  duration: '1m 50s',
  interviewName: 'Talk with lattice',
  error: null,
};

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Drag and drop one or multiple non-image files into the editor.',
        },
      ],
    },
    {
      type: 'note',
      attrs: {
        id: null,
        url: 'https://app.heymarvin.com/annotation_tool/event/250a71fb-de29-44b2-bd9f-16c5e44f90bf/',
        title: 'What do you like the most?',
        description: 'People have been asking for a way to sort the order of playlist. This has been asked before this also.',
        duration: '1m 50s',
        interviewName: 'Talk with lattice',
        error: null,
      },
    },
  ],
};

function App() {
  return (
    <NoteEditorComponent />
  );
}

export default App;
