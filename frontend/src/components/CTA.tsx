"use client";
import { useInView } from '../hooks/useInView';

export default function CTA() {
  const { ref, inView } = useInView();

  return (
    <section className="relative py-24 px-6 border-t border-gray-200 bg-black overflow-hidden">
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Get started</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Stop working on promises.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Join DealVault and work only on opportunities where payment is already secured and waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-l-lg text-sm focus:outline-none focus:border-white/40 w-full sm:w-64 transition-colors"
              />
              <button className="bg-white hover:bg-gray-100 text-black font-semibold px-5 py-3 rounded-r-lg text-sm transition-colors whitespace-nowrap">
                Request access
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-600">Early access · No credit card required</p>
        </div>
      </div>
    </section>
  );
}
