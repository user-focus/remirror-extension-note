import React, { ComponentType } from "react";
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
} from "@remirror/core";
import { NodeViewComponentProps } from "@remirror/react";
// import { PasteRule } from '@remirror/pm/paste-rules';
import type { CreateEventHandlers } from "@remirror/extension-events";

import { NoteComponentProps } from "./note-component";
import { getNoteExtensionObject } from "./utils/getNoteExtensionObject";
import { INote } from "./utils/typings";
import { VariantRenderer } from "./variant-renderer";
import { NodePasteRule } from "@remirror/pm/paste-rules";
import { NodeSelection } from "@remirror/pm/state";

export type VariantDropdownProps = {
    onVariantSelect: (variant: string) => void;
};

export interface NoteOptions {
    /**
     * variants - an object of variants to render
     * @default {}
     * @remarks
     * This is an object of variants to render. The key is the variant name, and the value is a React component.
     * The component will receive the following props:
     **/
    variantComponents?: Record<string, ComponentType<NoteComponentProps>>;
    VariantDropdown?: ComponentType<VariantDropdownProps> | null;
    Loader?: React.ComponentType<{}> | null;
    render?: (
        props: NoteComponentProps
    ) => React.ReactElement<HTMLElement> | null;

    createNode?: boolean;
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
    onDeleteFile?: Handler<
        (props: { tr: Transaction; pos: number; node: ProsemirrorNode }) => void
    >;
    /**
     * Function to check if the note is editable
     */
    getCanEdit?: () => boolean;

    /**
     * Report type
     */
    reportType?: string;
}

/**
 * Adds a file node to the editor
 */
@extension<NoteOptions>({
    defaultOptions: {
        variantComponents: {},
        VariantDropdown: null,
        Loader: null,
        render: VariantRenderer,
        createNode: false,
        getCanEdit: () => true,
        pasteRuleRegexp: /^((?!image).)*$/i,
        reportType: "",
    },
    handlerKeyOptions: { onClick: { earlyReturnValue: true } },
    handlerKeys: ["onDeleteFile", "onClick"],
    staticKeys: [],
    customHandlerKeys: [],
})
export class NoteExtension extends NodeExtension<NoteOptions> {
    get name() {
        return "note" as const;
    }

    ReactComponent: ComponentType<NodeViewComponentProps> = (props) => {
        return this.options.render({
            ...props,
            VariantDropdown: this.options.VariantDropdown,
            Loader: this.options.Loader,
            variantComponents: this.options.variantComponents,
            abort: () => { },
            context: undefined,
            getCanEdit: this.options.getCanEdit,
            reportType: this.options.reportType,
        });
    };

    createTags() {
        return [ExtensionTag.Block];
    }

