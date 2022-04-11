import { ComponentType } from 'react';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  DOMCompatibleAttributes,
  extension,
  ExtensionPriority,
  ExtensionTag,
  getTextSelection,
  Handler,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeWithPosition,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorNode,
  Transaction,
  htmlToProsemirrorNode,
} from '@remirror/core';
import { NodeViewComponentProps } from '@remirror/react';
// import { PasteRule } from '@remirror/pm/paste-rules';
import type { CreateEventHandlers } from '@remirror/extension-events';

import { NoteComponent, NoteComponentProps } from './note-component';

export interface NoteOptions {
  render?: (props: NoteComponentProps) => React.ReactElement<HTMLElement> | null;

  /**
   * A regex test for the file type when users paste files.
   *
   * @default /^((?!image).)*$/i - Only match non-image files, as image files
   * will be handled by the `ImageExtension`.
   */
  pasteRuleRegexp?: RegExp;

  /**
   * Listen to click events for links.
   */
  onClick?: Handler<(event: MouseEvent, data: any) => boolean>;

  /**
   * Called after the `commands.deleteFile` has been called.
   */
  onDeleteFile?: Handler<(props: { tr: Transaction; pos: number; node: ProsemirrorNode }) => void>;
}

/**
 * Adds a file node to the editor
 */
@extension<NoteOptions>({
  defaultOptions: {
    render: NoteComponent,
    pasteRuleRegexp: /^((?!image).)*$/i,
  },
  handlerKeyOptions: { onClick: { earlyReturnValue: true } },
  handlerKeys: ['onDeleteFile', 'onClick'],
})
export class NoteExtension extends NodeExtension<NoteOptions> {
  get name() {
    return 'note' as const;
  }

