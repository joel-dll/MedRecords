'use client';

import { useState } from 'react';

export default function PopUpMessage({
  message,
  type,
  onClose,
  input = false,
  onInputSubmit = null,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleOK = () => {
    if (input && onInputSubmit) {
      onInputSubmit(inputValue);
    }
    onClose();
  };

  return (
    <div className="popup-message-overlay2">
      <div className={`popup-message2 ${type}`}>
        <p>{message}</p>

        {input ? (
          <input
            type="email"
            placeholder="e.g. doctor@example.com"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="popup-input"
          />
        ) : null}

        <button className="popup-ok-button" onClick={handleOK}>
          OK
        </button>
      </div>
    </div>
  );
}
