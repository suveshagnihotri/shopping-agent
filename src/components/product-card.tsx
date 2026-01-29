/* eslint-disable @next/next/no-img-element */
import { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={cn(
                "group relative flex w-[160px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900",
                className
            )}
        >
            <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute right-2 top-2">
                    <span className="inline-flex items-center rounded-lg bg-white/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-900/5">
                        ₹{product.price}
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-2.5">
                <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                        {product.brand}
                    </span>
                </div>
                <h3 className="mb-1 text-[12px] font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <p className="mb-2 text-[9px] leading-tight text-gray-500 dark:text-gray-400 line-clamp-1">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center gap-1.5">
                    <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg bg-gray-900 px-2 py-1.5 text-center text-[9px] font-bold text-white transition-all hover:bg-blue-600 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-blue-500 dark:hover:text-white"
                    >
                        View
                    </a>
                    <button className="rounded-lg border border-gray-100 bg-gray-50 p-1.5 text-gray-500 transition-all hover:bg-white hover:text-blue-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                        <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
