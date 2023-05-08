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
    const { variant, noteUrl, createNode = false, key, id } = node.attrs;
    const [loadingNote, setLoadingNote] = useState(createNode);
    const [fetchedNote, setFetchedNote] = useState(false);
    const [noteLoadError, setNoteLoadError] = useState(false);

    const Component = variantComponents[variant] || NoteComponent;

    const { deleteFile, updateNote, replaceNoteWithLink, insertText } =
        useCommands();

    const getNoteDetailsById = useCallback(
        async (noteId?: string) => {
            // get note details
            let baseUrl = window.location.host;
            let url = "";
            if (baseUrl.includes("localhost")) {
                url = `http://localhost:8000/annotation_tool/events/${
                    id || noteId
                }`;
            } else {
                url = `https://${baseUrl}/annotation_tool/events/${
                    id || noteId
                }`;
            }
            const response = await fetch(url);
            const data: any = await response.json();
            return data;
        },
        [noteUrl, loadingNote, loadingNote]
    );

    const getNoteDetailsByKey = useCallback(
        async (noteKey?: string) => {
            // get note details
            let baseUrl = window.location.host;
            let url = "";
            if (!noteKey) {
                noteKey = getNoteKeyFromNoteUrl(noteUrl);
            }
            if (baseUrl.includes("localhost")) {
                url = `http://localhost:8000/annotation_tool/events/key/${
                    key || noteKey
                }/`;
            } else {
                url = `https://${baseUrl}/annotation_tool/events/key/${
                    key || noteKey
                }/`;
            }
            const response = await fetch(url);
            const data: any = await response.json();
            return data;
        },
        [noteUrl, loadingNote, loadingNote]
    );

    const getNoteDetails = useCallback(
        async (noteKeyArg?: string) => {
            // get note details
            try {
                const noteKey =
                    noteKeyArg || key || getNoteKeyFromNoteUrl(noteUrl);
                let data = null;

                if (noteKey) {
                    data = await getNoteDetailsByKey(noteKey);
                } else {
                    data = await getNoteDetailsById();
                }

                if (data && data.id) {
                    setFetchedNote(true);
                    updateThisNote(data);
                } else {
                    deleteNote();
                }
            } catch (error) {
                if (error.status === 404) {
                    replaceNoteWithLink(noteUrl, position(), insertText);
                    setNoteLoadError(true);
                }
                console.error("Error while fetching note detail", error);
            }
        },
        [noteUrl, loadingNote, loadingNote]
    );

    const fetchNoteFromLink = useCallback(async () => {
        setLoadingNote(true);
        try {
            let baseUrl = window.location.host;
            let url = "";
            const noteKey = getNoteKeyFromNoteUrl(noteUrl);
            if (baseUrl.includes("localhost")) {
                url = `http://localhost:8000/annotation_tool/notes/${noteKey}/`;
            } else {
                url = `https://${baseUrl}/annotation_tool/notes/${noteKey}/`;
            }

            const response = await fetch(url);

            const [data] = (await response.json()) as any;

            if (data) {
                await getNoteDetails(noteKey);
            } else {
                setNoteLoadError(true);
                replaceNoteWithLink(noteUrl, position(), insertText);
            }
        } catch (err) {
            console.error("Error while fetching note detail", err);
            setNoteLoadError(true);
            replaceNoteWithLink(noteUrl, position(), insertText);
        } finally {
            if (loadingNote) {
                setLoadingNote(false);
            }
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
        if (!createNode && !fetchedNote) {
            getNoteDetails();
        }
    }, [getNoteDetails, createNode, fetchedNote]);

    useEffect(() => {
        if (createNode) {
            handleInsertNoteFromLink();
        }
    }, [createNode]);

    return !loadingNote && !noteLoadError ? (
        <Component {...restProps} />
    ) : (
        <div className="NOTE_ROOT NOTE_ROOT_LOADER">
            <Loader />
        </div>
    );
};
