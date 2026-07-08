import { useState, useCallback, useEffect } from "react";
import type { FormEvent } from "react";
import { useAlerts } from "./useAlerts";
import { useForm } from "./useForm";

interface UseCRUDOptions<T> {
    fetchData: () => Promise<T[]>;
    createData: (payload: Partial<T>) => Promise<T>;
    updateData: (id: number, payload: Partial<T>) => Promise<T>;
    deleteData: (id: number, currentItem: T, newStatus: boolean) => Promise<T>;
    initialFormValues: any;
    getId: (item: T) => number | undefined;
    validate?: (values: any) => string | null;
    statusField?: string;
    defaultStatus?: boolean;
}

export function useCRUD<T>({
    fetchData,  
    createData,
    updateData,
    deleteData,
    initialFormValues,
    getId,
    validate,
    statusField = "status",
    defaultStatus = true
}: UseCRUDOptions<T>) {
    const [dataList, setDataList] = useState<T[]>([]);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [activeTab, setActiveTab] = useState("lista");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { values, handleChange, setValues, resetForm } = useForm(initialFormValues);
    const { success, error: showError, warning, confirm } = useAlerts();

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            setDataList(data);
        } catch (err) {
            console.error("Error fetching data", err);
            showError("Error", "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    }, [fetchData, showError]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        setIsEditing(!selectedItem);
    }, [selectedItem]);

    const handleRowClick = useCallback(
        (item: T, formMapper: (item: T) => any) => {
            setSelectedItem(item);
            setValues(formMapper(item));
            setIsEditing(false);
            setActiveTab("detalle");
        },
        [setValues]
    );

    const newFromDetail = useCallback(() => {
        setSelectedItem(null);
        resetForm();
        setIsEditing(true);
        setActiveTab("detalle");
    }, [resetForm]);

    const handleSubmit = useCallback(
        async (
            e: FormEvent,
            buildPayload: (values: any, selectedItem: T | null) => Partial<T>
        ) => {
            e.preventDefault();

            if (validate) {
                const errorMsg = validate(values);
                if (errorMsg) {
                    warning("Atención", errorMsg);
                    return;
                }
            }

            const payload = buildPayload(values, selectedItem);

            try {
                const id = selectedItem ? getId(selectedItem) : undefined;
                if (selectedItem && id) {
                    await updateData(id, payload);
                    success("Éxito", "Registro actualizado correctamente");
                    await refreshData();
                    setActiveTab("lista");
                } else {
                    const created = await createData(payload);
                    success("Éxito", "Registro creado correctamente");
                    await refreshData();
                    setSelectedItem(created);
                    setIsEditing(false);
                }
            } catch (err) {
                console.error("Error saving data:", err);
                showError("Error", "Ocurrió un error al guardar");
            }
        },
        [
            values,
            selectedItem,
            validate,
            warning,
            getId,
            updateData,
            createData,
            success,
            refreshData,
            showError,
        ]
    );

    const handleDeleteOrRestore = useCallback(
        async (item: T) => {
            const id = getId(item);
            if (!id) return;

            const isDeactivating = (item as any)[statusField] as boolean;

            try {
                await deleteData(id, item, !isDeactivating);
                success(
                    isDeactivating ? "Desactivado" : "Reactivado",
                    `El registro ha sido ${isDeactivating ? "desactivado" : "reactivado"} correctamente`
                );
                await refreshData();
                const selectedId = selectedItem ? getId(selectedItem) : undefined;
                if (selectedId === id) {
                    newFromDetail();
                    setActiveTab("lista");
                }
            } catch (err) {
                console.error("Error changing status", err);
                showError("Error", "No se pudo cambiar el estado del registro");
            }
        },
        [getId, statusField, deleteData, success, refreshData, selectedItem, newFromDetail, showError]
    );

    return {
        dataList,
        selectedItem,
        activeTab,
        setActiveTab,
        isEditing,
        setIsEditing,
        loading,
        values,
        handleChange,
        setValues,
        refreshData,
        handleRowClick,
        newFromDetail,
        handleSubmit,
        handleDeleteOrRestore,
        confirm
    };
}
