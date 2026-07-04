import { useState, useEffect } from 'react';

export function useCharacter() {
  const [characterId, setCharacterId] = useState(() => {
    return localStorage.getItem('study-hint-character') || null;
  });

  useEffect(() => {
    if (characterId) {
      localStorage.setItem('study-hint-character', characterId);
    }
  }, [characterId]);

  const selectCharacter = (id) => {
    setCharacterId(id);
  };

  const hasCharacter = characterId !== null;

  return { characterId, selectCharacter, hasCharacter };
}
