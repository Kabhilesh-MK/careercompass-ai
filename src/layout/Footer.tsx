import { Compass, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
            <Compass size={15} />
          </div>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            © 2026 CareerCompass AI. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-gray-400 hover:text-primary transition"><Github size={16} /></a>
          <a href="#" className="text-gray-400 hover:text-primary transition"><Linkedin size={16} /></a>
          <a href="#" className="text-gray-400 hover:text-primary transition"><Twitter size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
