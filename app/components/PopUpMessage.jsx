'use client';

export default function PopUpMessage({ message, type, onClose }) {
  return (
    <div className="popup-message-overlay2">
      <div className={`popup-message2 ${type}`}>
        <p>{message}</p>
        <button className="popup-ok-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
