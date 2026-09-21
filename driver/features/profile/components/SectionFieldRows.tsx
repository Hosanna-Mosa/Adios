import React from "react";
import type { Field } from "../utils/format";
import { FieldRow } from "./FieldRow";

/** Every profile section opens with the same list of label/value rows. */
export function SectionFieldRows({ fields }: { fields: Field[] }) {
  return (
    <>
      {fields.map((item) => (
        <FieldRow key={item.label} label={item.label} value={item.value} />
      ))}
    </>
  );
}
