import { useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { TokenCard } from './TokenCard';
import { Token } from '../types';
import { useSwipeStore } from '../store/swipeStore';

interface SwipeInterfaceProps {
  tokens: Token[];
  currentCategory: string;
}

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  tokens,
  currentCategory
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const { likeToken, dislikeToken } = useSwipeStore();

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      setExitX(300);
      likeToken(tokens[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      dislikeToken(tokens[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, tokens, likeToken, dislikeToken]);

  if (currentIndex >= tokens.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No more tokens in this category</p>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Refresh Tokens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full max-w-md mx-auto">
      {tokens.slice(currentIndex, currentIndex + 3).reverse().map((token, index) => (
        <motion.div
          key={token.address}
          className="absolute w-full h-full"
          style={{
            zIndex: tokens.length - currentIndex - index,
            scale: 1 - index * 0.1,
            y: index * 10,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={index === 2 ? { x: exitX } : { x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <TokenCard token={token} />
        </motion.div>
      ))}
      
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center space-x-8">
        <button
          onClick={() => {
            setExitX(-300);
            dislikeToken(tokens[currentIndex]);
            setCurrentIndex(prev => prev + 1);
          }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-lg hover:bg-red-200 transition-colors"
        >
          <span className="text-red-500 text-2xl">✕</span>
        </button>
        
        <button
          onClick={() => {
            setExitX(300);
            likeToken(tokens[currentIndex]);
            setCurrentIndex(prev => prev + 1);
          }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-lg hover:bg-green-200 transition-colors"
        >
          <span className="text-green-500 text-2xl">✓</span>
        </button>
      </div>
    </div>
  );
};
