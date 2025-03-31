
import React from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}