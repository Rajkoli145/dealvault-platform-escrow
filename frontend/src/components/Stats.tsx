"use client";
import { useInView } from '../hooks/useInView';

export default function Stats() {
  const { ref, inView } = useInView();

  const stats = [
    { value: '$0', label: 'Hidden fees', sub: 'What you fund is what contributors earn' },
    { value: '< 5s', label: 'Settlement', sub: 'Powered by Stellar Network' },
    { value: '180+', label: 'Countries', sub: 'Global contributor access' },
    { value: '100%', label: 'Upfront funds', sub: 'Before any work begins' },
  ];

  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div ref={ref} className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label, sub }, i) => (
          <div key={label}
            className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="text-3xl font-black text-black mb-1">{value}</div>
            <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
