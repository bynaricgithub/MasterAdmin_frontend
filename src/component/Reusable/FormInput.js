import { ErrorMessage, Field } from "formik";
import React from "react";

const FormInput = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  as = "input",
}) => (
  <div className="form-floating mb-3">
    <Field
      id={`floating${name}`}
      name={name}
      as={as}
      type={type}
      value={value}
      onChange={onChange}
      className="form-control"
      placeholder={name}
    />
    <label htmlFor={`floating${name}`}>{label}</label>
    <ErrorMessage name={name}>
      {(msg) => <span className="text-danger font-12">{msg}</span>}
    </ErrorMessage>
  </div>
);

export default FormInput;
