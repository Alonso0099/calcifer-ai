// El adorno de las hojas de notas: una ramita de romero dibujada a mano como SVG.
// Es arte original y simple de esta app; no copia ninguna ilustración existente.
import './HerbSprig.css';

// Cada hojita de la ramita: dónde nace sobre el tallo (x, y) y hacia dónde apunta (grados).
const LEAVES = [
  { x: 14, y: 50, angle: -35 },
  { x: 19, y: 42, angle: 60 },
  { x: 23, y: 35, angle: -30 },
  { x: 28, y: 28, angle: 65 },
  { x: 33, y: 21, angle: -25 },
  { x: 38, y: 15, angle: 70 },
  { x: 43, y: 10, angle: -20 },
  { x: 48, y: 6, angle: 30 },
];

/**
 * Dibuja la ramita. Es solo decoración: aria-hidden la oculta a los lectores de pantalla.
 * Los colores no se escriben aquí: salen de las variables, en HerbSprig.css.
 *
 * @returns {JSX.Element} El dibujo SVG.
 */
export default function HerbSprig() {
  return (
    <svg className="herb-sprig" viewBox="0 0 60 60" aria-hidden="true">
      <path className="herb-sprig-stem" d="M8 56 C 18 44, 30 24, 52 4" />
      {LEAVES.map((leaf, index) => (
        <ellipse
          key={`${leaf.x}-${leaf.y}`}
          // Las hojas alternan entre los dos verdes de la paleta.
          className={index % 2 === 0 ? 'herb-sprig-leaf' : 'herb-sprig-leaf herb-sprig-leaf-light'}
          cx={leaf.x}
          cy={leaf.y - 6}
          rx="2"
          ry="6"
          transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </svg>
  );
}
