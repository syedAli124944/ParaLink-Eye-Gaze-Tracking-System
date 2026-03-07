import { X, Newspaper, TrendingUp, Globe, Heart, Lightbulb, Calendar } from 'lucide-react';

const newsCategories = [
  {
    id: 'health',
    title: 'Health Tips',
    description: 'Daily wellness advice and health updates',
    icon: Heart,
    color: 'from-rose-400 to-pink-500',
    hoverColor: 'hover:from-rose-500 hover:to-pink-600',
  },
  {
    id: 'world',
    title: 'World News',
    description: 'Stay informed about global events',
    icon: Globe,
    color: 'from-blue-400 to-indigo-500',
    hoverColor: 'hover:from-blue-500 hover:to-indigo-600',
  },
  {
    id: 'trending',
    title: 'Trending Topics',
    description: 'What everyone is talking about',
    icon: TrendingUp,
    color: 'from-orange-400 to-red-500',
    hoverColor: 'hover:from-orange-500 hover:to-red-600',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Tips for better living',
    icon: Lightbulb,
    color: 'from-yellow-400 to-orange-500',
    hoverColor: 'hover:from-yellow-500 hover:to-orange-600',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Upcoming events and activities',
    icon: Calendar,
    color: 'from-teal-400 to-cyan-500',
    hoverColor: 'hover:from-teal-500 hover:to-cyan-600',
  },
  {
    id: 'daily',
    title: 'Daily Digest',
    description: 'Your personalized news summary',
    icon: Newspaper,
    color: 'from-green-400 to-emerald-500',
    hoverColor: 'hover:from-green-500 hover:to-emerald-600',
  },
];

export function NewsModal({ onClose }) {
  const handleCategoryClick = (category) => {
    alert(`Opening: ${category.title}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">News & Updates</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            Choose a category to explore
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {newsCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`bg-gradient-to-br ${category.color} ${category.hoverColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left animate-slide-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{category.title}</h3>
                      <p className="text-white/90 text-xs sm:text-sm">{category.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
