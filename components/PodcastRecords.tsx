import React, { useState } from 'react';
import { PodcastRecord } from '../App';
import { ChevronDownIcon, YouTubeIcon, PlayIcon } from './icons';

interface PodcastRecordsProps {
    records: PodcastRecord[];
}

// Placeholder data for YouTube podcasts - easy to edit later
const youtubePodcasts = [
    {
        id: 1,
        title: "English with Eric",
        description: "Official channel for mastering English with fun, engaging lessons.",
        thumbnailClass: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/20",
        iconColor: "text-red-600",
        link: "https://www.youtube.com/@LearnEngwithEric"
    },
    {
        id: 2,
        title: "Daily Conversation",
        description: "Listen to real-life dialogues and improve your listening skills.",
        thumbnailClass: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
        iconColor: "text-blue-600",
        link: "https://www.youtube.com/results?search_query=english+daily+conversation"
    },
    {
        id: 3,
        title: "Grammar Mastery",
        description: "Deep dive into grammar rules with clear explanations and examples.",
        thumbnailClass: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20",
        iconColor: "text-green-600",
        link: "https://www.youtube.com/results?search_query=english+grammar+mastery"
    },
    {
        id: 4,
        title: "Business English",
        description: "Professional vocabulary and phrases for the workplace.",
        thumbnailClass: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20",
        iconColor: "text-purple-600",
        link: "https://www.youtube.com/results?search_query=business+english+podcast"
    }
];

const PodcastItem: React.FC<{
    record: PodcastRecord;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
}> = ({ record, isExpanded, onToggleExpand }) => (
    <div className="bg-white/60 dark:bg-black/20 rounded-xl overflow-hidden transition-all duration-300 shadow-lg border border-slate-100 dark:border-white/5">
        <div className="p-4">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 truncate pr-4">{record.topic}</h3>
            </div>
            <div className="mt-4">
                <audio controls src={record.audioUrl} className="w-full rounded-lg accent-cyan-500 h-10">
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
        <div className="border-t border-slate-100 dark:border-white/5">
            <button
                onClick={() => onToggleExpand(record.id)}
                className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none transition-colors"
            >
                <span>{isExpanded ? 'Hide' : 'Show'} Script</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 bg-slate-50 dark:bg-black/30 text-left border-t border-slate-100 dark:border-white/5">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-sans leading-relaxed">{record.script}</pre>
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
        <div className="flex flex-col lg:flex-row gap-8 pb-10">
            {/* Left Column: Saved Podcasts (2/3) */}
            <div className="w-full lg:w-2/3 space-y-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent inline-block">
                    Saved Podcasts
                </h2>
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
                        <div className="text-center py-12 px-6 bg-white/60 dark:bg-black/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Your library is empty.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Generated podcasts will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Youtube Podcast (1/3) */}
            <div className="w-full lg:w-1/3 space-y-6">
                 <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent inline-block">
                    Youtube Podcast
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                     {youtubePodcasts.map((podcast) => (
                        <a 
                            key={podcast.id} 
                            href={podcast.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 group hover:border-red-500/50 hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`aspect-video ${podcast.thumbnailClass} relative flex items-center justify-center overflow-hidden`}>
                                <YouTubeIcon className={`w-14 h-14 ${podcast.iconColor} z-10 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300`} />
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent"></div>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center">
                                    <PlayIcon className="w-3 h-3 mr-1" />
                                    Watch
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-red-500 transition-colors line-clamp-1">{podcast.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{podcast.description}</p>
                            </div>
                        </a>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default PodcastRecords;