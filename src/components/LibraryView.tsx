import React from 'react';
import { Book, ProcessingTask } from '../types';
import { motion } from 'motion/react';
import { BookOpen, Search, Plus, Loader2, AlertCircle, Camera, X } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  tasks: ProcessingTask[];
  onOpenScanner: () => void;
  onRemoveBook: (id: string) => void;
  onSelectBook: (id: string) => void;
}

export function LibraryView({ books, tasks, onOpenScanner, onRemoveBook, onSelectBook }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> SnapLib
          </h1>
          <div className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
            {books.length} Books
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Processing Queue */}
        {tasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Processing ({tasks.length})
            </h2>
            <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="shrink-0 w-24 h-32 rounded-xl border border-zinc-200 bg-white relative overflow-hidden snap-start flex-col flex"
                >
                  <img
                    src={task.imageUrl}
                    alt="Scanning"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    {task.status === 'processing' && (
                      <Loader2 className="animate-spin text-white mb-1" size={24} />
                    )}
                    {task.status === 'failed' && (
                      <AlertCircle className="text-red-500 mb-1" size={24} />
                    )}
                    <span className="text-[10px] font-medium text-white uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">
                      {task.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Library Grid */}
        <section>
          {filteredBooks.length === 0 && tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
              <p className="text-zinc-500 mb-8 max-w-xs">
                Start scanning your physical books to build your virtual library instantly.
              </p>
              <button
                onClick={onOpenScanner}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
              >
                <Camera size={20} /> Scan First Book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  layoutId={`book-${book.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onSelectBook(book.id)}
                  className="group relative bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-zinc-100">
                    <img
                      src={book.coverImageUrl || book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {book.genre && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                        {book.genre}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-2">{book.author}</p>
                    {book.summary && (
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-auto italic">
                        "{book.summary}"
                      </p>
                    )}
                  </div>
                  
                  {/* Delete Button (Hover/Active) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBook(book.id);
                    }}
                    className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenScanner}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
}


