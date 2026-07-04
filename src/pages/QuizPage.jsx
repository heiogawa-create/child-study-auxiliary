import { useState, useMemo } from 'react';
import CharacterAvatar from '../components/CharacterAvatar';
import ActionButton from '../components/ActionButton';
import ClockFace from '../components/ClockFace';
import { generateProblemSet, checkAnswer } from '../services/problemGenerator';
import { generateHint } from '../services/hintService';
import { getEvolution } from '../data/characters';

const TOTAL_QUESTIONS = 20;
const MAX_HINTS = 3;

export default function QuizPage({ subject, unit, characterId, totalStamps, onEarnStamp, onFinish, onBack }) {
  const [questions] = useState(() => generateProblemSet(unit.type, TOTAL_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [clockAnswer, setClockAnswer] = useState({ hour: '', minute: '' });
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [hints, setHints] = useState([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [stampedThisQuestion, setStampedThisQuestion] = useState(false);

  const question = questions[index];
  const evo = useMemo(() => getEvolution(characterId, totalStamps), [characterId, totalStamps]);
  const isFinished = index >= questions.length;

  const resetQuestionState = () => {
    setAnswer('');
    setClockAnswer({ hour: '', minute: '' });
    setFeedback(null);
    setHints([]);
    setStampedThisQuestion(false);
  };

  const handleCheck = () => {
    const userInput = question.kind === 'clock' ? clockAnswer : answer;
    const isCorrect = checkAnswer(question, userInput);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      if (!stampedThisQuestion) {
        onEarnStamp();
        setStampedThisQuestion(true);
      }
    }
  };

  const handleNext = () => {
    resetQuestionState();
    setIndex((i) => i + 1);
  };

  const handleHint = async () => {
    if (hints.length >= MAX_HINTS || hintLoading) return;
    setHintLoading(true);
    const thinking = question.kind === 'clock'
      ? `じかんは ${clockAnswer.hour || '？'}じ${clockAnswer.minute || '？'}ふん だとおもう`
      : answer;
    const hint = await generateHint(subject, question.prompt, thinking, hints.length, null);
    setHints((prev) => [...prev, hint]);
    setHintLoading(false);
  };

  if (isFinished) {
    return (
      <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={120} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF7043', margin: '12px 0' }}>
          🎉 {unit.name} クリア！
        </h2>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#5D4037' }}>
            {questions.length}もんちゅう <span style={{ color: '#66BB6A', fontSize: '1.4rem' }}>{correctCount}</span>もん せいかい！
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ActionButton onClick={onBack} color="#FFB74D">
            📚 べつのたんげんへ
          </ActionButton>
          <ActionButton onClick={onFinish} color="#42A5F5" variant="outline">
            🏠 ホームにもどる
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', fontSize: '1.1rem', color: '#42A5F5',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, padding: '4px 0', marginBottom: '8px',
        }}
      >
        ← たんげんえらびへ
      </button>

      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={90} speaking={hintLoading} />
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9E9E9E' }}>
          {unit.name}　{index + 1} / {questions.length}もん
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px', textAlign: 'center' }}>
        {question.visual?.type === 'count' && (
          <p style={{ fontSize: '2rem', letterSpacing: '4px', marginBottom: '12px' }}>
            {question.visual.emoji.repeat(question.visual.count)}
          </p>
        )}
        {question.visual?.type === 'sequence' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            {question.visual.seq.map((n, i) => (
              <div key={i} style={{
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px', fontWeight: 800, fontSize: '1.2rem',
                backgroundColor: i === question.visual.blankIndex ? '#FFF3E0' : '#F5F5F5',
                border: i === question.visual.blankIndex ? '3px solid #FF7043' : '2px solid #E0E0E0',
                color: i === question.visual.blankIndex ? '#FF7043' : '#5D4037',
              }}>
                {i === question.visual.blankIndex ? '？' : n}
              </div>
            ))}
          </div>
        )}
        {question.visual?.type === 'clock' && (
          <div style={{ marginBottom: '12px' }}>
            <ClockFace hour={question.visual.hour} minute={question.visual.minute} />
          </div>
        )}

        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5D4037', lineHeight: '1.6' }}>
          {question.prompt}
        </p>

        <div style={{ marginTop: '16px' }}>
          {question.kind === 'clock' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={clockAnswer.hour}
                onChange={(e) => setClockAnswer((prev) => ({ ...prev, hour: e.target.value }))}
                disabled={feedback === 'correct'}
                style={{ width: '70px', padding: '10px', fontSize: '1.3rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '10px' }}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>じ</span>
              <input
                type="number"
                value={clockAnswer.minute}
                onChange={(e) => setClockAnswer((prev) => ({ ...prev, minute: e.target.value }))}
                disabled={feedback === 'correct'}
                style={{ width: '70px', padding: '10px', fontSize: '1.3rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '10px' }}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>ふん</span>
            </div>
          ) : (
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={feedback === 'correct'}
              placeholder="こたえ"
              style={{ width: '140px', padding: '12px', fontSize: '1.4rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '12px' }}
            />
          )}
        </div>
      </div>

      {hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {hints.map((hint, i) => (
            <div key={i} style={{ padding: '14px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '5px solid #FFB74D' }}>
              <p style={{ fontSize: '0.8rem', color: '#FF7043', fontWeight: 700, marginBottom: '4px' }}>
                💡 {evo.name}のヒント {i + 1}
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{hint}</p>
            </div>
          ))}
        </div>
      )}

      {feedback === 'correct' && (
        <div style={{ textAlign: 'center', padding: '12px', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 800, color: '#66BB6A' }}>
          ⭕ せいかい！すごいね！
        </div>
      )}
      {feedback === 'incorrect' && (
        <div style={{ textAlign: 'center', padding: '12px', marginBottom: '16px', fontSize: '1.05rem', fontWeight: 700, color: '#FF7043' }}>
          おしい！もういちど かんがえてみよう
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {feedback !== 'correct' && (
          <>
            <ActionButton onClick={handleCheck} color="#66BB6A">
              ✅ こたえあわせ
            </ActionButton>
            {hints.length < MAX_HINTS && (
              <ActionButton onClick={handleHint} color="#FFB74D" disabled={hintLoading} variant="outline">
                🔍 ヒントをもらう（のこり{MAX_HINTS - hints.length}かい）
              </ActionButton>
            )}
          </>
        )}
        {feedback === 'correct' && (
          <ActionButton onClick={handleNext} color="#42A5F5">
            ➡️ つぎのもんだいへ
          </ActionButton>
        )}
      </div>
    </div>
  );
}
