import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { Certificate } from '@/types/careerCompass';
import { StatusBadge } from './StatusBadge';
import { SkillTag } from './SkillTag';

interface CertificateCardProps {
  certificate: Certificate;
  className?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-elevated transition-all ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <StatusBadge
            label={certificate.status}
            size="xs"
            variant={
              certificate.status === 'Verified' ? 'success' : 'neutral'
            }
            icon={certificate.status === 'Verified' ? <ShieldCheck size={11} /> : undefined}
          />
        </div>

        <div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
            {certificate.provider}
          </p>
          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight mt-0.5">
            {certificate.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1">
          {certificate.skills.map((skill, idx) => (
            <SkillTag key={idx} name={skill} size="xs" variant="verified" />
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>Issued: {certificate.issueDate}</span>
          </div>
          <p className="font-mono text-[10px] text-gray-400 dark:text-slate-500 truncate">
            ID: {certificate.credentialId}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
        {certificate.verificationUrl && certificate.verificationUrl !== '#' && (
          <a
            href={certificate.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Verify Credential</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </motion.div>
  );
};
