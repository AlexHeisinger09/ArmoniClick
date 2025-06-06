import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PatientGrid from './components/PatientGrid';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <Header /> */}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <PatientGrid />
        </main>
      </div>
    </div>
  );
}

export default App;