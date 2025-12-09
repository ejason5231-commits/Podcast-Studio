import React, { useState, useRef, useEffect } from 'react';
import { PodcastRecord } from '../App';
import { ChevronDownIcon, YouTubeIcon, PlayIcon, ArrowLeftIcon, CloseIcon } from './icons';

interface PodcastRecordsProps {
    records: PodcastRecord[];
}

// Placeholder data for YouTube podcasts - easy to edit later
const youtubePodcasts = [
    {
        id: 1,
        title: "Meet Someone & Talk About Weather",
        description: "Easy English Podcast for Beginners (A1–A2)",
        thumbnailClass: "bg-slate-900",
        iconColor: "text-blue-500",
        link: "https://youtu.be/pwAo98xsOv8",
        imageUrl: "https://img.youtube.com/vi/pwAo98xsOv8/hqdefault.jpg",
        videoId: "pwAo98xsOv8"
    },
    {
        id: 2,
        title: "Asking for Help",
        description: "Easy English Podcast for Beginners (A1-A2)",
        thumbnailClass: "bg-slate-900", 
        iconColor: "text-red-600",
        link: "https://youtu.be/1dj3QI1Z5kI",
        imageUrl: "https://img.youtube.com/vi/1dj3QI1Z5kI/hqdefault.jpg",
        videoId: "1dj3QI1Z5kI"
    },
    {
        id: 3,
        title: "Daily Conversation",
        description: "Listen to real-life dialogues and improve your listening skills.",
        thumbnailClass: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/20",
        iconColor: "text-blue-600",
        link: "https://www.youtube.com/results?search_query=english+daily+conversation",
        imageUrl: undefined
    },
    {
        id: 4,
        title: "Grammar Mastery",
        description: "Deep dive into grammar rules with clear explanations and examples.",
        thumbnailClass: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/20",
        iconColor: "text-green-600",
        link: "https://www.youtube.com/results?search_query=english+grammar+mastery",
        imageUrl: undefined
    },
    {
        id: 5,
        title: "Business English",
        description: "Professional vocabulary and phrases for the workplace.",
        thumbnailClass: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/20",
        iconColor: "text-purple-600",
        link: "https://www.youtube.com/results?search_query=business+english+podcast",
        imageUrl: undefined
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
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const toggleExpand = (id: number) => {
        setExpandedRecordId(expandedRecordId === id ? null : id);
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Calculate center position: (Total Height - Visible Height) / 2
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            if (scrollHeight > clientHeight) {
                container.scrollTop = (scrollHeight - clientHeight) / 2;
            }
        }
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10">
            {/* Youtube Podcast (1/3) */}
            <div className="w-full lg:w-1/3 space-y-6">
                 <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent inline-block">
                    Youtube Podcast
                </h2>
                {/* Vertical Scrollable Thumbnails - 2 Column Grid */}
                <div 
                    ref={scrollContainerRef}
                    className="grid grid-cols-2 gap-3 overflow-y-auto h-[600px] pb-4 scroll-smooth custom-scrollbar pr-2"
                >
                     {youtubePodcasts.map((podcast) => (
                        <a 
                            key={podcast.id} 
                            href={podcast.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => {
                                if (podcast.videoId) {
                                    e.preventDefault();
                                    setPlayingVideoId(podcast.videoId);
                                }
                            }}
                            className="w-full block bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 group hover:border-red-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                        >
                            <div className={`aspect-video ${podcast.thumbnailClass} relative flex items-center justify-center overflow-hidden`}>
                                {podcast.imageUrl ? (
                                    <>
                                        <img src={podcast.imageUrl} alt={podcast.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-300">
                                            <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
                                                <YouTubeIcon className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <YouTubeIcon className={`w-10 h-10 ${podcast.iconColor} z-10 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300`} />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent"></div>
                                    </>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded flex items-center z-20">
                                    <PlayIcon className="w-2 h-2 mr-1" />
                                    Watch
                                </div>
                            </div>
                            <div className="p-2">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-red-500 transition-colors line-clamp-2 leading-tight mb-1">{podcast.title}</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">{podcast.description}</p>
                            </div>
                        </a>
                     ))}
                </div>

                {/* Youtube Channel Link Button */}
                <a 
                    href="https://www.youtube.com/@LearnEngwithEric" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-red-500/50 group transition-all duration-300"
                >
                    <span className="font-semibold text-slate-700 dark:text-gray-200 group-hover:text-red-600 transition-colors">Find more on YouTube</span>
                    <ArrowLeftIcon className="w-5 h-5 text-gray-400 group-hover:text-red-600 rotate-180 group-hover:-translate-x-1 transition-all" />
                </a>
            </div>

            {/* Saved Podcasts (2/3) */}
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

            {/* Video Modal */}
            {playingVideoId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPlayingVideoId(null)}>
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                        <button 
                            className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors backdrop-blur-md" 
                            onClick={() => setPlayingVideoId(null)}
                            title="Close Video"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PodcastRecords;