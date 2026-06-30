import TeacherCharacter from '../components/TeacherCharacter';
import SubjectButton from '../components/SubjectButton';

const SUBJECTS = ['さんすう', 'こくご', 'えいご', 'りか', 'そのほか'];

export default function HomePage({ onSelectSubject, totalStamps, todayStamps }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <TeacherCharacter size={130} />
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#FF7043',
            margin: '8px 0 4px',
          }}
        >
          べんきょうヒント
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#757575', marginBottom: '8px' }}>
          こたえじゃなくて、ヒントでおうえんするよ！
        </p>
      </div>

      {/* スタンプ表示 */}
      {totalStamps > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '10px 16px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.95rem',
          }}
        >
          ⭐ きょうのスタンプ: <strong>{todayStamps}こ</strong>
          {'　'}
          🏆 ぜんぶで: <strong>{totalStamps}こ</strong>
        </div>
      )}

      {/* 教科ボタン */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '12px',
          color: '#5D4037',
        }}
      >
        どのきょうかのもんだい？
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SUBJECTS.map((subject) => (
          <SubjectButton
            key={subject}
            subject={subject}
            onClick={onSelectSubject}
          />
        ))}
      </div>
    </div>
  );
}
