import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import {
  ShieldAlert,
  Scale,
  Database,
  CheckCircle,
  Lock,
  Eye,
  FileText,
  Cookie,
  type LucideIcon,
} from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import {
  legalText,
  type LegalDocument,
  type LegalIcon,
  type LegalRichText,
  type LegalSection,
} from "@/lib/i18n/public/legal";

export async function generateMetadata(): Promise<Metadata> {
  const doc = legalText[await getServerLocale()].privacy;
  return { title: doc.metaTitle, description: doc.metaDescription };
}

export default async function PrivacyPolicyPage() {
  const doc = legalText[await getServerLocale()].privacy;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1 py-16 px-4 sm:px-6">
        <LegalDocumentView doc={doc} />
      </main>
      <Footer />
    </div>
  );
}

// Same renderer as the KVKK and cookie pages; a shared component would remove the copies.
const ICONS: Record<LegalIcon, LucideIcon> = {
  scale: Scale,
  database: Database,
  check: CheckCircle,
  lock: Lock,
  eye: Eye,
  file: FileText,
  cookie: Cookie,
};

function RichText({ runs }: { runs: LegalRichText }) {
  return (
    <>
      {runs.map((run, i) => {
        if (typeof run === "string") return <React.Fragment key={i}>{run}</React.Fragment>;
        if ("strong" in run)
          return (
            <strong key={i} className="font-semibold text-slate-900">
              {run.strong}
            </strong>
          );
        return (
          <code key={i} className="font-mono text-accent-700">
            {run.code}
          </code>
        );
      })}
    </>
  );
}

function SectionView({ section }: { section: LegalSection }) {
  const Icon = section.icon ? ICONS[section.icon] : null;
  const headingId = `section-${section.id}`;

  return (
    <section aria-labelledby={headingId} className={section.table ? "space-y-4" : "space-y-2"}>
      <h2 id={headingId} className="text-base font-bold text-slate-900 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-accent-700 shrink-0" aria-hidden="true" />}
        {section.heading}
      </h2>

      {section.paragraphs?.map((paragraph, i) => (
        <p key={i}>
          <RichText runs={paragraph} />
        </p>
      ))}

      {section.items && (
        <ul className="list-disc list-inside space-y-1 text-slate-500 pl-2">
          {section.items.map((item, i) => (
            <li key={i}>
              <RichText runs={item} />
            </li>
          ))}
        </ul>
      )}

      {section.table && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <caption className="sr-only">{section.table.caption}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono">
                {section.table.columns.map((column) => (
                  <th key={column} scope="col" className="py-2.5 px-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {section.table.rows.map(([name, category, duration, purpose]) => (
                <tr key={name} className="hover:bg-slate-50">
                  <th scope="row" className="py-3 px-3 font-mono text-accent-700 font-semibold">
                    {name}
                  </th>
                  <td className="py-3 px-3 text-slate-600">{category}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">{duration}</td>
                  <td className="py-3 px-3 text-slate-600 leading-normal">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div
        role="note"
        className="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/30 flex items-start gap-3 text-xs text-accent-800"
      >
        <ShieldAlert className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold block text-sm">{doc.noticeTitle}</span>
          <RichText runs={doc.notice} />
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">{doc.title}</h1>
        <p className="text-xs text-slate-500 font-mono mt-2">{doc.versionLine}</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 text-slate-600 text-xs sm:text-sm/5 leading-relaxed">
        {doc.sections.map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
