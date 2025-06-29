import React from 'react';

export const BoltBadge: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-105 transition-transform duration-200"
      >
        <img
          src="https://github.com/kickiniteasy/bolt-hackathon-badge/blob/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.png?raw=true"
          alt="Built with Bolt.new"
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
};