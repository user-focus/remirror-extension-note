import React from "react";
import { NoteComponent } from "./note-component";

const defaultObject = {};

export const VariantRenderer = ({
    variant = "default",
    variantComponents = defaultObject,
    ...restProps
}) => {
    const Component = variantComponents[variant] || NoteComponent;
    return <Component {...restProps} />;
};

