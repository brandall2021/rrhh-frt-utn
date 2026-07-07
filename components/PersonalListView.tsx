"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Users,
  Briefcase,
  Calendar,
  X,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Employee } from "@/types";

interface PersonalListViewProps {
  employees: Employee[];
  onEmployeeClick: (id: string) => void;
  onAddEmployee: (employee: Partial<Employee>) => void;
  searchTerm: string;
}

export default function PersonalListView({
  employees,
  onEmployeeClick,
  onAddEmployee,
  searchTerm: parentSearchTerm,
}: PersonalListViewProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new employee
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newDept, setNewDept] = useState("IT & Desarrollo");
  const [newRole, setNewRole] = useState("");
  const [newCuil, setNewCUIL] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const activeSearchTerm = localSearch || parentSearchTerm;

  // Derive list of unique departments for filter dropdown
  const departments = ["Todos", ...Array.from(new Set(employees.map((e) => e.department)))];

  // Filtering logic
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const searchMatch =
      fullName.includes(activeSearchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(activeSearchTerm.toLowerCase());

    const deptMatch = selectedDept === "Todos" || emp.department === selectedDept;
    const statusMatch =
      selectedStatus === "Todos" ||
      (selectedStatus === "Activo" && emp.status === "ACTIVO") ||
      (selectedStatus === "Inactivo" && emp.status === "INACTIVO");

    return searchMatch && deptMatch && statusMatch;
  });

  // Simple Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;

  const handleAddNewEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newRole) {
      alert("Por favor rellene los campos obligatorios.");
      return;
    }

    const customId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRecord = {
      id: customId,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      department: newDept,
      role: newRole.trim(),
      status: "ACTIVO" as const,
      hireDate: new Date().toISOString().split("T")[0],
      cuil: newCuil || "20-00000000-0",
      email: newEmail || `${newFirstName.toLowerCase().trim()}.${newLastName.toLowerCase().trim()}@precisionhr.com`,
      phone: newPhone || "+54 11 0000-0000",
      birthDate: "1990-01-01",
      maritalStatus: "Soltero",
      address: "Av. Corrientes 1000, CABA",
      emergencyContact: {
        name: "Contacto",
        relationship: "Familiar",
        phone: "+54 11 0000-0000",
      },
    };

    onAddEmployee(newRecord);
    setIsAddModalOpen(false);

    // Reset fields
    setNewFirstName("");
    setNewLastName("");
    setNewRole("");
    setNewCUIL("");
    setNewEmail("");
    setNewPhone("");
    alert(`Legajo de ${newFirstName} creado correctamente con ID ${customId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Search Header Banner */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Lista de Personal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestione y supervise los expedientes, legajos y el estado operativo de su fuerza laboral.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(214, 0, 0,0.3)] border border-brand-light/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
        {/* Text Input search */}
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, ID o cargo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-brand focus:outline-none transition-all text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Depto:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-brand outline-none cursor-pointer"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept} className="bg-slate-950 text-white">
                  {dept === "Todos" ? "Todos los Departamentos" : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-brand outline-none cursor-pointer"
            >
              <option value="Todos" className="bg-slate-950 text-white">Todos los Estados</option>
              <option value="Activo" className="bg-slate-950 text-white">Activo</option>
              <option value="Inactivo" className="bg-slate-950 text-white">Inactivo</option>
            </select>
          </div>

          <button
            onClick={() => {
              setLocalSearch("");
              setSelectedDept("Todos");
              setSelectedStatus("Todos");
              setCurrentPage(1);
            }}
            className="p-1 px-2.5 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Grid count summary */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Total: <strong className="text-brand-light font-bold">{filteredEmployees.length}</strong> empleados activos e inactivos encontrados</span>
      </div>

      {/* Employees Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {paginatedEmployees.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-xs text-slate-500 italic bg-slate-900/30 border border-slate-800 rounded-3xl">
              No se encontraron empleados que coincidan con la búsqueda.
            </div>
          ) : (
            paginatedEmployees.map((emp) => (
              <motion.div
                key={emp.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl hover:border-slate-700/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Title & Initials */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                        {(emp as any).photoUrl ? (
                          <img src={(emp as any).photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{emp.firstName[0]}{emp.lastName[0]}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-xs text-white line-clamp-1">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: #{emp.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded ${
                        emp.status === "ACTIVO"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Employee Details Panel */}
                  <div className="space-y-1.5 text-xs border-t border-slate-800 pt-3 mb-4 font-sans">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-450 text-slate-400">Cargo</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">{emp.role}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-450 text-slate-400">Departamento</span>
                      <span className="text-slate-200 font-semibold">{emp.department}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-450 text-slate-400">Ingreso</span>
                      <span className="text-slate-200 font-mono">
                        {emp.hireDate.split(", ")[1] || emp.hireDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons with click triggers */}
                <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => onEmployeeClick(emp.id)}
                    className="flex-1 bg-brand/10 hover:bg-brand hover:text-white text-brand-light border border-brand/20 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center"
                  >
                    Ver Perfil / Legajo
                  </button>
                  <button
                    onClick={() => onEmployeeClick(emp.id)}
                    className="w-8 h-8 flex items-center justify-center border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination component */}
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-3xl border border-slate-800 text-xs">
        <p className="text-slate-400">
          Mostrando {filteredEmployees.length === 0 ? 0 : startIndex + 1} a{" "}
          {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} de {filteredEmployees.length} empleados
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
               key={i}
               onClick={() => setCurrentPage(i + 1)}
               className={`w-6 h-6 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                 currentPage === i + 1
                   ? "bg-brand text-white border-transparent"
                   : "border-slate-800 text-slate-400 hover:bg-slate-800"
               }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1 border border-slate-800 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Add Employee Modal Integration */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-md w-full relative text-slate-100"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-transparent flex-row">
              <h3 className="text-sm font-bold text-white">Registrar Nuevo Empleado</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Form list scrollable */}
            <form onSubmit={handleAddNewEmployeeSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase text-left">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Alejandro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase text-left">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Martínez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase text-left">Cargo / Rol *</label>
                <input
                  type="text"
                  required
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Departamento</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:ring-1 focus:ring-brand focus:outline-none"
                  >
                    <option value="IT & Desarrollo" className="bg-slate-955 text-white">IT & Desarrollo</option>
                    <option value="Recursos Humanos" className="bg-slate-955 text-white">Recursos Humanos</option>
                    <option value="Operaciones" className="bg-slate-955 text-white">Operaciones</option>
                    <option value="Ventas" className="bg-slate-955 text-white">Ventas</option>
                    <option value="Administración" className="bg-slate-955 text-white">Administración</option>
                    <option value="Marketing" className="bg-slate-955 text-white">Marketing</option>
                    <option value="Finanzas" className="bg-slate-955 text-white">Finanzas</option>
                  </select>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CUIL / CUIT</label>
                  <input
                    type="text"
                    value={newCuil}
                    onChange={(e) => setNewCUIL(e.target.value)}
                    placeholder="20-12345678-9"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand focus:outline-none focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Corporativo</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. user@precisionhr.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Personal</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+54 11 0000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-650 focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800 flex-row mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-transparent border border-slate-800 hover:bg-slate-800 rounded-xl py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-xl py-2 text-xs font-semibold hover:bg-brand transition-all cursor-pointer border border-brand/10 shadow-[0_0_15px_rgba(214, 0, 0,0.2)]"
                >
                  Subir Legajo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
