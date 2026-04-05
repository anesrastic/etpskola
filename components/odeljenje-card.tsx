import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface OdeljenjeCardProps {
  id: number;
  naziv: string;
  smer: string;
  stepen: string;
  jezik: string;
  razredni: string;
  brojUcenika: number;
}

export function OdeljenjeCard({ id, naziv, smer, stepen, jezik, razredni, brojUcenika }: OdeljenjeCardProps) {
  return (
    <Link href={`/odeljenja/${id}`} className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:border-brand-200 border border-transparent transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center font-bold text-brand-800 text-lg">
          {naziv}
        </div>
        <div className="flex gap-1">
          <Badge className="bg-brand-100 text-brand-800 text-xs">{stepen}°</Badge>
          <Badge variant="outline" className="text-xs border-brand-200 text-brand-700">{jezik}</Badge>
        </div>
      </div>
      <div className="text-sm font-medium text-slate-700 mb-1 leading-snug line-clamp-2">{smer}</div>
      <div className="text-xs text-slate-400 mb-2">Razredni: {razredni}</div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">Učenici</span>
        <span className="text-xl font-bold text-brand-900">{brojUcenika}</span>
      </div>
    </Link>
  );
}