    createNodeSpec(
        extra: ApplySchemaAttributes,
        override: NodeSpecOverride
    ): NodeExtensionSpec {
        return {
            attrs: {
                ...extra.defaults(),
                id: { default: null },
                interviewUrl: { default: "" },
                title: { default: "" },
                description: { default: "" },
                duration: { default: "" },
                interviewName: { default: "" },
                createdBy: { default: "" },
                createdAt: { default: "" },
                labels: { default: [] },
                noteUrl: { default: "" },
                error: { default: null },
                subtitle: { default: "" },
                variant: { default: "default" },
                wavUrl: { default: "" },
                interviewLength: { default: null },
                startTime: { default: null },
                endTime: { default: null },
                fileType: { default: null },
                thumbnailUrl: { default: null },
                wavId: { default: null },
                color: { default: "" },
                createNode: { default: false },
                key: { default: null },
            },
            selectable: true,
            draggable: this.options.getCanEdit?.(),
            atom: true,
            content: "",
            ...override,
            parseDOM: [
                {
                    tag: "div[data-note]",
                    priority: ExtensionPriority.Low,
                    getAttrs: (dom) => {
                        const anchor = dom as HTMLAnchorElement;
                        const id = anchor.getAttribute("data-id");
                        const interviewUrl =
                            anchor.getAttribute("data-interview-url");
                        const title = anchor.getAttribute("data-title");
                        const description =
                            anchor.getAttribute("data-description");
                        const duration = anchor.getAttribute("data-duration");
                        const interviewName = anchor.getAttribute(
                            "data-interview-name"
                        );
                        const createdBy =
                            anchor.getAttribute("data-created-by");
                        const createdAt =
                            anchor.getAttribute("data-created-at");
                        const labels = JSON.parse(
                            anchor.getAttribute("data-labels") ?? "[]"
                        );
                        const noteUrl = anchor.getAttribute("data-note-url");
                        const variant = anchor.getAttribute("data-variant");
                        const wavUrl = anchor.getAttribute("data-wav-url");
                        const interviewLength = anchor.getAttribute(
                            "data-interview-length"
                        );
                        const startTime =
                            anchor.getAttribute("data-start-time");
                        const endTime = anchor.getAttribute("data-end-time");
                        const fileType = anchor.getAttribute("data-file-type");
                        const thumbnailUrl =
                            anchor.getAttribute("data-thumbnail-url");
                        const wavId = anchor.getAttribute("data-wav-id");
                        const color = anchor.getAttribute("data-color");
                        const key = anchor.getAttribute("data-key");
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
                            variant,
                            wavUrl,
                            interviewLength,
                            startTime,
                            endTime,
                            fileType,
                            thumbnailUrl,
                            wavId,
                            color,
                            key,
                        };
                    },
                },
                ...(override.parseDOM ?? []),
            ],
            toDOM: (node) => {
                const { error, ...rest } = omitExtraAttributes(
                    node.attrs,
                    extra
                );
                const attrs: DOMCompatibleAttributes = {
                    ...extra.dom(node),
                    ...rest,
                    "data-id": node.attrs.id,
                    "data-interview-url": node.attrs.interviewUrl,
                    "data-title": node.attrs.title,
                    "data-description": node.attrs.description,
                    "data-duration": node.attrs.duration,
                    "data-interview-name": node.attrs.interviewName,
                    "data-created-by": node.attrs.createdBy,
                    "data-created-at": node.attrs.createdAt,
                    "data-labels": JSON.stringify(node.attrs.labels),
                    "data-note-url": node.attrs.noteUrl,
                    "data-variant": node.attrs.variant,
                    "data-wav-url": node.attrs.wavUrl,
                    "data-interview-length": node.attrs.interviewLength,
                    "data-start-time": node.attrs.startTime,
                    "data-end-time": node.attrs.endTime,
                    "data-file-type": node.attrs.fileType,
                    "data-thumbnail-url": node.attrs.thumbnailUrl,
                    "data-wav-id": node.attrs.wavId,
                    "data-color": node.attrs.color,
                    "data-key": node.attrs.key,
                };

                if (error) {
                    attrs["data-error"] = error;
                }

                return ["div", attrs];
            },
        };
    }

    createPasteRules(): NodePasteRule[] {
        return [
            {
                type: "node",
                nodeType: this.type,
                regexp: this.options.pasteRuleRegexp,
                getAttributes: (match: string[]) => {
                    const url = match[0];
                    const urlParams = new URLSearchParams(url.split("?")[1]);
                    const noteUrl = url.split("?")[0];
                    const variant = urlParams.get("variant") ?? "default";
                    const noteNode = this.type.create({
                        noteUrl,
                        createNode: true,
                        variant,
                    });
                    return noteNode.attrs;
                },
                getContent: (match: string[]) => {
                    const url = match[0];
                    const urlParams = new URLSearchParams(url.split("?")[1]);
                    const noteUrl = url.split("?")[0];
                    const variant = urlParams.get("variant") ?? "default";
                    const noteNode = this.type.create({
                        noteUrl,
                        createNode: true,
                        variant,
                    });

                    return noteNode.content;
                },
            },
        ];
    }

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
                const moreOptionsButton = target.closest(
                    ".more-options-container"
                );
                const createClusterButton = target.closest(
                    ".create-cluster-button"
                );
                if (moreOptionsButton || createClusterButton) {
                    return;
                }

                const nodeWithPosition = clickState.getNode(this.type);
                const data = nodeWithPosition?.node.attrs;

                if (
                    !nodeWithPosition ||
                    data?.variant === "video-text" ||
                    data?.variant === "video"
                ) {
                    return;
                }

                return this.options.onClick(event, data);
            },
        };
    }

    @command()
    replaceNoteWithLink(
        noteUrl: string,
        position: number,
        insertText: (
            text: string | (() => Promise<string>),
            options?: any
        ) => void
    ): CommandFunction {
        return ({ tr, dispatch, state, view }) => {
            if (position !== 0 && !position) {
                return false;
            }

            const sel = NodeSelection.create(state.doc, position);

            tr.setSelection(sel);
            tr.delete(position, position + 1);
            dispatch?.(tr);
            view?.focus();
            insertText(noteUrl, {
                marks: {
                    link: {
                        href: noteUrl,
                    },
                },
            });
            return true;
        };
    }

    @command()
    insertNote(
        attributes: NoteAttributes,
        selection?: PrimitiveSelection
    ): CommandFunction {
        return ({ tr, dispatch }) => {
            const { from, to } = getTextSelection(
                selection ?? tr.selection,
                tr.doc
            );
            const node = this.type.create(attributes);

            dispatch?.(tr.replaceRangeWith(from, to, node));

            return true;
        };
    }

    @command()
    deleteFile(pos: number): CommandFunction {
        return ({ tr, state, dispatch }) => {
            if (typeof pos !== "number" || isNaN(pos)) {
                tr.deleteSelection();
                dispatch?.(tr);
                return true;
            }

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
    updateNote(pos: number, newNoteObject: INote): CommandFunction {
        return ({ tr, state, dispatch }) => {
            if (pos !== 0 && !pos) {
                return false;
            }

            const node = state.doc.nodeAt(pos);

            if (node && node.type === this.type) {
                const newAttributes = getNoteExtensionObject(
                    newNoteObject,
                    node.attrs
                );
                if (!newAttributes) return false;
                // Always make create node false when updating the note
                tr.setNodeMarkup(pos, node.type, {
                    ...newAttributes,
                    createNode: false,
                });
                if (dispatch) dispatch(tr);
                return true;
            }

            return false;
        };
    }

    @command()
    updateVariant(pos: number, variant: string): CommandFunction {
        return ({ tr, state, dispatch }) => {
            const node = state.doc.nodeAt(pos);

            if (node && node.type === this.type) {
                const newAttributes = { ...node.attrs, variant };
                if (!newAttributes) return false;
                tr.setNodeMarkup(pos, node.type, newAttributes);
                if (dispatch) dispatch(tr);
                return true;
            }

            return false;
        };
    }

    @command()
    convertToQuote(
        attributes: NoteAttributes,
        selection?: PrimitiveSelection
    ): CommandFunction {
        return ({ tr, dispatch, state }) => {
            const { from, to } = getTextSelection(
                selection ?? tr.selection,
                tr.doc
            );
            const { id, subtitle, interviewName, noteUrl } = attributes;

            // Updating this will also need to update migrations
            // in BE for extracting note ids
            const node = htmlToProsemirrorNode({
                content: `<blockquote class="note-quote" id="note-quote-${id}">
          <p class="subtitle">${subtitle}</p>
          <p class="interview-source">Source: ${interviewName} - <a href="${noteUrl}" data-note-id="${id}" rel="noopener noreferrer nofollow" data-link-auto="">Open note</a></p>
        </blockquote>`,
                schema: state.schema,
            });
            dispatch?.(tr.replaceRangeWith(from, to, node));
            return true;
        };
    }

    @keyBinding({ shortcut: ["Backspace", "Delete"] })
    backspaceShortcut(props: KeyBindingProps): boolean {
        const { tr, state } = props;
        const { from, to, empty } = tr.selection;

        if (!this.hasHandlers("onDeleteFile") || empty) {
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

    /**
     * Variant of the note, e.g. playlist, player, etc.
     * @default 'default'
     * @optional
     * @example 'playlist'
     */
    variant?: string;

    /**
     * URL where the note can be viewed
     * @default ''
     **/
    wavUrl?: string;

    /**
     * interview length
     **/
    interviewLength?: number;

    /**
     * start time
     **/
    startTime?: number;

    /**
     * end time
     **/
    endTime?: number;

    /**
     * File type
     **/
    fileType?: string;

    /**
     * Thumbnail URL
     **/
    thumbnailUrl?: string;

    /**
     * Wav id
     **/
    wavId?: string;

    /**
     * color
     **/
    color?: string;

    /**
     * Used to insert a note from noteUrl
     * @default false
     * @optional
     */
    createNode?: boolean;

    /**
     * key of the note
     * @default false
     */
    key?: string;
}

declare global {
    namespace Remirror {
        interface AllExtensions {
            note: NoteExtension;
        }
    }
}
