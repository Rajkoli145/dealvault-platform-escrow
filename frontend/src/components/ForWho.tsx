"use client";
import { useInView } from '../hooks/useInView';
import { BookOpen, Code2, FileText, Palette, TrendingUp, Users } from 'lucide-react';

export default function ForWho() {
  const { ref, inView } = useInView();

  const categories = [
    { icon: Code2, label: 'Developers', desc: 'Bug fixes, features, integrations' },
    { icon: Palette, label: 'Designers', desc: 'UI, branding, product design' },
    { icon: BookOpen, label: 'Researchers', desc: 'Analysis, reports, insights' },
    { icon: FileText, label: 'Writers', desc: 'Docs, content, copy' },
    { icon: TrendingUp, label: 'Startups', desc: 'Product builds, MVPs' },
    { icon: Users, label: 'Communities', desc: 'Hackathons, open source' },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-14 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Who It's For</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-black">
            For every kind of contributor.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Whether you're fixing a bug or building an entire product, DealVault ensures your time is never spent on unfunded work.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(({ icon: Icon, label, desc }, i) => (
            <div key={label}
              className={`border border-gray-200 rounded-2xl p-5 text-center hover:border-gray-400 hover:bg-white hover:shadow-sm transition-all duration-300 cursor-default group bg-white ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-black transition-colors">
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
