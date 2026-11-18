"use client";

import { useCallback, useEffect, useState } from "react";

import { RefreshCw, Search, X, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

import { getFuelArrivals } from "@/services/fuel-arrivals";
import {
    FuelArrival,
    FuelArrivalFilters,
    FuelArrivalResponse,
} from "@/types/fuel-arrival";
import { getServices, Service } from "@/services/services";

const initialFilters: FuelArrivalFilters = {
    date_from: "",
    date_to: "",
    service_id: undefined,
    per_page: 15,
    page: 1,
};

import CreateFuelArrivalModal from "@/components/fuel-arrivals/CreateFuelArrivalModal";



function formatDate(value: string) {
    if (!value) return "—";

    return new Date(value).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatNumber(value: string | number) {
    return Number(value).toLocaleString("ru-RU", {
        maximumFractionDigits: 3,
    });
}

function formatMoney(value: string | number) {
    return `${Number(value).toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ₽`;
}


export default function FuelArrivalsPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState(initialFilters);

    const [result, setResult] =
        useState<FuelArrivalResponse | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingArrival, setEditingArrival] = useState<FuelArrival | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        getServices()
            .then(setServices)
            .catch(console.error);
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getFuelArrivals(appliedFilters);
            setResult(response);
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить приходы топлива");
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function handleFilterChange(
        field: keyof FuelArrivalFilters,
        value: string
    ) {
        setFilters((prev) => ({
            ...prev,
            [field]:
                field === "service_id" || field === "per_page"
                    ? value === ""
                        ? undefined
                        : Number(value)
                    : value,
        }));
    }

    function applyFilters() {
        setAppliedFilters({
            ...filters,
            page: 1,
        });
    }

    function resetFilters() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    }

    function changePage(page: number) {
        setAppliedFilters((prev) => ({
            ...prev,
            page,
        }));
    }

    const arrivals: FuelArrival[] = result?.data ?? [];
    const meta = result?.meta;

    async function deleteArrival(arrival: FuelArrival) {
        if (!window.confirm(`Удалить приход топлива №${arrival.id}?`)) {
            return;
        }

        setDeletingId(arrival.id);
        setError("");

        try {
            await api.delete(`/fuel-arrivals/${arrival.id}`);

            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                "Не удалось удалить приход топлива"
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (

        <>

            <div className="space-y-5">
                {/* Заголовок */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                    >
                        <RefreshCw size={15} />
                        Обновить
                    </button>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={17} />
                        Добавить приход
                    </button>
                </div>

                {/* Фильтры */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Дата с
                            </label>
                            <input
                                type="date"
                                value={filters.date_from ?? ""}
                                onChange={(e) =>
                                    handleFilterChange("date_from", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Дата по
                            </label>
                            <input
                                type="date"
                                value={filters.date_to ?? ""}
                                onChange={(e) =>
                                    handleFilterChange("date_to", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Топливо
                            </label>

                            <select
                                value={filters.service_id ?? ""}
                                onChange={(e) =>
                                    handleFilterChange("service_id", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Все виды топлива</option>

                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                Записей на странице
                            </label>
                            <select
                                value={filters.per_page}
                                onChange={(e) =>
                                    handleFilterChange("per_page", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            >
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                <Search size={15} />
                                Применить
                            </button>

                            <button
                                onClick={resetFilters}
                                title="Сбросить фильтры"
                                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Таблица */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold">Список приходов</h2>

                        <span className="text-xs text-slate-500">
            Всего: {meta?.total ?? 0}
          </span>
                    </div>

                    {error && (
                        <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-600">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3">ID</th>
                                <th className="whitespace-nowrap px-4 py-3">Дата</th>
                                <th className="whitespace-nowrap px-4 py-3">Услуга</th>
                                <th className="whitespace-nowrap px-4 py-3">Тонны, т</th>
                                <th className="whitespace-nowrap px-4 py-3">Объём, л</th>
                                <th className="whitespace-nowrap px-4 py-3">Плотность</th>
                                <th className="whitespace-nowrap px-4 py-3">Цена, ₽</th>
                                <th className="whitespace-nowrap px-4 py-3">Сумма, ₽</th>
                                <th className="whitespace-nowrap px-4 py-3 text-right">
                                    Действия
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-400">
                                        Загрузка данных...
                                    </td>
                                </tr>
                            ) : arrivals.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Приходы топлива не найдены
                                    </td>
                                </tr>
                            ) : (
                                arrivals.map((arrival) => (
                                    <tr
                                        key={arrival.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                                            {arrival.id}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatDate(arrival.date)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {arrival.service?.name ?? `Услуга #${arrival.service_id}`}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatNumber(Number(arrival.quantity_kg) / 1000)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatNumber(arrival.volume_liters)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatNumber(arrival.density)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatMoney(arrival.price_per_liter)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 font-semibold">
                                            {formatMoney(arrival.total_price)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    title="Редактировать"
                                                    onClick={() => setEditingArrival(arrival)}
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Удалить"
                                                    disabled={deletingId === arrival.id}
                                                    onClick={() => deleteArrival(arrival)}
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    {deletingId === arrival.id ? (
                                                        <RefreshCw size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {meta && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-slate-500">
                                Показано {meta.from ?? 0}–{meta.to ?? 0} из {meta.total}
                            </div>

                            <div className="flex flex-wrap items-center gap-1">
                                <button
                                    disabled={meta.current_page <= 1 || loading}
                                    onClick={() => changePage(meta.current_page - 1)}
                                    className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                                >
                                    Назад
                                </button>

                                {Array.from(
                                    { length: meta.last_page },
                                    (_, index) => index + 1
                                )
                                    .filter((page) => {
                                        return (
                                            page === 1 ||
                                            page === meta.last_page ||
                                            Math.abs(page - meta.current_page) <= 1
                                        );
                                    })
                                    .map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => changePage(page)}
                                            disabled={loading}
                                            className={`rounded-md border px-3 py-1.5 text-sm ${
                                                page === meta.current_page
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                <button
                                    disabled={meta.current_page >= meta.last_page || loading}
                                    onClick={() => changePage(meta.current_page + 1)}
                                    className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                                >
                                    Далее
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {createModalOpen && (
                <CreateFuelArrivalModal
                    onClose={() => setCreateModalOpen(false)}
                    onCreated={loadData}
                />
            )}

            {editingArrival && (
                <CreateFuelArrivalModal
                    arrival={editingArrival}
                    onClose={() => setEditingArrival(null)}
                    onCreated={loadData}
                />
            )}

        </>


    );
}
