"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Package, Loader2 } from "lucide-react";
import { updateRentalStatus } from "./actions";

export function RentalActions({ rentalId, currentStatus }: { rentalId: number, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState("");

  const handleAction = async (status: string) => {
    setIsLoading(true);
    setAction(status);
    try {
      await updateRentalStatus(rentalId, status);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Failed to update status: " + err.message);
      } else {
        alert("Failed to update status.");
      }
    } finally {
      setIsLoading(false);
      setAction("");
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {currentStatus === "pending" && (
        <>
          <button
            onClick={() => handleAction("approved")}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            {isLoading && action === "approved" ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            <span>Approve Request</span>
          </button>
          <button
            onClick={() => handleAction("cancelled")}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            {isLoading && action === "cancelled" ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            <span>Reject / Cancel</span>
          </button>
        </>
      )}

      {currentStatus === "approved" && (
        <button
          onClick={() => handleAction("returned")}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          {isLoading && action === "returned" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
          <span>Mark as Returned</span>
        </button>
      )}

      {currentStatus === "returned" && (
        <div className="text-green-600 font-bold flex items-center bg-green-50 px-6 py-3 rounded-xl border border-green-100">
          <CheckCircle className="w-5 h-5 mr-2" />
          Rental completely processed.
        </div>
      )}
      
      {currentStatus === "cancelled" && (
        <div className="text-red-600 font-bold flex items-center bg-red-50 px-6 py-3 rounded-xl border border-red-100">
          <XCircle className="w-5 h-5 mr-2" />
          Rental was cancelled.
        </div>
      )}
    </div>
  );
}
