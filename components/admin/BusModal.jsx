'use client';

import { Fragment, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Error } from '@/components/svg';

export default function BusModal({ isOpen, onClose, bus, onSave }) {
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: '',
    status: 'active',
    driver: '',
    school: '',
    lastMaintenance: '',
  });

  useEffect(() => {
    if (bus) {
      setFormData(bus);
    } else {
      setFormData({
        plateNumber: '',
        capacity: '',
        status: 'active',
        driver: '',
        school: '',
        lastMaintenance: '',
      });
    }
  }, [bus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <Dialog.Close className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                {bus ? 'Modifier le bus' : 'Nouveau bus'}
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">
                    Numéro d'immatriculation
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    id="plateNumber"
                    required
                    value={formData.plateNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacité
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    id="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    name="status"
                    id="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="active">Actif</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="driver" className="block text-sm font-medium text-gray-700">
                    Chauffeur
                  </label>
                  <input
                    type="text"
                    name="driver"
                    id="driver"
                    required
                    value={formData.driver}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                    Établissement
                  </label>
                  <input
                    type="text"
                    name="school"
                    id="school"
                    required
                    value={formData.school}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700">
                    Dernière maintenance
                  </label>
                  <input
                    type="date"
                    name="lastMaintenance"
                    id="lastMaintenance"
                    required
                    value={formData.lastMaintenance}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                  >
                    {bus ? 'Modifier' : 'Ajouter'}
                  </button>
                  <Dialog.Close className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                    Annuler
                  </Dialog.Close>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}