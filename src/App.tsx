/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  initialEmployees,
  initialRequests,
  initialConflicts,
} from "./data";
import { Employee, LeaveRequest, RequestState } from "./types";

// Import view components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import PersonalListView from "./components/PersonalListView";
import EmployeeProfileView from "./components/EmployeeProfileView";
import NewRequestView from "./components/NewRequestView";
import ReportsView from "./components/ReportsView";

export default function App() {
  // Navigation & State Engine
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("EMP-2941");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Global transactional mock state
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [conflicts, setConflicts] = useState(initialConflicts);

  // Handle approvals
  const handleApproveRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: RequestState.APROBADO } : r))
    );

    // Dynamic feedback to user
    const found = requests.find((r) => r.id === id);
    if (found) {
      // Trigger a direct document version log warning to the Employee profile if desired
      alert(`Acción procesada: Solicitud de ${found.employeeName} aprobada.`);
    }
  };

  // Handle rejections
  const handleRejectRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: RequestState.RECHAZADO } : r))
    );

    const found = requests.find((r) => r.id === id);
    if (found) {
      alert(`Acción procesada: Solicitud de ${found.employeeName} rechazada.`);
    }
  };

  // Handle adding employees
  const handleAddEmployee = (newEmp: Partial<Employee>) => {
    setEmployees((prev) => [newEmp as Employee, ...prev]);
  };

  // Handle submitting leave requests from form
  const handleAddLeaveRequest = (newReq: Partial<LeaveRequest>) => {
    setRequests((prev) => [newReq as LeaveRequest, ...prev]);
  };

  // Screen opening selectors
  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setCurrentView("employee-view");
  };

  const handleNewRequestClick = () => {
    setCurrentView("new-request");
  };

  // Active employee record lookup
  const activeEmployee = employees.find((emp) => emp.id === selectedEmployeeId) || employees[0];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans select-none antialiased text-[#f1f5f9]">
      {/* Global Application Nav Bar */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSearchTerm("");
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Primary Split Workspace Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side menu */}
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setSearchTerm("");
          }}
          onNewRequestClick={handleNewRequestClick}
        />

        {/* Center Canvas Pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === "dashboard" && (
              <DashboardView
                requests={requests}
                conflicts={conflicts}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                onNewRequestClick={handleNewRequestClick}
                onEmployeeClick={handleEmployeeClick}
              />
            )}

            {currentView === "personal" && (
              <PersonalListView
                employees={employees}
                onEmployeeClick={handleEmployeeClick}
                onAddEmployee={handleAddEmployee}
                searchTerm={searchTerm}
              />
            )}

            {currentView === "employee-view" && activeEmployee && (
              <EmployeeProfileView
                employee={activeEmployee}
                onBackClick={() => setCurrentView("personal")}
                allLeaveRequests={requests}
              />
            )}

            {currentView === "new-request" && (
              <NewRequestView
                employees={employees.filter((e) => e.status === "ACTIVO")}
                onBackClick={() => setCurrentView("dashboard")}
                onSubmitRequest={handleAddLeaveRequest}
              />
            )}

            {currentView === "reports" && <ReportsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

