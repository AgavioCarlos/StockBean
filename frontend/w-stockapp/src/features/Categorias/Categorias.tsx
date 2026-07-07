import React, { useState, useEffect } from 'react';
import Breadcrumb from "../../components/Breadcrumb";
import MainLayout from "../../components/Layouts/MainLayout";
import { CategoriasGlobales } from './components/CategoriasGlobales';
import { AsignacionCategoria } from './components/AsignacionCategoria';

const Categorias: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [empresaId, setEmpresaId] = useState<number>(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    const idEmpStr = localStorage.getItem('id_empresa');
    if (idEmpStr) {
      setEmpresaId(parseInt(idEmpStr, 10));
    }
  }, []);

  if (!userData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  // const isSistemas = userData.cuenta === 'sistemas';

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <Breadcrumb
          items={[
            { label: "Catálogo", onClick: () => { } },
            { label: "Categorías" }
          ]}
          onBack={() => { }}
        />
        <CategoriasGlobales />
        {/* {isSistemas ? (
          <CategoriasGlobales />
        ) : (
          <div className="mt-4 flex-1">
            <AsignacionCategoria idEmpresa={empresaId} />
          </div>
        )} */}
      </div>
    </MainLayout>
  );
};

export default Categorias;
