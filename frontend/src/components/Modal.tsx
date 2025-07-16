/*
  Modal.tsx

  A reusable modal dialog component for displaying overlay content.

  Props:
  - isOpen: toggles visibility of the modal
  - onClose: callback for closing the modal
  - title: optional heading displayed at the top
  - children: content rendered inside the modal body

  Clicking on the overlay or the "×" button will close the modal.
*/

import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Don’t render the modal if it's not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

