// El punto de color que identifica la categoría de un proceso.
import './CategoryDot.css';

/**
 * Dibuja un punto del color de la categoría. Es decorativo: el nombre de la
 * categoría siempre va escrito al lado, así que se oculta a los lectores de pantalla.
 *
 * @param {object} props
 * @param {string} props.category - La categoría (compra, guardar, preparar...).
 * @returns {JSX.Element} El punto de color.
 */
export default function CategoryDot({ category }) {
  return <span className={`category-dot category-dot-${category}`} aria-hidden="true" />;
}
