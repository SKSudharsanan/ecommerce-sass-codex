export function ProductCard({ name, price, meta }: { name: string; price: string; meta: string }) {
  return (
    <article className="glass-card product-card">
      <h3>{name}</h3>
      <p>{meta}</p>
      <strong>{price}</strong>
      <button className="ui-button ui-button-primary">Add to cart</button>
    </article>
  );
}
