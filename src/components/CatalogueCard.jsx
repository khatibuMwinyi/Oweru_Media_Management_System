const CatalogueCard = ({ title, description, Icon }) => {
  return (
    <article
      className="
        group
        h-full
        bg-white
        rounded-2xl
        border border-gray-100
        p-6 sm:p-7
        shadow-sm
        hover:shadow-lg
        transition-all duration-300
        focus-within:ring-2 focus-within:ring-[#f0a71e]
      "
    >
      {/* Icon Container */}
      <div
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-4 sm:mb-5"
        style={{ backgroundColor: "#f0a71e" }}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">
        {description}
      </p>
    </article>
  );
};

export default CatalogueCard;
