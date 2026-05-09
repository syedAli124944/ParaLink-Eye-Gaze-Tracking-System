import { useState, useEffect } from 'react';
import { X, Newspaper, TrendingUp, Globe, Heart, Lightbulb, Calendar, ChevronLeft, Clock } from 'lucide-react';
import { ttsService } from '../services/TtsService.js';
import { useEog } from '../contexts/EogContext.jsx';
import { useEogSelection } from '../hooks/useEogSelection.js';
import { useDoubleBlink } from '../hooks/useDoubleBlink.js';

const newsData = {
  health: {
    title: 'Health Tips',
    icon: Heart,
    color: 'from-teal-500 to-emerald-600',
    articles: [
      {
        title: 'Daily Exercises for Mobility',
        time: '2h ago',
        content: 'Maintaining mobility is crucial. Gentle stretching, focused breathing, and regular joint rotation can significantly improve quality of life. Always consult with your therapist before starting a new routine.\n\n1. Neck rotations\n2. Shoulder shrugs\n3. Ankle circles\n4. Deep breathing exercises',
      },
      {
        title: 'Hydration & Nutrition Guide',
        time: '5h ago',
        content: 'Proper hydration supports brain function and energy levels. Aim for small, frequent sips of water throughout the day. Include fiber-rich foods and lean proteins in your diet for sustained energy and better digestion.',
      },
    ],
  },
  tech: {
    title: 'Assistive Tech',
    icon: Lightbulb,
    color: 'from-blue-500 to-indigo-600',
    articles: [
      {
        title: 'New Eye-Tracking Breakthrough',
        time: '1d ago',
        content: 'Scientists have developed a new sensor that can detect eye movements with 99% accuracy using simple skin-contact electrodes. This breakthrough could make EOG systems more accessible and affordable for home use.',
      },
      {
        title: 'Voice Synthesis Advancements',
        time: '2d ago',
        content: 'The latest AI-driven voice synthesis models can now replicate human emotion and tone with incredible realism. This makes communication for non-verbal patients feel more personal and natural.',
      },
    ],
  },
  global: {
    title: 'World News',
    icon: Globe,
    color: 'from-purple-500 to-violet-600',
    articles: [
      {
        title: 'Global Healthcare Summit 2026',
        time: '3h ago',
        content: 'Leaders from around the world met today to discuss universal access to assistive technologies. The summit concluded with a pledge to reduce tariffs on medical-grade sensors and specialized communication hardware.',
      },
      {
        title: 'Space Exploration Update',
        time: '12h ago',
        content: 'The first permanent lunar habitat successfully completed its oxygen filtration test today. This marks a major milestone in human space colonization and long-term research beyond Earth.',
      },
    ],
  },
  trending: {
    title: 'Trending',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
    articles: [
      {
        title: 'Community Success Stories',
        time: '4h ago',
        content: 'A local student used an EOG system to complete his university degree, inspiring thousands. These stories highlight how technology can bridge the gap between ability and opportunity.',
      },
      {
        title: 'Accessible Design Awards',
        time: '8h ago',
        content: 'The winners of this year\'s Universal Design Awards were announced. Top honors went to a new modular wheelchair system and a highly intuitive communication interface for specialized care.',
      },
    ],
  },
};

const categories = Object.entries(newsData).map(([id, data]) => ({
  id,
  ...data,
}));

export function NewsModal({ onClose }) {
  const { language, blinkCount } = useEog();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleBack = () => {
    ttsService.stop();
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onClose();
    }
  };

  useDoubleBlink(handleBack);

  const { eogProps: closeProps } = useEogSelection({
    id: 'news-close',
    label: 'Close News',
    onSelect: onClose,
  });

  const { eogProps: backProps } = useEogSelection({
    id: 'news-back',
    label: 'Go Back',
    onSelect: handleBack,
  });

  const { eogProps: readAloudProps } = useEogSelection({
    id: 'news-read-aloud',
    label: 'Read Aloud',
    onSelect: () => selectedArticle && ttsService.speak(selectedArticle.content, language),
  });

  // Render Article Detail
  if (selectedArticle) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
          <div className={`sticky top-0 bg-gradient-to-r ${newsData[selectedCategory].color} text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10`}>
            <div className="flex items-center gap-3">
              <button {...backProps} onClick={handleBack} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{selectedArticle.title}</h2>
            </div>
            <button {...closeProps} onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{selectedArticle.time}</span>
              <button {...readAloudProps} onClick={() => ttsService.speak(selectedArticle.content, language)} 
                className="ml-auto px-4 py-1.5 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 transition-colors">
                🔊 Read Aloud
              </button>
            </div>
            <div className="prose prose-lg max-w-none">
              {selectedArticle.content.split('\n').map((line, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Article List
  if (selectedCategory) {
    const cat = newsData[selectedCategory];
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
          <div className={`sticky top-0 bg-gradient-to-r ${cat.color} text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10`}>
            <div className="flex items-center gap-3">
              <button {...backProps} onClick={handleBack} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold">{cat.title}</h2>
            </div>
            <button {...closeProps} onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {cat.articles.map((article, idx) => (
              <ArticleRow key={idx} article={article} index={idx} onSelect={() => setSelectedArticle(article)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Category Selection
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">News Portal</h2>
          <button {...closeProps} onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:sm:grid-cols-2 gap-4">
          {categories.map((cat, index) => (
            <NewsCategoryCard key={cat.id} category={cat} index={index} onSelect={() => setSelectedCategory(cat.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsCategoryCard({ category, index, onSelect }) {
  const Icon = category.icon;
  const { blinkCount } = useEog();
  const { isFocused, eogProps } = useEogSelection({
    id: `news-cat-${category.id}`,
    label: category.title,
    onSelect,
  });

  return (
    <button
      {...eogProps}
      onClick={onSelect}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${category.color} text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
        isFocused ? 'ring-4 ring-white ring-offset-2 scale-105' : ''
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-white/20 rounded-2xl">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <span className="text-xl font-bold">{category.title}</span>
      </div>
      {isFocused && (
        <div className="absolute top-2 right-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
          {blinkCount}/3
        </div>
      )}
    </button>
  );
}

function ArticleRow({ article, index, onSelect }) {
  const { blinkCount } = useEog();
  const { isFocused, eogProps } = useEogSelection({
    id: `news-article-${index}`,
    label: article.title,
    onSelect,
  });

  return (
    <button
      {...eogProps}
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
        isFocused ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-100 hover:border-blue-200'
      }`}
    >
      <div>
        <h4 className="font-bold text-gray-800">{article.title}</h4>
        <p className="text-sm text-gray-500">{article.time}</p>
      </div>
      {isFocused && (
        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
          {blinkCount}/3
        </span>
      )}
    </button>
  );
}
