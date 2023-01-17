import { useCommands } from "@remirror/react";
import React, { useCallback, useEffect, useState } from "react";
import { NoteComponent } from "./note-component";
import { getNoteKeyFromNoteUrl } from "./utils/getNoteKeyFromUrl";
import { INote } from "./utils/typings";

const defaultObject = {};

export const VariantRenderer = ({
    variantComponents = defaultObject,
    ...restProps
}) => {
    const { getPosition, node, Loader } = restProps;
    const position = getPosition as () => number;
    const {variant, id, noteUrl, createNode = false } = node.attrs;
    const [loadingNote, setLoadingNote] = useState(createNode);
    const [noteLoadError, setNoteLoadError] = useState(false);
   
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
            setNoteLoadError(true);
            replaceNoteWithLink(noteUrl, position(), insertText);
        } finally {
            if (loadingNote) {
                setLoadingNote(false);
            }
        }
    }, [noteUrl, loadingNote, loadingNote]);

    const fetchNoteFromLink = useCallback(async () => {

        setLoadingNote(true);
        try {
            const noteKey = getNoteKeyFromNoteUrl(noteUrl);
            const url = `https://${window.location.host}/annotation_tool/notes/${noteKey}/`;

            const response = await fetch(url);

            const [data] = await response.json() as any;

            const { id: noteId } = data;
            console.log('note id ', noteId);
            await getNoteDetails(noteId);
        } catch (err) {
            console.error("Error while fetching note detail", err);
            setNoteLoadError(true);
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

    const handleInsertNoteFromLink = useCallback(() => {
        fetchNoteFromLink();
    }, []);

    useEffect(() => {
        if (!createNode) {
            getNoteDetails();
        }
    }, [getNoteDetails, createNode]);

    useEffect(() => {
        if (createNode) {
            handleInsertNoteFromLink();
        }
    }, []);

    return !loadingNote && !noteLoadError ? 
        <Component {...restProps} /> : 
        (
            <div className="NOTE_ROOT NOTE_ROOT_LOADER">
                <Loader />
            </div>
        );
};
