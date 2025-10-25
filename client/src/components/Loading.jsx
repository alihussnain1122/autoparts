const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{text}</span>
    </div>
  );
};

export default Loading;