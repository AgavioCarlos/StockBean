// Polyfill para SockJS en Vite
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Persona from './features/Persona/Persona'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './features/Login/Login';
import Perfil from './features/Perfil/Perfil';
import Categorias from './features/Categorias/Categorias';
import Unidades from './features/Unidades/Unidades'
import Permisos from './features/Permisos/Permisos';
import Inicio from './pages';
import Productos from './features/Producto/Productos'
import Marcas from './features/Marca/Marcas'
import Clientes from './pages/Clientes'
import Proveedores from './features/Proveedores/Proveedores'
import PuntoVenta from './features/Punto_venta/PuntoVenta'
import ProtectedRoute from "./components/ProtectedRoute";
import Configuracion from './features/Configuracion/Configuracion';
import Catalogos from './features/Catalogo/Catalogos';
import Administrador from './pages/Administrador';
import Sucursales from './features/Sucursal/Sucursales';
import Usuarios from './features/Usuario/Usuarios';
import Inventario from './features/Inventario/Inventario';
import HistorialPrecios from './pages/HistorialPrecios';
import Empresas from './pages/Empresas';
import EmpresaUsuario from './pages/EmpresaUsuario';
import Unauthorized from './components/Unauthorized'; // Página de acceso denegado
import ReporteVentas from './features/Reportes/ReporteVentas';
import Suscripciones from './features/Suscripcion/Suscripcion';
// import Suscripciones from './features/Suscripcion/Suscripciones';
import Pantallas from './features/Pantalla/Pantallas';
import Planes from './features/Planes/Planes';
import TiposPrecio from './features/TipoPrecio/TipoPrecio';
import Compras from './features/Compras/Compras';


const router = createBrowserRouter([
  {
    path: "/",
    element: (<Inicio />),
  },
  {
    path: "/home",
    element: (<ProtectedRoute><Home /></ProtectedRoute>),
  },
  {
    path: "/dashboard",
    element: (<ProtectedRoute><Dashboard /></ProtectedRoute>)
  },
  {
    path: "/catalogos",
    element: (<ProtectedRoute><Catalogos /></ProtectedRoute>)
  },
  {
    path: "/configuracion",
    element: (<ProtectedRoute><Configuracion /></ProtectedRoute>)
  },
  {
    path: "/perfil",
    element: (<ProtectedRoute><Perfil /></ProtectedRoute>)
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/productos",
    element: (<ProtectedRoute><Productos /></ProtectedRoute>)
  },
  {
    path: "/persona",
    element: (<ProtectedRoute><Persona /></ProtectedRoute>)
  },
  {
    path: "/categorias",
    element: (<ProtectedRoute><Categorias /></ProtectedRoute>)
  },
  {
    path: "/unidades",
    element: (<ProtectedRoute><Unidades /></ProtectedRoute>)
  },
  {
    path: "/permisos",
    element: (<ProtectedRoute><Permisos /></ProtectedRoute>)
  },
  {
    path: "/marcas",
    element: (<ProtectedRoute><Marcas /></ProtectedRoute>)
  },
  {
    path: "/clientes",
    element: (<ProtectedRoute><Clientes /></ProtectedRoute>)
  },
  {
    path: "/proveedores",
    element: (<ProtectedRoute><Proveedores /></ProtectedRoute>)
  },
  {
    path: "/punto-venta",
    element: (<ProtectedRoute><PuntoVenta /></ProtectedRoute>)
  },
  {
    path: "/administrador",
    element: (<ProtectedRoute><Administrador /></ProtectedRoute>)
  },
  {
    path: "/sucursales",
    element: (<ProtectedRoute><Sucursales /></ProtectedRoute>)
  },
  {
    path: "/usuarios",
    element: (<ProtectedRoute><Usuarios /></ProtectedRoute>)
  },
  {
    path: "/inventario",
    element: (<ProtectedRoute><Inventario /></ProtectedRoute>)
  },
  {
    path: "/historial-precios",
    element: (<ProtectedRoute><HistorialPrecios /></ProtectedRoute>)
  },
  {
    path: "/empresas",
    element: (<ProtectedRoute><Empresas /></ProtectedRoute>)
  },
  {
    path: "/empresa-usuarios",
    element: (<ProtectedRoute><EmpresaUsuario /></ProtectedRoute>)
  },
  {
    path: "/reporte-ventas",
    element: (<ProtectedRoute><ReporteVentas /></ProtectedRoute>)
  },
  {
    path: "/suscripciones",
    element: (<ProtectedRoute><Suscripciones /></ProtectedRoute>)
  },
  {
    path: "/pantallas",
    element: (<ProtectedRoute><Pantallas /></ProtectedRoute>)
  },
  {
    path: "/planes",
    element: (<ProtectedRoute><Planes /></ProtectedRoute>)
  },
  {
    path: "/precio",
    element: (<ProtectedRoute><TiposPrecio /></ProtectedRoute>)
  },
  {
    path: "/compras",
    element: (<ProtectedRoute><Compras /></ProtectedRoute>)
  },

]);

import { AlertProvider } from './context/AlertContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlertProvider>
      <RouterProvider router={router} />
    </AlertProvider>
  </React.StrictMode>,
);