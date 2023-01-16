import { useCommands } from "@remirror/react";
import React, { useCallback, useEffect, useState } from "react";
import { NoteComponent } from "./note-component";
import { NotePastePrompt } from "./note-paste-prompt";
import { getNoteKeyFromNoteUrl } from "./utils/getNoteKeyFromUrl";
import { INote } from "./utils/typings";

const defaultObject = {};

export const VariantRenderer = ({
    variantComponents = defaultObject,
    ...restProps
}) => {
    const { getPosition, node } = restProps;
    const position = getPosition as () => number;
    const {variant, id, noteUrl, createNode = false } = node.attrs;
    const [loadingNote, setLoadingNote] = useState(false);
    const [showLinkPrompt, setShowLinkPrompt] = useState(createNode);
   
    const Component = variantComponents[variant] || NoteComponent;

    const { deleteFile, updateNote, replaceNoteWithLink, insertText } = useCommands();

    const getNoteDetails = useCallback(async (noteId?: string) => {
        // get note details
        try {
            const url = `https://${window.location.host}/annotation_tool/events/${id || noteId}`;
            const response = await fetch(url);
            const data: any = await response.json();
            if (data && data.id) {
                updateThisNote(data);
            } else {
                deleteNote();
            }
        } catch (error) {
            console.error("Error while fetching note detail", error);
            if (createNode) {
                throw error;
            }
        } finally {
            if (loadingNote) {
                setLoadingNote(false);
            }
            if (showLinkPrompt) {
                setShowLinkPrompt(false);
            }
        }
    }, [noteUrl, loadingNote, showLinkPrompt]);

    const fetchNoteFromLink = useCallback(async () => {

        setLoadingNote(true);
        try {
            const noteKey = getNoteKeyFromNoteUrl(noteUrl);
            const url = `https://${window.location.host}/annotation_tool/notes/${noteKey}/`;

            const response = await fetch(url);

            const [data] = await response.json() as any;

            const { id: noteId } = data;

            await getNoteDetails(noteId);
        } catch (err) {
            console.error("Error while fetching note detail", err);
            replaceNoteWithLink(noteUrl, position(), insertText);
        }
    }, [noteUrl, getNoteDetails, replaceNoteWithLink, noteUrl]);

    const updateThisNote = useCallback(
        (noteObject: INote) => {
            updateNote(position(), noteObject);
        },
        [updateNote, position]
    );

    const deleteNote = useCallback(() => {
        deleteFile(position());
    }, [deleteFile, position]);

    const handleRevertClick = useCallback(() => {
        replaceNoteWithLink(noteUrl, position(), insertText);
    }, [replaceNoteWithLink, position]);

    const handleInsertNote = useCallback(() => {
        fetchNoteFromLink()
    }, []);

    useEffect(() => {
        if (!createNode) {
            getNoteDetails();
        }
    }, [getNoteDetails, createNode]);

    return showLinkPrompt ? (
        <NotePastePrompt
            noteUrl={noteUrl}
            handleInsertNote={handleInsertNote}
            handleRevertClick={handleRevertClick}
        />
    ) : <Component {...restProps} />;
};
