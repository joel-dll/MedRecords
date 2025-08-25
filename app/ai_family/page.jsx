'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { storage } from '../lib/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import emailjs from 'emailjs-com';
import PopUpMessage from '../components/PopUpMessage';
import { PiRobotThin } from 'react-icons/pi';

export default function FamilyAIPage() {
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('success');
  const [popupMsg, setPopupMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const searchParams = useSearchParams();
  const filePath = searchParams.get('filePath');

  useEffect(() => {
    if (!filePath) return;

    const fetchFile = async () => {
      try {
        const url = await getDownloadURL(ref(storage, filePath));
        setFileUrl(url);
        setFileType(filePath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      } catch (err) {
        console.error('Failed to get file URL:', err);
      }
    };

    fetchFile();
  }, [filePath]);

  const handleAIProcess = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai-translate', {
        method: 'POST',
        body: JSON.stringify({ fileUrl, prompt: userPrompt, fileType }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('API error response:', errorData);
        throw new Error('AI translation failed');
      }

      const data = await res.json();
      setAiResult(data.output);
      setShowPopup(true);
      setPopupType('success');
      setPopupMsg('AI summary generated!');
    } catch (err) {
      console.error('AI summary error:', err);
      setAiResult('An error occurred while processing the document.');
      setShowPopup(true);
      setPopupType('error');
      setPopupMsg('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowEmailInput(true);
  };

  const handleEmailSubmit = async (email) => {
    setShowEmailInput(false);
    if (!email) return;

    const templateParams = {
      to_email: email,
      message: aiResult,
      prompt: userPrompt,
      file_url: fileUrl,
    };

    try {
      await emailjs.send(
        'service_vrlm1p4',
        'template_4fatds4',
        templateParams,
        'OhcGaiZTHJFqEZ5xw'
      );
      setPopupMsg('AI Assistant response sent!');
      setPopupType('success');
      setShowPopup(true);
    } catch (error) {
      console.error('EmailJS error:', error);
      setPopupMsg('Failed to send email.');
      setPopupType('error');
      setShowPopup(true);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-grid">
        <div className="file-preview">
          {fileUrl ? (
            fileType === 'application/pdf' ? (
              <iframe src={fileUrl} width="100%" height="550px" title="Preview" />
            ) : (
              <img src={fileUrl} alt="preview" width="100%" />
            )
          ) : (
            <p>Loading file preview...</p>
          )}
        </div>

        <div className="ai-panel">
          <h3> Ai Assistant  <PiRobotThin className="robot-icon-aipage" /></h3>
          <textarea
            placeholder="Ask something like 'Translate to Spanish and summarize...'"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={3}
          />
          <button className="button-ai" onClick={handleAIProcess} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>

          {aiResult && (
            <>
              <div className="result">
                <h4>AI Result</h4>
                <p>{aiResult}</p>
                <button className="button-ai-share" onClick={handleShare}>
                  Share
                </button>
                <button
                className="button-ai-copy"
                onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    setPopupMsg('Text copied to clipboard!');
                    setPopupType('success');
                    setShowPopup(true);
                }}
                >
                Copy Text
                </button>
              </div>
            </>
          )}

          {showPopup && (
            <PopUpMessage
              message={popupMsg}
              onClose={() => setShowPopup(false)}
              type={popupType}
            />
          )}

          {showEmailInput && (
            <PopUpMessage
              message="Enter the recipient's email"
              input={true}
              showCancel={true}
              onClose={() => setShowEmailInput(false)}
              onInputSubmit={handleEmailSubmit}
              type="info"
            />
          )}
        </div>
      </div>
    </div>
  );
}
