import Link from "next/link";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import styles from "./categories.module.css";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  "ui-kits": "🎨",
  "3d-assets": "🧊",
  "motion-graphics": "🎬",
  templates: "📄",
  "icons-illustrations": "✏️",
  "sound-effects": "🔊",
};

export default async function CategoriesPage() {
  const { items } = await api.get<{ items: Category[] }>("/api/categories").catch(() => ({ items: [] }));

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Browse categories</h1>
        <p className={styles.subtitle}>Find the perfect digital assets for your next project</p>
      </div>

      <div className={styles.grid}>
        {items.map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className={`${styles.card} glass`}>
            <div className={styles.cardIcon}>{ICONS[cat.slug] ?? "📦"}</div>
            <h2 className={styles.cardTitle}>{cat.name}</h2>
            <p className={styles.cardDesc}>{cat.description}</p>
            <div className={styles.cardFooter}>
              <span className={styles.productCount}>{cat._count?.products ?? 0} products</span>
              <span className={styles.arrow}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
