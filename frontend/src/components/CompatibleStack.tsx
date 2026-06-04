"use client";
import { useInView } from '../hooks/useInView';
import Image from 'next/image';

export default function CompatibleStack() {
  const { ref, inView } = useInView(0.1);

  type Pill = { name: string; img?: string; isAny?: boolean };
  const rows: { label: string; items: Pill[] }[] = [
    {
      label: 'Wallets',
      items: [
        { name: 'Freighter', img: '/images/freighter.png' },
        { name: 'Lobstr', img: '/images/lobster.png' },
        { name: 'xBull', img: '/images/xBull.avif' },
        { name: 'Solar', img: '/images/Solar.png' },
        { name: 'Any Stellar Wallet', isAny: true },
      ],
    },
    {
      label: 'Assets',
      items: [
        { name: 'USDC', img: '/images/USDC.jpg' },
        { name: 'XLM', img: '/images/xlm.jpeg' },
        { name: 'USDT', img: '/images/usdt.png' },
        { name: 'Any Stellar Asset', isAny: true },
      ],
    },
    {
      label: 'Frameworks',
      items: [
        { name: 'React', img: '/images/react.webp' },
        { name: 'Node.js', img: '/images/nodejs.png' },
        { name: 'Express', img: '/images/express.png' },
        { name: 'MongoDB', img: '/images/mongodb.png' },
        { name: 'Stellar SDK', img: '/images/StellarSDK.png' },
        { name: 'Soroban', img: '/images/soroban.jpg' },
        { name: 'Any Framework', isAny: true },
      ],
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#f9f9f9] border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-3xl md:text-4xl font-black text-center text-black mb-16">
            Works effortlessly<br />
            with your favorite stack.
          </h2>

          <div className="divide-y divide-gray-100">
            {rows.map((row, ri) => (
              <div
                key={row.label}
                className={`flex flex-wrap items-center gap-4 py-6 transition-all duration-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${ri * 120}ms` }}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-24 flex-shrink-0">
                  {row.label}
                </span>
                <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  {row.items.map((item) =>
                    item.isAny ? (
                      <span key={item.name} className="text-sm font-black px-3 py-1.5 rounded-full bg-black text-white ml-1">
                        {item.name}
                      </span>
                    ) : (
                      <span
                        key={item.name}
                        className="flex items-center gap-2 border border-gray-200 bg-white rounded-full pl-1 pr-3.5 py-1 text-sm text-gray-800 font-medium hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-default select-none"
                      >
                        <span className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm bg-white">
                          <Image
                            src={item.img!}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </span>
                        {item.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
