import React from "react";

import 'remirror/styles/all.css';

import { Remirror, useRemirror } from '@remirror/react';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CalloutExtension,
  DropCursorExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ItalicExtension, LinkExtension,
  NodeFormattingExtension,
  OrderedListExtension,
  TaskListExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import { NoteExtension } from "./note-extension";

const extensions = () => [
  new NoteExtension({}),
  new DropCursorExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new CalloutExtension(),
  new LinkExtension({ autoLink: true }),
  new UnderlineExtension(),
  new BlockquoteExtension(),
  new HorizontalRuleExtension(),
  new BulletListExtension(),
  new OrderedListExtension(),
  new TaskListExtension(),
  new ImageExtension({ enableResizing: true }),
  new NodeFormattingExtension(),
  new HeadingExtension(),
  // new PlaceholderExtension({ placeholder: `Type : to insert emojis` }),
];

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

export const NoteEditorComponent = () => {

  const { manager, state } = useRemirror({ extensions, content });
  // const { manager, state } = useRemirror({ content});


  return (
    <div className='remirror-theme'>
      This is editor component
      {/* the className is used to define css variables necessary for the editor */}
      <Remirror manager={manager} initialContent={state} />
    </div>
  );
};

