import { useState, useRef } from 'react';
import CharacterSelectPage from './pages/CharacterSelectPage';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import HintPage from './pages/HintPage';
import RewardPage from './pages/RewardPage';
import EvolutionPage from './pages/EvolutionPage';
import GradeSelectPage from './pages/GradeSelectPage';
import UnitSelectPage from './pages/UnitSelectPage';
import QuizPage from './pages/QuizPage';
import { useStamps } from './hooks/useStamps';
import { useCharacter } from './hooks/useCharacter';
import { getLevel } from './data/characters';

const UNIT_BASED_SUBJECTS = ['さんすう'];

export default function App() {
  const [page, setPage] = useState('home');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [thinking, setThinking] = useState('');
  const [photo, setPhoto] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [gradeId, setGradeId] = useState('');
  const [unit, setUnit] = useState(null);
  const { stamps, addStamp, todayCount, totalCount } = useStamps();
  const { characterId, selectCharacter, hasCharacter } = useCharacter();
  const prevLevelRef = useRef(getLevel(totalCount));

  // キャラ未選択なら選択画面
  if (!hasCharacter) {
    return (
      <div style={{ flex: 1, paddingBottom: '80px' }}>
        <CharacterSelectPage onSelect={selectCharacter} />
        <AppStyles />
      </div>
    );
  }

  const handleSelectSubject = (selectedSubject) => {
    setSubject(selectedSubject);
    setPage(UNIT_BASED_SUBJECTS.includes(selectedSubject) ? 'grade' : 'input');
  };

  const handleSelectGrade = (selectedGradeId) => {
    setGradeId(selectedGradeId);
    setPage('unit');
  };

  const handleSelectUnit = (selectedUnit) => {
    setUnit(selectedUnit);
    setPage('quiz');
  };

  const handleSubmitQuestion = (q, t, p) => {
    setQuestion(q);
    setThinking(t);
    setPhoto(p);
    setPage('hint');
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setThinking('');
    setPhoto(null);
    setPage('input');
  };

  const handleGoHome = () => {
    setPage('home');
    setSubject('');
    setQuestion('');
    setThinking('');
    setPhoto(null);
    setGradeId('');
    setUnit(null);
  };

  const handleGoReward = () => {
    setPage('reward');
  };

  const handleGoCharacterChange = () => {
    setPage('characterChange');
  };

  const handleChangeCharacter = (id) => {
    selectCharacter(id);
    setPage('home');
  };

  const handleEarnStamp = () => {
    const prevLevel = prevLevelRef.current;
    addStamp();
    const newTotal = totalCount + 1;
    const newLevel = getLevel(newTotal);

    if (newLevel > prevLevel) {
      setEvolution({ newLevel, totalStamps: newTotal });
    }
    prevLevelRef.current = newLevel;
  };

  const handleCloseEvolution = () => {
    setEvolution(null);
  };

  return (
    <div style={{ flex: 1, paddingBottom: '80px' }}>
      {/* 進化演出 */}
      {evolution && (
        <EvolutionPage
          characterId={characterId}
          newLevel={evolution.newLevel}
          totalStamps={evolution.totalStamps}
          onClose={handleCloseEvolution}
        />
      )}

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
          characterId={characterId}
          onSelectSubject={handleSelectSubject}
          totalStamps={totalCount}
          todayStamps={todayCount}
        />
      )}
      {page === 'grade' && (
        <GradeSelectPage
          subject={subject}
          characterId={characterId}
          totalStamps={totalCount}
          onSelectGrade={handleSelectGrade}
          onBack={handleGoHome}
        />
      )}
      {page === 'unit' && (
        <UnitSelectPage
          subject={subject}
          gradeId={gradeId}
          characterId={characterId}
          totalStamps={totalCount}
          onSelectUnit={handleSelectUnit}
          onBack={() => setPage('grade')}
        />
      )}
      {page === 'quiz' && unit && (
        <QuizPage
          subject={subject}
          unit={unit}
          characterId={characterId}
          totalStamps={totalCount}
          onEarnStamp={handleEarnStamp}
          onFinish={handleGoHome}
          onBack={() => setPage('unit')}
        />
      )}
      {page === 'input' && (
        <InputPage
          subject={subject}
          characterId={characterId}
          totalStamps={totalCount}
          onSubmit={handleSubmitQuestion}
          onBack={handleGoHome}
        />
      )}
      {page === 'hint' && (
        <HintPage
          subject={subject}
          question={question}
          thinking={thinking}
          photo={photo}
          characterId={characterId}
          totalStamps={totalCount}
          onNewQuestion={handleNewQuestion}
          onGoHome={handleGoHome}
          onEarnStamp={handleEarnStamp}
        />
      )}
      {page === 'reward' && (
        <RewardPage
          characterId={characterId}
          stamps={stamps}
          totalStamps={totalCount}
          onGoHome={handleGoHome}
          onChangeCharacter={handleGoCharacterChange}
        />
      )}
      {page === 'characterChange' && (
        <CharacterSelectPage
          onSelect={handleChangeCharacter}
          currentCharacterId={characterId}
          totalStamps={totalCount}
          onBack={() => setPage('reward')}
        />
      )}

      <AppStyles />
    </div>
  );
}

function AppStyles() {
  return (
    <style>{`
      @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-6px); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `}</style>
  );
}
