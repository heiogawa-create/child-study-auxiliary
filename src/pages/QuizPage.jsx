import { useMemo, useState } from 'react';
import CharacterAvatar from '../components/CharacterAvatar';
import ActionButton from '../components/ActionButton';
import ClockFace from '../components/ClockFace';
import { generateProblemSet, checkAnswer } from '../services/problemGenerator';
import { generateHint } from '../services/hintService';
import { getEvolution } from '../data/characters';

const MAX_HINTS = 3;

function QuestionVisual({ visual }) {
  if (!visual) return null;

  if (visual.type === 'count') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px', fontSize: '2rem', marginBottom: '14px' }}>
        {Array.from({ length: visual.count }, (_, index) => <span key={index}>{visual.emoji}</span>)}
      </div>
    );
  }

  if (visual.type === 'sequence') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        {visual.seq.map((number, index) => (
          <div key={index} style={{
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '10px', fontWeight: 800, fontSize: '1.15rem',
            backgroundColor: index === visual.blankIndex ? '#FFF3E0' : '#F5F5F5',
            border: index === visual.blankIndex ? '3px solid #FF7043' : '2px solid #E0E0E0',
            color: index === visual.blankIndex ? '#FF7043' : '#5D4037',
          }}>
            {index === visual.blankIndex ? '？' : number}
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'clock') {
    return <div style={{ marginBottom: '14px' }}><ClockFace hour={visual.hour} minute={visual.minute} /></div>;
  }

  if (visual.type === 'itemRow') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '2rem', padding: '10px', marginBottom: '14px', background: '#F5F5F5', borderRadius: '12px' }}>
        {visual.items.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>
    );
  }

  if (visual.type === 'lengthBars') {
    const colors = ['#EF5350', '#42A5F5', '#FDD835'];
    return (
      <div style={{ display: 'grid', gap: '8px', marginBottom: '14px', textAlign: 'left' }}>
        {visual.bars.map((bar, index) => (
          <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '42px', fontSize: '0.85rem', fontWeight: 700 }}>{bar.label}</span>
            <span style={{ display: 'block', width: `${bar.value * 8}%`, minWidth: '35px', maxWidth: '78%', height: '18px', background: colors[index], borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'pictograph') {
    return (
      <div style={{ display: 'grid', gap: '7px', marginBottom: '14px', padding: '10px', background: '#FAFAFA', borderRadius: '12px', textAlign: 'left' }}>
        {visual.items.map((item) => (
          <div key={item.label} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '54px', fontSize: '0.8rem', fontWeight: 700 }}>{item.label}</span>
            <span style={{ fontSize: '1.3rem', letterSpacing: '2px' }}>{item.emoji.repeat(item.count)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'barChart') {
    const max = Math.max(...visual.bars.map((bar) => bar.value), 1);
    return (
      <div style={{ height: '180px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', gap: '8px', padding: '12px 8px 0', borderLeft: '2px solid #BDBDBD', borderBottom: '2px solid #BDBDBD', marginBottom: '18px' }}>
        {visual.bars.map((bar, index) => (
          <div key={bar.label} style={{ flex: 1, maxWidth: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>{bar.value}</div>
            <div style={{ height: `${Math.max(18, (bar.value / max) * 115)}px`, background: ['#42A5F5', '#66BB6A', '#FFB74D', '#AB47BC'][index % 4], borderRadius: '6px 6px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '5px' }}>{bar.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === 'lineChart') {
    const max = Math.max(...visual.bars.map((bar) => bar.value), 1);
    const points = visual.bars.map((bar, index) => `${35 + index * 85},${125 - (bar.value / max) * 95}`).join(' ');
    return (
      <div style={{ marginBottom: '16px' }}>
        <svg viewBox="0 0 320 155" role="img" aria-label="折れ線グラフ" style={{ width: '100%', maxWidth: '340px' }}>
          <line x1="25" y1="130" x2="305" y2="130" stroke="#BDBDBD" strokeWidth="2" />
          <line x1="25" y1="15" x2="25" y2="130" stroke="#BDBDBD" strokeWidth="2" />
          <polyline points={points} fill="none" stroke="#42A5F5" strokeWidth="4" strokeLinejoin="round" />
          {visual.bars.map((bar, index) => {
            const x = 35 + index * 85;
            const y = 125 - (bar.value / max) * 95;
            return (
              <g key={bar.label}>
                <circle cx={x} cy={y} r="5" fill="#FF7043" />
                <text x={x} y={y - 9} textAnchor="middle" fontSize="11" fontWeight="700">{bar.value}</text>
                <text x={x} y="146" textAnchor="middle" fontSize="11" fontWeight="700">{bar.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (visual.type === 'table') {
    return (
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>{visual.headers.map((header) => <th key={header} style={{ border: '2px solid #BDBDBD', padding: '7px', background: '#FFF3E0' }}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {visual.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ border: '2px solid #BDBDBD', padding: '7px', fontWeight: cellIndex === 0 ? 700 : 500 }}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export default function QuizPage({ subject, unit, characterId, totalStamps, onEarnStamp, onFinish, onBack }) {
  const [questions] = useState(() => generateProblemSet(unit.type, unit.questionCount || 40));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [clockAnswer, setClockAnswer] = useState({ hour: '', minute: '' });
  const [feedback, setFeedback] = useState(null);
  const [hints, setHints] = useState([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [stampedThisQuestion, setStampedThisQuestion] = useState(false);

  const question = questions[index];
  const evo = useMemo(() => getEvolution(characterId, totalStamps), [characterId, totalStamps]);
  const isFinished = index >= questions.length;
  const progress = isFinished ? 100 : ((index + 1) / questions.length) * 100;

  const resetQuestionState = () => {
    setAnswer('');
    setClockAnswer({ hour: '', minute: '' });
    setFeedback(null);
    setHints([]);
    setStampedThisQuestion(false);
  };

  const handleCheck = () => {
    if (!question) return;
    const userInput = question.kind === 'clock' ? clockAnswer : answer;
    const isCorrect = checkAnswer(question, userInput);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
      if (!stampedThisQuestion) {
        onEarnStamp();
        setStampedThisQuestion(true);
      }
    }
  };

  const handleNext = () => {
    resetQuestionState();
    setIndex((current) => current + 1);
  };

  const handleHint = async () => {
    if (hints.length >= MAX_HINTS || hintLoading) return;

    const localHint = question.hints?.[hints.length];
    if (localHint) {
      setHints((current) => [...current, localHint]);
      return;
    }

    setHintLoading(true);
    const thinking = question.kind === 'clock'
      ? `じかんは ${clockAnswer.hour || '？'}じ${clockAnswer.minute || '？'}ふん だとおもう`
      : answer;
    const hint = await generateHint(subject, question.prompt, thinking, hints.length, null);
    setHints((current) => [...current, hint]);
    setHintLoading(false);
  };

  if (isFinished) {
    const score = Math.round((correctCount / questions.length) * 100);
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
          <p style={{ marginTop: '8px', color: '#FF7043', fontWeight: 800 }}>せいかいりつ {score}%</p>
          <p style={{ marginTop: '6px', color: '#8D6E63', fontSize: '0.85rem' }}>⭐ {correctCount}こ ためたよ</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ActionButton onClick={onBack} color="#FFB74D">📚 べつのたんげんへ</ActionButton>
          <ActionButton onClick={onFinish} color="#42A5F5" variant="outline">🏠 ホームにもどる</ActionButton>
        </div>
      </div>
    );
  }

  const canCheck = question.kind === 'clock'
    ? clockAnswer.hour !== '' && clockAnswer.minute !== ''
    : answer !== '';

  return (
    <div style={{ padding: '20px 16px 28px', maxWidth: '520px', margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#42A5F5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, padding: '4px 0', marginBottom: '8px' }}>
        ← たんげんえらびへ
      </button>

      <div style={{ height: '9px', background: '#E0E0E0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #66BB6A, #42A5F5)', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <CharacterAvatar typeId={characterId} totalStamps={totalStamps} size={82} speaking={hintLoading} />
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9E9E9E' }}>
          {unit.name}　{index + 1} / {questions.length}もん
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px', textAlign: 'center' }}>
        <QuestionVisual visual={question.visual} />

        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#5D4037', lineHeight: '1.7' }}>{question.prompt}</p>

        <div style={{ marginTop: '18px' }}>
          {question.kind === 'clock' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <input type="number" inputMode="numeric" value={clockAnswer.hour} onChange={(event) => setClockAnswer((current) => ({ ...current, hour: event.target.value }))} disabled={feedback === 'correct'} style={{ width: '70px', padding: '10px', fontSize: '1.3rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '10px' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>じ</span>
              <input type="number" inputMode="numeric" value={clockAnswer.minute} onChange={(event) => setClockAnswer((current) => ({ ...current, minute: event.target.value }))} disabled={feedback === 'correct'} style={{ width: '70px', padding: '10px', fontSize: '1.3rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '10px' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>ふん</span>
            </div>
          ) : question.kind === 'choice' ? (
            <div style={{ display: 'grid', gridTemplateColumns: question.choices.length > 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: '10px' }}>
              {question.choices.map((choice) => {
                const selected = answer === choice;
                return (
                  <button key={choice} type="button" onClick={() => feedback !== 'correct' && setAnswer(choice)} style={{
                    padding: '12px 8px', minHeight: '48px', borderRadius: '12px', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700,
                    border: selected ? '3px solid #FF7043' : '2px solid #E0E0E0',
                    background: selected ? '#FFF3E0' : '#FAFAFA', color: '#5D4037', cursor: feedback === 'correct' ? 'default' : 'pointer',
                  }}>
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <input type="number" inputMode="decimal" step="any" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={feedback === 'correct'} placeholder="こたえ" style={{ width: '150px', padding: '12px', fontSize: '1.35rem', textAlign: 'center', border: '3px solid #E0E0E0', borderRadius: '12px' }} />
              {question.answerSuffix && <span style={{ fontSize: '1rem', fontWeight: 700 }}>{question.answerSuffix}</span>}
            </div>
          )}
        </div>
      </div>

      {hints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {hints.map((hint, hintIndex) => (
            <div key={`${hint}-${hintIndex}`} style={{ padding: '14px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '5px solid #FFB74D' }}>
              <p style={{ fontSize: '0.8rem', color: '#FF7043', fontWeight: 700, marginBottom: '4px' }}>💡 {evo.name}のヒント {hintIndex + 1}</p>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{hint}</p>
            </div>
          ))}
        </div>
      )}

      {feedback === 'correct' && (
        <div style={{ textAlign: 'center', padding: '13px', marginBottom: '16px', fontSize: '1.15rem', fontWeight: 800, color: '#2E7D32', background: '#E8F5E9', borderRadius: '12px' }}>
          ⭕ せいかい！すごいね！
          {question.explanation && <p style={{ marginTop: '6px', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.5 }}>{question.explanation}</p>}
        </div>
      )}
      {feedback === 'incorrect' && (
        <div style={{ textAlign: 'center', padding: '12px', marginBottom: '16px', fontSize: '1.02rem', fontWeight: 700, color: '#E65100', background: '#FFF3E0', borderRadius: '12px' }}>
          おしい！ヒントを見て もういちど考えよう
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {feedback !== 'correct' && (
          <>
            <ActionButton onClick={handleCheck} color="#66BB6A" disabled={!canCheck}>✅ こたえあわせ</ActionButton>
            {hints.length < MAX_HINTS && (
              <ActionButton onClick={handleHint} color="#FFB74D" disabled={hintLoading} variant="outline">
                🔍 ヒントをもらう（のこり{MAX_HINTS - hints.length}かい）
              </ActionButton>
            )}
          </>
        )}
        {feedback === 'correct' && <ActionButton onClick={handleNext} color="#42A5F5">➡️ つぎのもんだいへ</ActionButton>}
      </div>
    </div>
  );
}
