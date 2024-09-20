import React from "react";
import { Modal } from "react-bootstrap";

const CustomModal = ({ show, onHide, title, children, footer }) => (
  <Modal show={show} onHide={onHide} centered size="lg">
    <Modal.Header className="bgTheme text-light">
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
    {footer && (
      <Modal.Footer>
        <hr />
        {footer}
      </Modal.Footer>
    )}
  </Modal>
);

export default CustomModal;
