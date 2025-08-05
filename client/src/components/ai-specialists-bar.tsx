import { Badge } from "@/components/ui/badge";

export default function AISpecialistsBar() {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-6">
        <span className="text-sm font-medium text-gray-700">Active Specialists:</span>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-white border-orange-200 text-gray-700">
            <svg className="w-3 h-3 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Code AI
          </Badge>
          
          <Badge variant="secondary" className="bg-white border-pink-200 text-gray-700">
            <svg className="w-3 h-3 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zm7-13a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1h1zm3 0a1 1 0 011 1v5a1 1 0 01-1 1h-1a1 1 0 01-1-1V3a1 1 0 011-1h1z" clipRule="evenodd" />
            </svg>
            Design AI
          </Badge>
          
          <Badge variant="secondary" className="bg-white border-purple-200 text-gray-700">
            <svg className="w-3 h-3 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Writing AI
          </Badge>
          
          <Badge variant="secondary" className="bg-white border-blue-200 text-gray-700">
            <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Analysis AI
          </Badge>
        </div>
      </div>
    </div>
  );
}
