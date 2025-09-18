export default function BackNavigation() {
  return (
    <nav className="border-b shadow-md dark:bg-stm-dark">
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <a
          href="/"
          className="inline-flex mr-auto items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-600"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Stations
        </a>
        <div className="flex flex-wrap justify-center gap-8 max-xs:hidden">
          <a
            href="/svgs/planmetropolitain.svg"
            className="max-md:hidden px-3 py-1 border border-blue-300 text-blue-600 dark:text-blue-400 bg-white dark:bg-stm-dark rounded hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 transition text-sm font-normal shadow-none"
          >
            View Metropolitan Map
          </a>
          <a
            href="/svgs/a-plan-metro-noir.svg"
            className="px-3 py-1 border border-blue-300 text-blue-600 dark:text-blue-400 bg-white dark:bg-stm-dark rounded hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 transition text-sm font-normal shadow-none"
          >
            View Metro Map
          </a>
        </div>
      </div>
    </nav>
  );
}
