import { useState, useMemo } from "react";
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

  // Update selected direction when group changes
  const handleGroupChange = (group: GroupedTransfer) => {
    if (selectedGroup === group) {
      setSelectedGroup(null);
      setSelectedDirection(null);
      return;
    }
    setSelectedGroup(group);
    setSelectedDirection(group.directions[0]);
  };

  if (groupedTransfers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transfers</h2>

      {/* Transfer Group Selection Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {groupedTransfers.map((group, index) => (
          <button
            key={index}
            onClick={() => handleGroupChange(group)}
            className={clsx(
              "flex flex-wrap items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
              selectedGroup === group
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          {/* Direction Selection (if multiple directions available) */}
          {selectedGroup.directions.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Choose Direction
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedGroup.directions.map((direction, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDirection(direction)}
                    className={clsx(
                      "text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                      selectedDirection === direction
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex flex-wrap gap-y-2 items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Show fromDirection if there are multiple different ones */}
                        {hasMultipleFromDirections(selectedGroup) &&
                          direction.fromDirection && (
                            <>
                              <LinePill line={direction.from} />
                              <span className="text-gray-700 font-medium">
                                {direction.fromDirection}
                              </span>
                              <span className="text-gray-400">→</span>
                            </>
                          )}

                        <LinePill line={direction.to} />

                        {/* Show toDirection if there are multiple different ones */}
                        {hasMultipleToDirections(selectedGroup) &&
                          direction.toDirection && (
                            <span className="text-gray-700 font-medium">
                              {direction.toDirection}
                            </span>
                          )}

                        {/* If only one type of direction varies, show it */}
                        {!hasMultipleFromDirections(selectedGroup) &&
                          !hasMultipleToDirections(selectedGroup) &&
                          direction.toDirection && (
                            <span className="text-gray-700 font-medium">
                              {direction.toDirection}
                            </span>
                          )}
                      </div>
                      {direction.optimalBoarding && (
                        <span className="text-sm text-yellow-600 font-medium">
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
              <div className="max-md:hidden flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
                  <span className="text-lg font-semibold text-gray-900">
                    From
                  </span>
                  <LinePill line={selectedDirection.from} />
                  {selectedDirection.fromDirection && (
                    <span className="text-gray-600">
                      {selectedDirection.fromDirection}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center space-x-3 mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    To
                  </span>
                  <LinePill line={selectedDirection.to} />
                  {selectedDirection.toDirection && (
                    <span className="text-gray-600">
                      {selectedDirection.toDirection}
                    </span>
                  )}
                </div>

                {/* Optimal Boarding Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                      <h4 className="font-medium text-yellow-800 mb-1">
                        {selectedDirection.optimalBoarding
                          ? "Optimal Boarding"
                          : "Transfer Instructions"}
                      </h4>
                      <p className="text-yellow-700 text-sm">
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
                    <div className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
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
