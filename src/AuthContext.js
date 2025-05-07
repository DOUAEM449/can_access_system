// src/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
