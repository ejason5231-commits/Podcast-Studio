import React, { useState } from 'react';
import { PodcastRecord } from '../App';
import { ChevronDownIcon, StarIcon } from './icons';

interface PodcastRecordsProps {
    records: PodcastRecord[];
}

const featuredPodcasts = [
    {
        id: 1,
        topic: 'The Secrets of Deep Ocean Life',
        rating: 5,
        audioUrl: '#',
        script: `Alex: Welcome to 'Science Uncovered'. Today, we're diving deep into the Mariana Trench. What secrets does it hold?\nDr. Eva: The pressure is immense, and light is non-existent. Yet, life thrives. We've found unique species like the ghostfish, adapted to this extreme environment.`
    },
    {
        id: 2,
        topic: 'A Brief History of Ancient Rome',
        rating: 5,
        audioUrl: '#',
        script: `Marco: On 'Echoes of Time', we journey back to the Roman Empire. How did a small city-state come to rule the known world?\nClara: It was a combination of military innovation, political strategy, and an incredible engineering prowess. Their roads and aqueducts are legendary for a reason.`
    },
    {
        id: 3,
        topic: 'The Art of Mindful Cooking',
        rating: 4,
        audioUrl: '#',
        script: `Host: Today on 'Kitchen Zen', we're exploring mindful cooking. It's not just about the food, is it?\nChef: Not at all. It's about being present with each ingredient, each chop, each stir. It transforms a daily chore into a meditative practice.`
    },
    {
        id: 4,
        topic: 'Understanding Quantum Computing',
        rating: 5,
        audioUrl: '#',
        script: `Interviewer: Quantum computing sounds like science fiction. Can you break it down for us?\nScientist: Think of it this way: a normal computer uses bits, which are 0s or 1s. A quantum computer uses qubits, which can be both 0 and 1 at the same time. This allows it to solve problems at speeds we can't even imagine.`
    },
    {
        id: 5,
        topic: 'The Future of Mars Colonization',
        rating: 4,
        audioUrl: '#',
        script: `Host: Is living on Mars a realistic goal for humanity?\nExpert: It's the most ambitious project we've ever conceived. The challenges are enormous—from creating a breathable atmosphere to protecting against radiation. But the drive to explore is part of who we are.`
    }
];

const Rating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);


const PodcastRecords: React.FC<PodcastRecordsProps> = ({ records }) => {
    const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedRecordId(expandedRecordId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-300">Podcast Library</h2>
                <p className="text-gray-400">A curated collection of featured podcasts.</p>
            </div>
            <div className="space-y-4">
                {featuredPodcasts.map(record => (
                    <div key={record.id} className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden transition-all duration-300">
                        <div className="p-4">
                             <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-cyan-400 truncate pr-4">{record.topic}</h3>
                                <Rating rating={record.rating} />
                            </div>
                            <div className="mt-4">
                                <audio controls src={record.audioUrl} className="w-full rounded-lg accent-cyan-500">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </div>
                        <div className="border-t border-gray-700">
                            <button
                                onClick={() => toggleExpand(record.id)}
                                className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 focus:outline-none"
                            >
                                <span>{expandedRecordId === record.id ? 'Hide' : 'Show'} Script</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${expandedRecordId === record.id ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedRecordId === record.id && (
                                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{record.script}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PodcastRecords;