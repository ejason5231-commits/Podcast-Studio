
import React, { useState } from 'react';
import { PodcastRecord } from '../App';
import { ChevronDownIcon } from './icons';

interface PodcastRecordsProps {
    records: PodcastRecord[];
}

const PodcastItem: React.FC<{
    record: PodcastRecord;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
}> = ({ record, isExpanded, onToggleExpand }) => (
    <div className="bg-white/60 dark:bg-black/20 rounded-xl overflow-hidden transition-all duration-300 shadow-lg">
        <div className="p-4">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-semibold text-cyan-500 dark:text-cyan-400 truncate pr-4">{record.topic}</h3>
            </div>
            <div className="mt-4">
                <audio controls src={record.audioUrl} className="w-full rounded-lg accent-cyan-500">
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
        <div>
            <button
                onClick={() => onToggleExpand(record.id)}
                className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none"
            >
                <span>{isExpanded ? 'Hide' : 'Show'} Script</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 bg-slate-50 dark:bg-black/20">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-sans">{record.script}</pre>
                </div>
            )}
        </div>
    </div>
);


const PodcastRecords: React.FC<PodcastRecordsProps> = ({ records }) => {
    const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedRecordId(expandedRecordId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                 {records.length > 0 ? (
                    records.slice().reverse().map(record => (
                        <PodcastItem
                            key={record.id}
                            record={record}
                            isExpanded={expandedRecordId === record.id}
                            onToggleExpand={toggleExpand}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 px-4 bg-white/60 dark:bg-black/20 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">You haven't saved any podcasts yet.</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Go to the generator and click 'Save' to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PodcastRecords;
