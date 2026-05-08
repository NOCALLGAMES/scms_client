import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmationModal from "../shared/components/common/ConfirmationModal";

const ConfirmationContext = createContext(null);

export const ConfirmationProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      setModalConfig({
        ...config,
        isOpen: true,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onClose: () => {
          setModalConfig(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {modalConfig && (
        <ConfirmationModal
          isOpen={modalConfig.isOpen}
          onClose={modalConfig.onClose}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          cancelLabel={modalConfig.cancelLabel}
          type={modalConfig.type}
          isLoading={modalConfig.isLoading}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmationProvider");
  }
  return context;
};