  ReactComponent: ComponentType<NodeViewComponentProps> = (props) => {
    return this.options.render({ ...props, abort: () => { }, context: undefined });
  };

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        id: { default: null },
        interviewUrl: { default: '' },
        title: { default: '' },
        description: { default: '' },
        duration: { default: '' },
        interviewName: { default: '' },
        createdBy: { default: '' },
        createdAt: { default: '' },
        labels: { default: [] },
        noteUrl: { default: '' },
        error: { default: null },
      },
      selectable: true,
      draggable: true,
      atom: true,
      content: '',
      ...override,
      parseDOM: [
        {
          tag: 'div[data-note]',
          priority: ExtensionPriority.Low,
          getAttrs: (dom) => {
            const anchor = dom as HTMLAnchorElement;
            const id = anchor.getAttribute('data-id');
            const interviewUrl = anchor.getAttribute('data-interview-url');
            const title = anchor.getAttribute('data-title');
            const description = anchor.getAttribute('data-description');
            const duration = anchor.getAttribute('data-duration');
            const interviewName = anchor.getAttribute('data-interview-name');
            const createdBy = anchor.getAttribute('data-created-by');
            const createdAt = anchor.getAttribute('data-created-at');
            const labels = JSON.parse(anchor.getAttribute('data-labels') ?? '[]');
            const noteUrl = anchor.getAttribute('data-note-url');

            return {
              ...extra.parse(dom),
              id,
              interviewUrl,
              title,
              description,
              duration,
              interviewName,
              createdBy,
              createdAt,
              labels,
              noteUrl,
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { error, ...rest } = omitExtraAttributes(node.attrs, extra);
        const attrs: DOMCompatibleAttributes = {
          ...extra.dom(node),
          ...rest,
          'data-id': node.attrs.id,
          'data-interview-url': node.attrs.interviewUrl,
          'data-title': node.attrs.title,
          'data-description': node.attrs.description,
          'data-duration': node.attrs.duration,
          'data-interview-name': node.attrs.interviewName,
          'data-created-by': node.attrs.createdBy,
          'data-created-at': node.attrs.createdAt,
          'data-labels': JSON.stringify(node.attrs.labels),
          'data-note-url': node.attrs.noteUrl,
        };

        if (error) {
          attrs['data-error'] = error;
        }

        return ['div', attrs];
      },
    };
  }

  // createPasteRules(): PasteRule[] {
  //   return [
  //     {
  //       type: 'node',
  //       nodeType: this.type,
  //       regexp: this.options.pasteRuleRegexp
  //     },
  //   ];
  // }

  /**
   * Track click events passed through to the editor.
   */
  createEventHandlers(): CreateEventHandlers {
    return {
      click: (event, clickState) => {
        // Check if this is a direct click which must be the case for atom
        // nodes.
        if (!clickState.direct) {
          return;
        }

        // check if clicked on more options button
        const target = event.target as HTMLElement;
        const moreOptionsButton = target.closest('.more-options-container');
        const createClusterButton = target.closest('.create-cluster-button');
        if (moreOptionsButton || createClusterButton) {
          return;
        }

        const nodeWithPosition = clickState.getNode(this.type);
        const data = nodeWithPosition?.node.attrs;

        if (!nodeWithPosition) {
          return;
        }

        return this.options.onClick(event, data);
      },
    };
  }

  @command()
  insertNote(attributes: NoteAttributes, selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const node = this.type.create(attributes);

      dispatch?.(tr.replaceRangeWith(from, to, node));

      return true;
    };
  }

  @command()
  deleteFile(pos: number): CommandFunction {
    return ({ tr, state, dispatch }) => {
      const node = state.doc.nodeAt(pos);

      if (node && node.type === this.type) {
        tr.delete(pos, pos + 1);
        this.options.onDeleteFile({ tr, pos, node });
        dispatch?.(tr);
        return true;
      }

      return false;
    };
  }

  @command()
  convertToQuote(attributes: NoteAttributes, selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch, state }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const { id, subtitle, interviewName, noteUrl } = attributes;

      const node = htmlToProsemirrorNode({
        content: `<blockquote class="note-quote" id="note-quote-${id}">
          <p class="subtitle">${subtitle}</p>
          <p class="interview-name">Source: ${interviewName} - <a href="${noteUrl}" rel="noopener noreferrer nofollow" data-link-auto="">Open note</a></p>
        </blockquote>`,
        schema: state.schema,
      });
      dispatch?.(tr.replaceRangeWith(from, to, node));
      return true;
    };
  }

  @keyBinding({ shortcut: ['Backspace', 'Delete'] })
  backspaceShortcut(props: KeyBindingProps): boolean {
    const { tr, state } = props;
    const { from, to, empty } = tr.selection;

    if (!this.hasHandlers('onDeleteFile') || empty) {
      return false;
    }

    // Collect a list of files nodes contained within this delete range
    const onDeleteFileCallbacks: NodeWithPosition[] = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === this.type) {
        onDeleteFileCallbacks.push({ node, pos });
      }

      return true;
    });

    // Call the onDeleteFile callback for each file being deleted.
    onDeleteFileCallbacks.forEach(({ node, pos }) => {
      this.options.onDeleteFile({ tr, node, pos });
    });

    // Don't need to handle the delete ourselves, just the callbacks
    return false;
  }
}

export interface NoteAttributes {
  /**
   * Unique identifier for a note
   */
  id?: unknown;

  /**
   * URL where the clipping
   */
  interviewUrl?: string;

  /**
   * title of the note
   */
  title?: string;

  /**
   * description of the note
   * @default ''
   * @optional
   */
  description?: string;

  /**
   * duration of note
   */
  duration?: string;

  /**
   * name of the interview
   */
  interviewName?: string;

  createdAt?: string;

  createdBy?: string;

  labels?: any[];

  subtitle?: string;

  /**
   * URL where the note can be viewed
   * @default ''
   * @optional
   * @example /annotation_tool/event/c83282e7-a12e-4148-8382-d6a550fce7cb/
   */
  noteUrl?: string;

  /**
   * Error state for the file, e.g. upload failed
   */
  error?: string | null;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      note: NoteExtension;
    }
  }
}
