const TimeCard = ({ id, text, additionalClassName, onClick }) => {
  return (
    <div
      key={id}
      className={`hover:border-red-600 hover:cursor-pointer px-2 border-2 rounded-md ${additionalClassName}`}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default TimeCard;
