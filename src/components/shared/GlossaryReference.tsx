/**
 * Fix 12 — GlossaryReference Component
 * Accessible glossary / acronym reference from any stage.
 * Petroleum engineering has hundreds of acronyms that newcomers struggle with.
 */
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { searchAcronyms, ACRONYM_DATABASE } from '../../lib/glossaryAcronyms';

export interface GlossaryReferenceProps {
    /** Optional: show only acronyms related to specific category */
    category?: string;
}

const GlossaryReference: React.FC<GlossaryReferenceProps> = ({ category }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const entries = useMemo(() => {
        const source = category
            ? ACRONYM_DATABASE.filter((a) => a.category === category || a.category === 'general')
            : ACRONYM_DATABASE;
        if (!query.trim()) return source;
        return searchAcronyms(query).filter((a) =>
            source.some((s) => s.acronym === a.acronym)
        );
    }, [query, category]);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(true)}
                title="Glossary & Acronyms"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    color: '#7c3aed',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                }}
            >
                <BookOpen size={14} />
                Glossary
            </button>

            {/* Overlay modal */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div
                        style={{
                            width: 'min(700px, 90vw)',
                            maxHeight: 'min(80vh, 700px)',
                            background: '#0f172a',
                            border: '1px solid #1e293b',
                            borderRadius: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: '1px solid #1e293b',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <BookOpen size={18} style={{ color: '#a78bfa' }} />
                                <h2 style={{
                                    fontSize: 14,
                                    fontWeight: 900,
                                    color: '#f8fafc',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    margin: 0,
                                }}>
                                    Petroleum Engineering Glossary
                                </h2>
                                <span style={{
                                    fontSize: 10,
                                    color: '#64748b',
                                    fontFamily: 'monospace',
                                }}>
                                    {ACRONYM_DATABASE.length} acronyms
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: 4,
                                    borderRadius: 8,
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    placeholder="Search acronym or term (e.g., STOIIP, PVT, SCAL)..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 36px',
                                        borderRadius: 12,
                                        border: '1px solid #334155',
                                        background: '#1e293b',
                                        color: '#f8fafc',
                                        fontSize: 13,
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Entries */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                            {entries.length === 0 ? (
                                <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: 40 }}>
                                    No acronyms found for "{query}"
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {entries.map((entry, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: 12,
                                                background: i % 2 === 0 ? '#1e293b' : 'transparent',
                                                border: i % 2 === 0 ? '1px solid #334155' : '1px solid transparent',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                                                <span style={{
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    color: '#a78bfa',
                                                    fontFamily: 'monospace',
                                                    letterSpacing: '0.05em',
                                                }}>
                                                    {entry.acronym}
                                                </span>
                                                <span style={{
                                                    fontSize: 12,
                                                    color: '#94a3b8',
                                                    fontWeight: 500,
                                                }}>
                                                    {entry.fullName}
                                                </span>
                                                {entry.category && (
                                                    <span style={{
                                                        fontSize: 9,
                                                        color: '#64748b',
                                                        background: '#1e293b',
                                                        padding: '1px 8px',
                                                        borderRadius: 9999,
                                                        textTransform: 'uppercase',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                    }}>
                                                        {entry.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{
                                                fontSize: 12,
                                                color: '#cbd5e1',
                                                margin: 0,
                                                lineHeight: 1.5,
                                            }}>
                                                {entry.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '10px 20px',
                            borderTop: '1px solid #1e293b',
                            fontSize: 10,
                            color: '#475569',
                            textAlign: 'center',
                        }}>
                            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · petroleum engineering terminology reference
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GlossaryReference;