import { VirtualTour } from '@/types/virtualTour'

interface Props {
    vt: VirtualTour
    onClick?: (vt: VirtualTour) => void
}

export default function VirtualTourCard({ vt, onClick }: Props) {
    return (
        <div
            className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer overflow-hidden border border-gray-200 max-w-xs w-full"
            onClick={() => onClick?.(vt)}
        >
            <div className="h-40 bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-5xl font-bold opacity-30">
                    {vt.name?.charAt(0) ?? 'V'}
                </span>
            </div>
            <div className="p-5">
                <h2 className="text-xl font-bold mb-2 text-gray-800 truncate">{vt.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{vt.description}</p>
                <button
                    className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    onClick={e => {
                        e.stopPropagation()
                        onClick?.(vt)
                    }}
                >
                    Lihat Sphere
                </button>
            </div>
            <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow">
                Virtual Tour
            </div>
        </div>
    )
}