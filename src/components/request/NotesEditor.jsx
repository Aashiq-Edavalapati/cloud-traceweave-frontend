'use client';
import { useAppStore } from '@/store/useAppStore';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { commands } from '@uiw/react-md-editor';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

export default function NotesEditor() {
    const { activeTabId, requestNotes, updateRequestNote } = useAppStore();
    const note = (requestNotes && requestNotes[activeTabId]) || '';

    return (
        <div className="flex flex-col h-full bg-bg-base" data-color-mode="dark">
            <div className="px-4 py-2 border-b border-border-subtle bg-bg-subtle/30 flex justify-between items-center">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Documentation
                </span>
                <span className="text-[10px] text-text-muted">
                    GitHub-flavored Markdown
                </span>
            </div>

            <div className="flex-1 overflow-hidden relative p-1">
                <MDEditor
                    value={note}
                    onChange={(val) => updateRequestNote(activeTabId, val || '')}
                    height="100%"
                    visibleDragbar={false}
                    preview="live"

                    // 2. Customize the Left Toolbar (Add H1, H2, H3)
                    commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.hr,
                        commands.divider,
                        commands.title1, // H1
                        commands.title2, // H2
                        commands.title3, // H3
                        commands.divider,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.checkedListCommand,
                        commands.divider,
                        commands.link,
                        commands.quote,
                        commands.codeBlock,
                        commands.image,
                    ]}

                    // 3. Customize the Right Toolbar
                    extraCommands={[
                        commands.codeLive,
                        commands.codeEdit,
                        commands.codePreview,
                    ]}

                    style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                    }}
                    className="!bg-bg-base !text-text-primary !border-none"
                />
            </div>
        </div>
    );
}