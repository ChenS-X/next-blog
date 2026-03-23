import { Mail, Github, Twitter, Linkedin, MapPin, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <header className="mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-stone-900 dark:text-stone-100">
          About Me.
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
          I'm a software engineer and designer focused on building clean, 
          functional, and user-centric digital experiences. I love exploring 
          the intersection of technology and minimalism.
        </p>
        
        <div className="flex flex-wrap gap-6 mt-8">
          <a href="mailto:sxchen136@gmail.com" className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
            <Mail className="w-4 h-4" />
            sxchen136@gmail.com
          </a>
          <div className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400">
            <MapPin className="w-4 h-4" />
            San Francisco, CA
          </div>
        </div>
      </header>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Experience
        </h2>
        <div className="space-y-12">
          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Senior Software Engineer</h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">2022 — Present</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">TechFlow Systems</p>
            <p className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              Leading the frontend architecture for our core analytics platform. 
              Focused on performance optimization and implementing a scalable design system.
            </p>
          </div>

          <div className="relative pl-8 border-l border-stone-100 dark:border-stone-900">
            <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Full Stack Developer</h3>
              <span className="text-sm font-mono text-stone-400 dark:text-stone-600">2019 — 2022</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 font-medium mb-4">Creative Logic Agency</p>
            <p className="text-stone-500 dark:text-stone-500 text-sm leading-relaxed">
              Developed custom web applications for various clients using React, Node.js, and PostgreSQL. 
              Collaborated closely with designers to ensure pixel-perfect implementations.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">Frontend</h3>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> React / Next.js</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> TypeScript</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Tailwind CSS</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Framer Motion</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">Backend & Tools</h3>
            <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Node.js / Express</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> PostgreSQL / MongoDB</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Docker / AWS</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> Git / CI/CD</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-600 mb-10">
          Education
        </h2>
        <div className="space-y-8">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">B.S. Computer Science</h3>
              <span className="text-xs font-mono text-stone-400 dark:text-stone-600">2015 — 2019</span>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-500">University of California, Berkeley</p>
          </div>
        </div>
      </section>

      <footer className="pt-12 border-t border-stone-100 dark:border-stone-900">
        <div className="flex gap-6">
          <a href="#" className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="#" className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
