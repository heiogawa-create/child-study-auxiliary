import { useRef, useState } from 'react';

export default function PhotoCapture({ photo, onPhotoChange }) {
  const fileInputRef = useRef(null);
  const [cameraError, setCameraError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError('');

    if (!file.type.startsWith('image/')) {
      setCameraError('しゃしんファイルをえらんでね');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      onPhotoChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '6px',
          color: '#5D4037',
        }}
      >
        📸 もんだいのしゃしんをとる
      </label>

      {!photo ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* カメラで撮影（スマホ） */}
          <button
            onClick={() => {
              fileInputRef.current.setAttribute('capture', 'environment');
              fileInputRef.current.click();
            }}
            style={{
              flex: 1,
              padding: '16px 12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: 'white',
              backgroundColor: '#AB47BC',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
            }}
          >
            📷 カメラ
          </button>

          {/* ファイルから選択 */}
          <button
            onClick={() => {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }}
            style={{
              flex: 1,
              padding: '16px 12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: '#AB47BC',
              backgroundColor: 'white',
              border: '3px solid #AB47BC',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            🖼 アルバム
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #CE93D8',
          }}
        >
          <img
            src={photo}
            alt="もんだいのしゃしん"
            style={{
              width: '100%',
              display: 'block',
              maxHeight: '300px',
              objectFit: 'contain',
              backgroundColor: '#F5F5F5',
            }}
          />
          <button
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#F3E5F5',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#7B1FA2',
              textAlign: 'center',
            }}
          >
            しゃしんをセットしたよ！
          </div>
        </div>
      )}

      {cameraError && (
        <p style={{ color: '#E53935', fontSize: '0.9rem', marginTop: '6px' }}>
          {cameraError}
        </p>
      )}
    </div>
  );
}
