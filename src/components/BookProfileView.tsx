import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, FileText, Building2, Tag, Trash2, Target, Zap, Quote, Lightbulb, BookOpen, Loader2, PlayCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { ComprehensiveGuideView } from './ComprehensiveGuideView';

interface BookProfileViewProps {
  book: Book;
  onClose: () => void;
  onRemoveBook: (id: string) => void;
  onGenerateGuide: (id: string) => Promise<void>;
  onFetchReviewsAndVideos: (id: string) => Promise<void>;
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

export function BookProfileView({ book, onClose, onRemoveBook, onGenerateGuide, onFetchReviewsAndVideos }: BookProfileViewProps) {
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'videos'>('overview');
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);
  const [visibleVideosCount, setVisibleVideosCount] = useState(5);

  useEffect(() => {
    if (activeTab !== 'videos') {
      setVisibleVideosCount(5);
    }
  }, [activeTab]);

  useEffect(() => {
    if ((activeTab === 'reviews' || activeTab === 'videos') && !book.reviews && !book.videos && !isFetchingMedia) {
      setIsFetchingMedia(true);
      onFetchReviewsAndVideos(book.id).finally(() => setIsFetchingMedia(false));
    }
  }, [activeTab, book.reviews, book.videos, book.id, onFetchReviewsAndVideos, isFetchingMedia]);

