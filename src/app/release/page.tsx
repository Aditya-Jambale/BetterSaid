import Link from 'next/link';
import { Sparkles, Rocket, Heart, GitBranch, Shield } from 'lucide-react';

export const metadata = {
  title: 'BetterSaid Release & Vision',
  description: 'Roadmap, philosophy, and the solo builder story behind BetterSaid.'
};

export default function ReleasePage() {
  const year = new Date().getFullYear();
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent)]">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-400/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-5 py-16 sm:py-24 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="text-2xl leading-snug sm:text-4xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">BetterSaid</span>
              <span className="block sm:ml-2 sm:inline text-gray-800 dark:text-gray-100">Release Notes &amp; Vision</span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-3xl font-medium">
            BetterSaid is an ongoing craft project focused on one belief: <span className="text-purple-600 dark:text-purple-400 font-semibold">great prompts unlock great AI</span>. This page shares where we are, where we are headed, and the solo builder behind it.
          </p>

          <section className="space-y-10">
            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-purple-200/40 dark:border-purple-800/40">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-500" /> Current Beta (Open Access)
              </h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-5">
                <li>Core prompt enhancement pipeline powered by modern LLM strategies.</li>
                <li>Transparent improvement insights to help you learn prompt engineering patterns.</li>
                <li>History syncing (local to cloud migration) with privacy-first handling.</li>
                <li>Thoughtful UI focused on clarity, speed and mobile friendliness.</li>
                <li>No billing yet – usage limits are lightweight and experimental.</li>
              </ul>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-indigo-200/40 dark:border-indigo-800/40">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-500" /> Near-Term Roadmap
              </h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-5">
                <li>Adaptive enhancement modes (creative / technical / concise / structured).</li>
                <li>Model‑specific prompt tuning for ChatGPT, Gemini & Claude (format, style & token efficiency).</li>
                <li>Prompt template library & community sharables.</li>
                <li>Export recipes (Markdown, system + user role segmentation, JSON spec mode).</li>
                <li>Frictionless iteration flow (side-by-side compare + revert snapshots).</li>
                <li>Early team collaboration primitives (shared collections).</li>
              </ul>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-emerald-200/40 dark:border-emerald-800/40">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Principles
              </h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-5">
                <li><span className="font-semibold">Model aware:</span> Tailor outputs to strengths & formatting expectations of ChatGPT, Gemini & Claude automatically.</li>
                <li><span className="font-semibold">Human learning loop:</span> Every enhancement explains why — you leave with skill, not mystery.</li>
                <li><span className="font-semibold">Outcome oriented:</span> Optimize for clarity, guardrails, and measurable AI response quality.</li>
                <li><span className="font-semibold">Respect & privacy:</span> Minimal transient processing; no silent data hoarding.</li>
                <li><span className="font-semibold">Fast, focused, frictionless:</span> Fewer buttons, more signal — polish beats bloat.</li>
              </ul>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-pink-200/40 dark:border-pink-800/40">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> The Builder
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Hi, I&apos;m <a href="https://www.linkedin.com/in/adityajambale" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 dark:text-purple-400 underline decoration-dotted underline-offset-2 hover:decoration-solid">Aditya Jambale</a> — a solo entrepreneur with a deep curiosity for GenAI and prompt design. BetterSaid is my effort to make high‑quality AI interaction accessible, educational and genuinely productive.
              </p>
              <p className="mt-3 text-sm sm:text-base leading-relaxed">
                I believe we&apos;re still early in how humans shape AI behavior. The next wave of leverage won&apos;t just come from bigger models, but from tooling that helps people express intent precisely. That&apos;s the gap I&apos;m exploring.
              </p>
              <p className="mt-3 text-sm sm:text-base leading-relaxed">
                If this resonates, I&apos;d love to hear from you. Your feedback, edge cases and aspirational workflows guide what ships next.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-gray-200/40 dark:border-gray-800/40">
              <h2 className="text-xl font-semibold mb-3">Get Involved</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-5">
                <li>Use the enhancer and share prompts that didn&apos;t improve as expected.</li>
                <li>Suggest learning metrics you&apos;d like to see (clarity scoring, tone control, structure audits).</li>
                <li>Request integrations or formats that would unlock workflows for you.</li>
              </ul>
            </div>
          </section>

          <div className="mt-16 flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
              ← Back to app
            </Link>
          </div>

          <div className="mt-20 text-center text-xs text-gray-500 dark:text-gray-500">
            © {year} BetterSaid • Built by <a href="https://www.linkedin.com/in/adityajambale" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Aditya Jambale</a>
          </div>
        </div>
      </div>
    </main>
  );
}
