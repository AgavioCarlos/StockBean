import {
    FiBox,
    FiLayers,
    FiUsers,
    FiTag,
    FiTruck,
    FiMapPin,
    FiClipboard,
    FiGrid,
    FiShoppingCart,
    FiPackage,
    FiDollarSign,
    FiFileText,
    FiHome,
    FiSettings,
    FiUser,
    FiShield,
} from "react-icons/fi";
import { BsMenuButton, BsCashCoin } from "react-icons/bs";
import { RiAdminLine } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import { TbReportAnalytics } from "react-icons/tb";
import { FaUsers, FaUser } from "react-icons/fa";
import { CgScreen } from "react-icons/cg";
import { BiUnite } from "react-icons/bi";
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { GrPlan } from "react-icons/gr";
import { MdOutlineCategory, MdAddShoppingCart, MdOutlinePayments, MdOutlinePointOfSale } from "react-icons/md";


export const iconMap: { [key: string]: React.ComponentType } = {
    // Iconos generales
    FiHome,
    FiLayers,
    FiGrid,
    FiSettings,
    IoIosSettings,
    GrPlan,
    MdOutlineCategory,
    BsCashCoin,

    // Catálogos y productos
    FiBox,
    FiPackage,
    FiTag,
    BsMenuButton,
    BiUnite,

    // Usuarios y personas
    FiUsers,
    FiUser,
    FaUser,
    FiShield,
    RiAdminLine,

    // Operaciones
    FiClipboard,
    FiShoppingCart,
    FiDollarSign,
    FiFileText,
    MdOutlinePointOfSale,

    // Proveedores y logística
    FiTruck,
    FiMapPin,

    // Reportes
    TbReportAnalytics,

    // Pagos
    MdOutlinePayments,

    //Roles
    FaUsers,

    //Pantallas
    CgScreen,

    //Punto de venta
    AiOutlineAppstoreAdd,
    MdAddShoppingCart

};

export const getIcon = (iconName: string): React.ComponentType => {
    return iconMap[iconName] || FiLayers;
};
