import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Sparkles } from 'lucide-react';
import { useTranslations } from '../lib/i18n';
export function Hero() {
  const t = useTranslations('Hero');
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
      
      <div className="absolute top-20 start-10 w-72 h-72 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute top-40 end-10 w-72 h-72 bg-brand-peach rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute -bottom-8 start-40 w-72 h-72 bg-brand-purple rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8
            }}
            className="max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-brand-gold/30 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-semibold tracking-wider text-brand-dark uppercase">
                {t('eyebrow')}
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark leading-tight mb-6">
              {t('titleLine1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-goldLight">
                {t('titleLine2')}
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-4 font-medium">
              {t('subtitle')}
            </p>
            <p className="text-base text-gray-500 mb-8">{t('description')}</p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="#products"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold to-brand-goldLight text-white font-semibold shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all hover:-translate-y-1">
                
                {t('ctaExplore')}
              </a>
              <a
                href="#agents"
                className="px-8 py-4 rounded-full bg-white text-brand-dark font-semibold border border-brand-gold/30 shadow-sm hover:bg-brand-cream transition-all hover:-translate-y-1">
                
                {t('ctaAgent')}
              </a>
            </div>

            <div className="flex flex-wrap gap-6 items-center border-t border-brand-pinkDark/30 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center">
                  <Star className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat1Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat1Label')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-peach flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat2Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat2Label')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark">{t('stat3Value')}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t('stat3Label')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[600px] hidden lg:block">
            <motion.div
              animate={{
                y: [0, -15, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-10 end-0 w-3/4 h-3/4 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-20 bg-gradient-to-br from-brand-gold via-[#5B3FD0] to-brand-goldLight">
              {/* brand backdrop: soft glows + infinity rings echoing the logo */}
              <div className="absolute -top-16 -start-16 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-0 end-0 w-80 h-80 rounded-full bg-brand-goldLight/50 blur-3xl" />
              <svg viewBox="0 0 200 100" className="absolute inset-x-0 top-[18%] w-full opacity-25" aria-hidden="true">
                <path d="M100 50c-18-24-52-24-52 0s34 24 52 0 52-24 52 0-34 24-52 0z" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <img
                src="/images/site/hero-doctor.webp"
                alt="Apex Aora Pharmacy pharmacist"
                className="absolute bottom-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 h-[96%] w-auto max-w-none object-contain drop-shadow-[0_20px_30px_rgba(11,31,92,0.35)]" />
              <div className="absolute bottom-5 end-5 flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur px-4 py-2.5 shadow-lg">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-gold to-brand-goldLight flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-sm font-semibold text-brand-dark leading-tight">
                  {t('stat2Value')}
                  <span className="block text-xs font-medium text-gray-500">{t('stat2Label')}</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 15, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
              className="absolute bottom-0 start-0 w-1/2 h-1/2 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-30 bg-[radial-gradient(120%_90%_at_50%_100%,#E2D3F5_0%,#F1E7FA_55%,#ffffff_100%)]">
              <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-brand-goldLight/25 blur-2xl" />
              <img
                src="/images/categories/skin.webp"
                alt="Pharmacy skin care products"
                className="relative w-full h-full object-contain scale-[1.3] origin-bottom translate-y-2 drop-shadow-[0_12px_16px_rgba(11,31,92,0.15)]" />
              
            </motion.div>

            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute top-0 start-10 w-2/5 h-2/5 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-10 bg-gradient-to-br from-white to-brand-peach">
              
              <img
 src="/images/site/hero-store.webp"
                 alt="Skin care products"
                className="w-full h-full object-cover" />
              
            </motion.div>
          </div>
        </div>
      </div>
    </section>);

}