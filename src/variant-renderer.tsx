import { useCommands } from "@remirror/react";
import React, { useCallback, useEffect } from "react";
import { NoteComponent } from "./note-component";
import { INote } from "./utils/typings";

const defaultObject = {};

export const VariantRenderer = ({
    variantComponents = defaultObject,
    ...restProps
}) => {
    const { getPosition, node } = restProps;
    const position = getPosition as () => number;
    const {variant, id, noteUrl} = node.attrs;
    const Component = variantComponents[variant] || NoteComponent;
    const { deleteFile, updateNote } = useCommands();

    const getNoteDetails = useCallback(async () => {
        // get note details
        try {
            const url = `https://${window.location.host}/annotation_tool/events/${id}`;
            const response = await fetch(url);
            const data: any = await response.json();
            if (data && data.id) {
                updateThisNote(data);
            } else {
                deleteNote();
            }
        } catch (error) {
            console.error("Error while fetching note detail", error);
        }
    }, [noteUrl]);

    const updateThisNote = useCallback(
        (noteObject: INote) => {
            updateNote(position(), noteObject);
        },
        [updateNote, position]
    );

    const deleteNote = useCallback(() => {
        deleteFile(position());
    }, [deleteFile, position]);

    useEffect(() => {
        getNoteDetails();
    }, [getNoteDetails]);

    return <Component {...restProps} />;
};
