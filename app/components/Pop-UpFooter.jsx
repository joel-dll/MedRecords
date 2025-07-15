'use client';

export default function PopUpFooter({ children, onClose }) {
  return (
    <div className="pop-up-overlay">
      <div className="pop-up">
        <button className="close-button" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
}