  const handleGenerateGuide = async () => {
    if (book.comprehensiveGuide) {
      setShowGuide(true);
      return;
    }

    setIsGeneratingGuide(true);
    try {
      await onGenerateGuide(book.id);
      setShowGuide(true);
    } catch (error) {
      console.error('Failed to generate guide:', error);
      alert('Failed to generate comprehensive guide. Please try again.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-40 bg-white overflow-y-auto"
      >
        {/* Header / Hero Image */}
        <div className="relative h-72 w-full bg-zinc-900 overflow-hidden">
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-110"
            style={{ backgroundImage: `url(${book.coverImageUrl || book.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Top Navigation */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => {
                onRemoveBook(book.id);
                onClose();
              }}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Foreground Book Cover */}
          <div className="absolute -bottom-12 left-6 z-20" style={{ perspective: '1000px' }}>
            <motion.div 
              whileHover={{ rotateY: -15, rotateX: 5, scale: 1.05 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-32 h-48 rounded-r-lg rounded-l-sm shadow-2xl bg-white border border-zinc-200/50"
            >
              <img
                src={book.coverImageUrl || book.imageUrl}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover rounded-r-lg rounded-l-sm"
              />
              {/* Spine effect */}
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/20 to-transparent rounded-l-sm" />
              {/* Inner shadow */}
              <div className="absolute inset-0 rounded-r-lg rounded-l-sm shadow-[inset_4px_0_10px_rgba(0,0,0,0.1)] pointer-events-none" />
              {/* Pages edge (3D effect) */}
              <div 
                className="absolute top-1 bottom-1 right-0 w-4 bg-zinc-100 rounded-r-sm border-y border-r border-zinc-300" 
                style={{ transform: 'rotateY(90deg) translateZ(2px)', transformOrigin: 'right' }} 
              />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-6 pb-32 max-w-2xl mx-auto">
          {/* Title & Author */}
          <div className="mb-6">
            {book.genre && (
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                {book.genre}
              </span>
            )}
            <h1 className="text-3xl font-bold text-zinc-900 leading-tight mb-1">
              {book.title}
            </h1>
            <p className="text-xl text-zinc-500 font-medium">{book.author}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-zinc-100">
            <div className="flex flex-col items-center text-center">
              <Calendar className="text-zinc-400 mb-1" size={20} />
              <span className="text-sm font-semibold text-zinc-900">
                {book.publishedYear || 'Unknown'}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Year</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-zinc-100">
              <FileText className="text-zinc-400 mb-1" size={20} />
              <span className="text-sm font-semibold text-zinc-900">
                {book.pageCount ? `${book.pageCount}` : 'Unknown'}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Pages</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-zinc-100">
              <Building2 className="text-zinc-400 mb-1" size={20} />
              <span className="text-sm font-semibold text-zinc-900 line-clamp-1 px-1">
                {book.publisher || 'Unknown'}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Publisher</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-200 mb-8 sticky top-0 bg-white z-10 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >
              <BookOpen size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'reviews' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >
              <MessageSquare size={18} /> Reviews
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'videos' ? 'border-orange-600 text-orange-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
            >
              <PlayCircle size={18} /> Videos
            </button>
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Generate Guide Button */}
              <div className="mb-10">
                <button
                  onClick={handleGenerateGuide}
                  disabled={isGeneratingGuide}
                  className="w-full bg-zinc-900 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingGuide ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Generating Multi-Page Guide...
                    </>
                  ) : (
                    <>
                      <BookOpen size={24} className={book.comprehensiveGuide ? "text-orange-400" : "text-zinc-400"} />
                      {book.comprehensiveGuide ? 'Read Comprehensive Guide' : 'Generate Comprehensive Guide'}
                    </>
                  )}
                </button>
                {!book.comprehensiveGuide && !isGeneratingGuide && (
                  <p className="text-xs text-center text-zinc-500 mt-3">
                    Uses advanced AI to generate a massive, multi-page deep dive into the book.
                  </p>
                )}
              </div>

              {/* 3-Sentence Summary (World Class) */}
              {book.threeSentenceSummary && (
                <div className="mb-10 bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                  <h2 className="text-sm font-bold text-orange-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-orange-500" /> The Book in 3 Sentences
                  </h2>
                  <p className="text-orange-950 font-medium text-lg leading-relaxed">
                    {book.threeSentenceSummary}
                  </p>
                </div>
              )}

              {/* Target Audience */}
              {book.targetAudience && (
                <div className="mb-10 flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl shrink-0">
                    <Target size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-1">Who Should Read It?</h2>
                    <p className="text-zinc-600 leading-relaxed">{book.targetAudience}</p>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {book.keyTakeaways && book.keyTakeaways.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <Lightbulb size={24} className="text-amber-500" /> Key Takeaways
                  </h2>
                  <div className="space-y-6">
                    {book.keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 text-lg mb-1">{takeaway.title}</h3>
                          <p className="text-zinc-600 leading-relaxed">{takeaway.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Advice */}
              {book.actionableAdvice && (
                <div className="mb-10 bg-zinc-900 text-white rounded-2xl p-6 shadow-xl">
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Actionable Advice</h2>
                  <p className="text-lg font-medium leading-relaxed">
                    {book.actionableAdvice}
                  </p>
                </div>
              )}

              {/* Notable Quote */}
              {book.notableQuote && (
                <div className="mb-12 text-center px-4">
                  <Quote size={32} className="text-zinc-200 mx-auto mb-4" />
                  <blockquote className="text-xl font-serif text-zinc-800 italic leading-relaxed mb-4">
                    "{book.notableQuote}"
                  </blockquote>
                  <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full" />
                </div>
              )}

              {/* Full Synopsis (Collapsible or just at the bottom) */}
              {book.description && (
                <div className="mb-8 pt-8 border-t border-zinc-200">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">Full Synopsis</h2>
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Themes */}
              {book.themes && book.themes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag size={16} className="text-zinc-400" /> Themes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {book.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-sm rounded-lg font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Content: Reviews */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {isFetchingMedia ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
                  <p className="font-medium">Finding real reviews from readers and press...</p>
                </div>
              ) : book.reviews && book.reviews.length > 0 ? (
                book.reviews.map((review, idx) => (
                  <div key={idx} className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${review.type === 'press' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-zinc-900">{review.author}</h3>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          {review.source} • <span className={review.type === 'press' ? 'text-orange-600' : 'text-emerald-600'}>{review.type === 'press' ? 'Press/Critique' : 'Reader Review'}</span>
                        </p>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          <span className="font-bold text-amber-600">{review.rating}</span>
                          <span className="text-xs text-amber-400">/ 5</span>
                        </div>
                      )}
                    </div>
                    <p className="text-zinc-700 italic leading-relaxed text-sm">"{review.text}"</p>
                    {review.url && (
                      <a 
                        href={review.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-wider text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Read full review <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
                  <MessageSquare size={32} className="mx-auto mb-3 text-zinc-400" />
                  <p>No reviews found for this book.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Content: Videos */}
          {activeTab === 'videos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {isFetchingMedia ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
                  <p className="font-medium">Finding YouTube videos and playlists...</p>
                </div>
              ) : book.videos && book.videos.length > 0 ? (
                <>
                  {book.videos.slice(0, visibleVideosCount).map((video, idx) => {
                    const videoId = getYouTubeId(video.url);
                    return (
                      <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                        {videoId ? (
                          <div className="aspect-video w-full bg-zinc-900">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center">
                            <p className="text-zinc-500 text-sm">Video cannot be embedded</p>
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold text-zinc-900 line-clamp-2 mb-1 leading-snug">{video.title}</h3>
                          <p className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                            <PlayCircle size={14} /> {video.channel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {visibleVideosCount < book.videos.length && (
                    <div className="flex justify-center pt-2 pb-6">
                      <button
                        onClick={() => setVisibleVideosCount(prev => prev + 5)}
                        className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors"
                      >
                        Load More Videos
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
                  <PlayCircle size={32} className="mx-auto mb-3 text-zinc-400" />
                  <p>No videos found for this book.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <ComprehensiveGuideView
            book={book}
            onClose={() => setShowGuide(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
