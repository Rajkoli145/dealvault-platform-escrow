"use client";
import { useInView } from '../hooks/useInView';

export default function Testimonials() {
  const { ref, inView } = useInView(0.05);

  const tweets = [
    {
      name: 'Priya Sharma',
      handle: '@priya_builds',
      avatar: 'PS',
      color: 'bg-purple-500',
      text: 'Finally a platform where I can see the money is actually THERE before I start. Been burned too many times on freelance. DealVault is the fix.',
      time: '9:41 AM · May 14, 2026',
      likes: 47,
    },
    {
      name: 'David Osei',
      handle: '@davidosei_dev',
      avatar: 'DO',
      color: 'bg-blue-600',
      text: 'The Stellar + USDC combo is genius. No volatility, near-zero fees, and instant settlement. This is how remote work should work globally.',
      time: '3:12 PM · May 18, 2026',
      likes: 83,
    },
    {
      name: 'Mei Lin',
      handle: '@meilin_ux',
      avatar: 'ML',
      color: 'bg-pink-500',
      text: 'Approved work on Monday. Payment hit my wallet in 4 seconds. Four. Seconds. Compare that to net-30 invoices from clients 😅',
      time: '11:22 AM · May 20, 2026',
      likes: 129,
    },
    {
      name: 'Arjun Mehta',
      handle: '@arjun_stellar',
      avatar: 'AM',
      color: 'bg-amber-500',
      text: 'The escrow is fully on-chain and auditable. I checked the Stellar block explorer before accepting the bounty. 100 USDC was right there. No trust needed.',
      time: '6:55 PM · May 22, 2026',
      likes: 61,
    },
    {
      name: 'Sarah Kim',
      handle: '@sarahkim_code',
      avatar: 'SK',
      color: 'bg-green-600',
      text: 'Been contributing open source for free for years. DealVault is the first time I felt like my work actually had a guaranteed payday attached from day one.',
      time: '2:08 PM · May 25, 2026',
      likes: 204,
    },
    {
      name: 'Tomás Rivera',
      handle: '@tomas_rust',
      avatar: 'TR',
      color: 'bg-red-500',
      text: 'The Soroban contract is clean. Checked the code on GitHub — fund, release, refund. Simple. Auditable. No surprises. That\'s what I want from escrow infra.',
      time: '10:31 AM · May 28, 2026',
      likes: 38,
    },
  ];

  return (
    <section className="py-24 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref}>
          <h2 className={`text-3xl md:text-4xl font-black text-center text-black mb-3 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Loved by contributors worldwide.
          </h2>
          <p className={`text-center text-gray-400 text-sm mb-14 transition-all duration-500 ${inView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
            Don&apos;t take our word for it — here&apos;s what builders are saying.
          </p>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {tweets.map((tweet, i) => (
              <div
                key={tweet.handle}
                className={`break-inside-avoid border border-gray-200 rounded-2xl p-5 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 hover:rotate-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${inView
                  ? 'opacity-100 translate-y-0 scale-100 rotate-0'
                  : `opacity-0 translate-y-20 scale-75 ${i % 2 === 0 ? '-rotate-12' : 'rotate-12'}`
                  }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${tweet.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {tweet.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-tight">{tweet.name}</div>
                      <div className="text-xs text-gray-400">{tweet.handle}</div>
                    </div>
                  </div>
                  {/* X logo */}
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{tweet.text}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{tweet.time}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" /></svg>
                    {tweet.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
