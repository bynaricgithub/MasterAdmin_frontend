// components/Reusable/ConfirmationModal.js
import React from "react";
import { Button, Modal } from "react-bootstrap";

const ConfirmationModal = ({ show, onHide, title, onConfirm }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header className="bgTheme text-light">
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Are you sure you want to proceed?</p>
    </Modal.Body>
    <Modal.Footer className="text-light">
      <Button variant="secondary" onClick={onHide}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Confirm
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmationModal;
