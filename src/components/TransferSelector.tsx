import { useState, useMemo, useRef } from "react";
import LinePill from "./LinePill";
import type { Line } from "../content.config";
import clsx from "clsx";

interface TransferWithData {
  from: Line;
  to: Line;
  fromDirection: string | null;
  toDirection: string | null;
  optimalBoarding: string | null;
  description?: string;
}

interface GroupedTransfer {
  from: Line;
  to: Line;
  directions: TransferWithData[];
}

interface TransferSelectorProps {
  transfers: TransferWithData[];
}

export default function TransferSelector({ transfers }: TransferSelectorProps) {
  // Group transfers by from/to line combinations
  const groupedTransfers = useMemo(() => {
    const groups = new Map<string, GroupedTransfer>();

    transfers.forEach((transfer) => {
      const key = `${transfer.from.id}-${transfer.to.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          from: transfer.from,
          to: transfer.to,
          directions: [],
        });
      }
      groups.get(key)!.directions.push(transfer);
    });

    return Array.from(groups.values());
  }, [transfers]);

  // Check if a group has different fromDirections or toDirections
  const hasMultipleFromDirections = (group: GroupedTransfer) => {
    const fromDirections = new Set(
      group.directions.map((d) => d.fromDirection).filter(Boolean)
    );
    return fromDirections.size > 1;
  };

  const hasMultipleToDirections = (group: GroupedTransfer) => {
    const toDirections = new Set(
      group.directions.map((d) => d.toDirection).filter(Boolean)
    );
    return toDirections.size > 1;
  };

  const [selectedGroup, setSelectedGroup] = useState<GroupedTransfer | null>(
    null
  );

  const [selectedDirection, setSelectedDirection] =
    useState<TransferWithData | null>(selectedGroup?.directions[0] || null);

  // Ref for scrolling to transfer details on mobile
  const transferDetailsRef = useRef<HTMLDivElement>(null);

  // Update selected direction when group changes
  const handleGroupChange = (group: GroupedTransfer) => {
    if (selectedGroup === group) {
      setSelectedGroup(null);
      setSelectedDirection(null);
      return;
    }
    setSelectedGroup(group);
    setSelectedDirection(group.directions[0]);
    scrollIntoView();
  };

  // Handle direction selection with scroll on mobile
  const scrollIntoView = () => {
    // Scroll to transfer details on mobile devices (viewport width < 768px)
    if (window.innerWidth < 768) {
      setTimeout(() => {
        transferDetailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100); // Small delay to ensure DOM has updated
    }
  };

  if (groupedTransfers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">
        Transfers
      </h2>

      {/* Transfer Group Selection Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {groupedTransfers.map((group, index) => (
          <button
            key={index}
            onClick={() => handleGroupChange(group)}
            className={clsx(
              "flex flex-wrap items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
              selectedGroup === group
                ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/50 dark:border-blue-400"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:bg-stm-black/50 dark:border-white"
            )}
          >
            <LinePill line={group.from} />
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <LinePill line={group.to} />
            {group.directions.length > 1 && (
              <span className="max-xs:hidden ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                {group.directions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Transfer Details */}
      {selectedGroup && (
        <div
          ref={transferDetailsRef}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 dark:bg-stm-black/50 dark:border-white/50"
        >
          {/* Direction Selection (if multiple directions available) */}
          {selectedGroup.directions.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 dark:text-white">
                Choose Direction
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedGroup.directions.map((direction, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDirection(direction)}
                    className={clsx(
                      "flex-1 basis-1/3 text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                      selectedDirection === direction
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50 dark:border-blue-400"
                        : "border-gray-200 hover:border-gray-300 dark:bg-stm-black/50 dark:border-white"
                    )}
                  >
                    <div className="flex flex-col gap-y-2 items-center justify-between">
                      <div className="flex flex-col w-full space-x-3">
                        {/* Show fromDirection if there are multiple different ones */}
                        {hasMultipleFromDirections(selectedGroup) &&
                          direction.fromDirection && (
                            <>
                              <div className="flex flex-wrap items-center justify-between w-full">
                                <LinePill line={direction.from} />
                                <span className="text-gray-700 font-medium dark:text-white">
                                  {direction.fromDirection}
                                </span>
                              </div>
                              <span className="text-gray-400 mx-auto">
                                <svg
                                  className="w-6 h-6"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path fill="currentColor" d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
                                </svg>
                              </span>
                            </>
                          )}

                        <div className="flex flex-wrap items-center justify-between w-full">
                          <LinePill line={direction.to} />

                          {/* Show toDirection if there are multiple different ones */}
                          {hasMultipleToDirections(selectedGroup) &&
                            direction.toDirection && (
                              <span className="text-gray-700 font-medium dark:text-white">
                                {direction.toDirection}
                              </span>
                            )}
                        </div>
                      </div>
                      {direction.optimalBoarding && (
                        <span className="ml-auto text-sm text-yellow-600 font-medium dark:text-yellow-400">
                          Board: {direction.optimalBoarding}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Details */}
          {selectedDirection && (
            <div className="flex items-start space-x-4">
              {/* Transfer Direction Icon */}
              <div className="max-md:hidden flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-500/20">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>

              <div className="flex-1">
                {/* Transfer Description */}
                <div className="flex flex-wrap items-center space-x-3 mb-3">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    From
                  </span>
                  <LinePill line={selectedDirection.from} />
                  {selectedDirection.fromDirection && (
                    <span className="text-gray-600 dark:text-white">
                      {selectedDirection.fromDirection}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center space-x-3 mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    To
                  </span>
                  <LinePill line={selectedDirection.to} />
                  {selectedDirection.toDirection && (
                    <span className="text-gray-600 dark:text-white">
                      {selectedDirection.toDirection}
                    </span>
                  )}
                </div>

                {/* Optimal Boarding Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/30 dark:border-yellow-200/30">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1 dark:text-yellow-300">
                        {selectedDirection.optimalBoarding
                          ? "Optimal Boarding"
                          : "Transfer Instructions"}
                      </h4>
                      <p className="text-yellow-700 text-sm dark:text-yellow-200">
                        {selectedDirection.optimalBoarding
                          ? `Best to board in ${selectedDirection.optimalBoarding}`
                          : selectedDirection.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom Description */}
                {selectedDirection.description &&
                  selectedDirection.optimalBoarding && (
                    <div className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg dark:bg-stm-black/50 dark:border dark:border-white/50 dark:text-white">
                      {selectedDirection.description}
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
