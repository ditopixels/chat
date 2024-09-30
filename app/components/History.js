import React from 'react';

const Navbar = ({ threadHistory, setThreadId }) => {
  return (
    <nav className="bg-gray-800 p-4 shadow-md h-screen max-w-[300px]">
      <div className="container mx-auto flex justify-between items-center flex-col">
        {/* Logo */}
        <div className="text-white font-bold text-xl">
          Bancolombia
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex flex-col justify-center mt-3">

          {/* Iterating over threadHistory to create buttons */}
          {threadHistory && threadHistory.length > 0 ? (
            threadHistory.map((thread) => {
              // Find the first message from the user
              const userMessage = thread.messages.find(
                (message) => message.role === 'user'
              );

              // Fallback to 'Hilo {thread.id}' if no message or no user message
              const threadName = userMessage
                ? userMessage.content
                : `Hilo ${thread.id}`;

              return (
                <button
                  key={thread.id} // Use a unique key for each button
                  className="text-gray-300 hover:text-white transition duration-200 text-left truncate mb-3" // Ensure text is truncated
                  style={{
                    maxWidth: '250px', // Limit the width for truncation
                  }}
                  onClick={() => setThreadId( thread.id )}
                >
                  {threadName}
                </button>
              );
            })
          ) : (
            <span className="text-gray-400">No hay historial de hilos</span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
