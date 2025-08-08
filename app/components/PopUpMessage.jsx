'use client';

import { useState } from 'react';

export default function PopUpMessage({
  message,
  type,
  onClose,
  input = false,
  onInputSubmit = null,
  showCancel = false,
  onConfirm = null, 
}) {
  const [inputValue, setInputValue] = useState('');

  const handleOK = () => {
    if (input && onInputSubmit) {
      onInputSubmit(inputValue);
    }

    if (onConfirm) {
      onConfirm(); 
    }

    onClose(true);
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <div className="popup-message-overlay2">
      <div className={`popup-message2 ${type}`}>
        <p>{message}</p>

        {input && (
          <input
            type="email"
            placeholder="e.g. doctor@example.com"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="popup-input"
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {showCancel && (
            <button className="popup-cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          )}
          <button className="popup-ok-button" onClick={handleOK}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
