import { getLevel } from '../data/characters';

const CHARACTER_IMAGE_PATHS = {
  fairy: [
    '/characters/fairy/fairy-01-pico.webp',
    '/characters/fairy/fairy-02-coco.webp',
    '/characters/fairy/fairy-03-kira.webp',
    '/characters/fairy/fairy-04-sora.webp',
  ],
  owl: [
    '/characters/owl/owl-01-hou.webp',
    '/characters/owl/owl-02-wiz.webp',
    '/characters/owl/owl-03-sage.webp',
    '/characters/owl/owl-04-gran.webp',
  ],
  robot: [
    '/characters/robot/robot-01-bit.webp',
    '/characters/robot/robot-02-byte.webp',
    '/characters/robot/robot-03-giga.webp',
    '/characters/robot/robot-04-tera.webp',
  ],
  animal: [
    '/characters/animal/animal-01-mike.webp',
    '/characters/animal/animal-02-tama.webp',
    '/characters/animal/animal-03-leo.webp',
    '/characters/animal/animal-04-king.webp',
  ],
  star: [
    '/characters/star/star-01-luna.webp',
    '/characters/star/star-02-stella.webp',
    '/characters/star/star-03-nova.webp',
    '/characters/star/star-04-cosmo.webp',
  ],
};

function getImagePath(typeId, level) {
  const paths = CHARACTER_IMAGE_PATHS[typeId] || CHARACTER_IMAGE_PATHS.fairy;
  return paths[level - 1] || paths[0];
}

export default function CharacterAvatar({ typeId, totalStamps, size = 120, speaking = false }) {
  const level = getLevel(totalStamps);

  return (
    <div
      style={{
        width: size,
        height: size,
        margin: '0 auto',
        animation: speaking ? 'bounce 0.6s ease infinite alternate' : 'float 3s ease-in-out infinite',
      }}
    >
      <img
        src={getImagePath(typeId, level)}
        alt=""
        draggable="false"
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '22%',
        }}
      />
    </div>
  );
}
