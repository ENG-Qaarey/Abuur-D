import {
  Apple,
  Coffee,
  Gem,
  Laptop,
  Pill,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "./icons";

/** The kinds of shops ABUUR is built for, not customer logos. */
const KINDS = [
  { icon: Shirt, label: "Clothing & Fashion" },
  { icon: Smartphone, label: "Phones & Accessories" },
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: Sparkles, label: "Cosmetics & Perfume" },
  { icon: ShoppingBasket, label: "Groceries" },
  { icon: Pill, label: "Pharmacies" },
  { icon: Laptop, label: "Electronics" },
  { icon: Gem, label: "Jewellery" },
  { icon: Coffee, label: "Cafés & Bakeries" },
  { icon: Sofa, label: "Furniture" },
  { icon: Apple, label: "Fresh Produce" },
  { icon: Wrench, label: "Hardware" },
];

/** Infinite marquee (pattern from 21st.dev "Logo Cloud Marquee"). */
export function BusinessMarquee() {
  const items = [...KINDS, ...KINDS];
  return (
    <section aria-label="Types of businesses that sell with ABUUR" className="section-main py-10">
      <p className="text-center text-sm font-medium text-cl-muted">
        Made for every kind of shop
      </p>
      <div className="abuur-marquee mt-6 overflow-hidden">
        <ul className="abuur-marquee__track gap-3">
          {items.map(({ icon: Icon, label }, i) => (
            <li
              key={`${label}-${i}`}
              aria-hidden={i >= KINDS.length}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-cl-border bg-cl-card px-5 py-2.5 text-sm font-medium text-cl-text"
            >
              <Icon size={16} className="text-cl-accent" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
