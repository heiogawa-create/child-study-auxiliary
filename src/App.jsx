import { useState } from 'react';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import HintPage from './pages/HintPage';
import RewardPage from './pages/RewardPage';
import { useStamps } from './hooks/useStamps';

export default function App() {
  const [page, setPage] = useState('home');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [thinking, setThinking] = useState('');
  const { stamps, addStamp, todayCount, totalCount } = useStamps();

  const handleSelectSubject = (selectedSubject) => {
    setSubject(selectedSubject);
    setPage('input');
  };

  const handleSubmitQuestion = (q, t) => {
    setQuestion(q);
    setThinking(t);
    setPage('hint');
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setThinking('');
    setPage('input');
  };

  const handleGoHome = () => {
    setPage('home');
    setSubject('');
    setQuestion('');
    setThinking('');
  };

  const handleGoReward = () => {
    setPage('reward');
  };

  return (
    <div style={{ flex: 1, paddingBottom: '80px' }}>
      {/* ヘッダーバー */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '2px solid rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleGoHome}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#FF7043',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          💡 べんきょうヒント
        </button>
        <button
          onClick={handleGoReward}
          style={{
            background: 'rgba(255,224,130,0.4)',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: '#E65100',
          }}
        >
          ⭐ {totalCount}
        </button>
      </header>

      {/* ページ切り替え */}
      {page === 'home' && (
        <HomePage
          onSelectSubject={handleSelectSubject}
          totalStamps={totalCount}
          todayStamps={todayCount}
        />
      )}
      {page === 'input' && (
        <InputPage
          subject={subject}
          onSubmit={handleSubmitQuestion}
          onBack={handleGoHome}
        />
      )}
      {page === 'hint' && (
        <HintPage
          subject={subject}
          question={question}
          thinking={thinking}
          onNewQuestion={handleNewQuestion}
          onGoHome={handleGoHome}
          onEarnStamp={addStamp}
        />
      )}
      {page === 'reward' && (
        <RewardPage stamps={stamps} onGoHome={handleGoHome} />
      )}

      {/* アニメーション用CSS */}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
