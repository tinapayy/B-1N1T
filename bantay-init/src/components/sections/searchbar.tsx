"use client";

import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";

export function SearchBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <div className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-md">
      {/* Mobile Menu Button - Only visible on sm screens */}
      <button
        type="button"
        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search City"
        className="w-full md:w-96 px-4 py-2 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      {/* Notification Icon */}
      <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200">
        <Bell className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}
