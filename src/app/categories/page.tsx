import { getCategories } from "@/actions/categoryActions";
import Link from "next/link";
import styles from "./categories.module.css";

export default async function CategoriesPage() {
  const categories = await getCategories();

  const icons: Record<string, string> = {
    'ui-kits': '🎨',
    '3d-assets': '🧊',
    'motion-graphics': '🎬',
    'templates': '📄',
    'icons-illustrations': '✏️',
    'sound-effects': '🔊',
  };

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Categories</h1>
        <p className={styles.subtitle}>Find the perfect digital assets for your next project</p>
      </div>

      <div className={styles.grid}>
        {(categories as any[]).map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className={`${styles.card} glass`}>
            <div className={styles.cardIcon}>{icons[cat.slug] || '📦'}</div>
            <h2 className={styles.cardTitle}>{cat.name}</h2>
            <p className={styles.cardDesc}>{cat.description}</p>
            <div className={styles.cardFooter}>
              <span className={styles.productCount}>{cat._count?.products || 0} products</span>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
