"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";

import { getTransactions } from "@/services/transactions";
import {
    Transaction,
    TransactionFilters,
    TransactionResponse,
} from "@/types/transaction";
import { getServices, Service } from "@/services/services";
import {
    getTransactionTypes,
    TransactionType,
} from "@/services/transaction-payments";

const initialFilters: TransactionFilters = {
    date_from: "",
    date_to: "",
    service_id: undefined,
    tid: undefined,
    terminal_service_id: undefined,
    type: "",
    id: undefined,
    per_page: 15,
    page: 1,
};

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatNumber(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString("ru-RU", {
        maximumFractionDigits: 4,
    });
}

function formatMoney(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "—";
    return `${Number(value).toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ₽`;
}

function formatBool(value?: boolean | null) {
    if (value === null || value === undefined) return "—";
    return value ? "Да" : "Нет";
}

function displayOrDash(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
}

export default function TransactionsPage() {
    const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState<TransactionFilters>(initialFilters);

    const [result, setResult] = useState<TransactionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [services, setServices] = useState<Service[]>([]);
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);

    useEffect(() => {
        getServices()
            .then(setServices)
            .catch(console.error);

        getTransactionTypes()
            .then(setTransactionTypes)
            .catch(console.error);
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getTransactions(appliedFilters);
            setResult(response);
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить операции");
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function handleFilterChange(
        field: keyof TransactionFilters,
        value: string
    ) {
        setFilters((prev) => {
            const numericFields = [
                "service_id",
                "tid",
                "terminal_service_id",
                "per_page",
            ];

            if (numericFields.includes(field)) {
                return {
                    ...prev,
                    [field]: value === "" ? undefined : Number(value),
                };
            }

            return {
                ...prev,
                [field]: value,
            };
        });
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

    const transactions: Transaction[] = result?.data ?? [];
    const meta = result?.meta;

    // Получаем русское название типа оплаты по его ключу.
    const getTransactionTypeLabel = (value?: string | null) => {
        if (!value) return "—";

        return transactionTypes.find((type) => type.value === value)?.label ?? value;
    };

    return (
        <div className="space-y-5">
            {/* Заголовок */}
            <div className="flex items-center gap-2">
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    Обновить
                </button>
            </div>

            {/* Фильтры */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                    {/* Период */}
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

                    {/* Марка топлива */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Марка топлива
                        </label>
                        <select
                            value={filters.service_id ?? ""}
                            onChange={(e) =>
                                handleFilterChange("service_id", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Все</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>




                    {/* Тип оплаты */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            Тип оплаты
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) =>
                                handleFilterChange("type", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">Все</option>
                            {transactionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>



                    {/* ID операции */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            ID операции
                        </label>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            value={filters.id}
                            onChange={(e) =>
                                handleFilterChange("id", e.target.value)
                            }
                            placeholder="ID"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* ID на терминале */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            ID на терминале
                        </label>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            value={filters.tid}
                            onChange={(e) =>
                                handleFilterChange("tid", e.target.value)
                            }
                            placeholder="TID"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Записей на странице */}
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
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600">
                            &nbsp;
                        </label>
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
            </div>

            {/* Таблица */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="font-semibold">Список операций</h2>
                    <span className="text-xs text-slate-500">
                        Всего: {meta?.total ?? 0}
                    </span>
                </div>

                {error && (
                    <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="max-h-[600px] overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-20 bg-slate-100 text-xs text-slate-600 shadow-sm">
                        <tr>
                            <th className="whitespace-nowrap px-3 py-3">ID операции</th>
                            <th className="whitespace-nowrap px-3 py-3">ID прихода</th>
                            <th className="whitespace-nowrap px-3 py-3">Дата прихода</th>
                            <th className="whitespace-nowrap px-3 py-3">Цена за литр закупка</th>
                            <th className="whitespace-nowrap px-3 py-3">ID на терминале</th>
                            <th className="whitespace-nowrap px-3 py-3">Терминал</th>
                            <th className="whitespace-nowrap px-3 py-3">Дата/Время</th>
                            <th className="whitespace-nowrap px-3 py-3">Тип операции</th>
                            <th className="whitespace-nowrap px-3 py-3">Марка топлива</th>
                            <th className="whitespace-nowrap px-3 py-3">Цена услуги</th>
                            <th className="whitespace-nowrap px-3 py-3">Объём</th>
                            <th className="whitespace-nowrap px-3 py-3">Отпущено</th>
                            <th className="whitespace-nowrap px-3 py-3">Стоимость за л</th>
                            <th className="whitespace-nowrap px-3 py-3">Внесено</th>
                            <th className="whitespace-nowrap px-3 py-3">Код валюты</th>
                            <th className="whitespace-nowrap px-3 py-3">Выдано</th>
                            <th className="whitespace-nowrap px-3 py-3">Выдано Чеком Возврата</th>
                            <th className="whitespace-nowrap px-3 py-3">Скидка</th>
                            <th className="whitespace-nowrap px-3 py-3">RRN/Order</th>
                            <th className="whitespace-nowrap px-3 py-3">Чек распечатан</th>
                            <th className="whitespace-nowrap px-3 py-3">Без проблем</th>
                            <th className="whitespace-nowrap px-3 py-3">Скидочная карта</th>
                            <th className="whitespace-nowrap px-3 py-3">N карты</th>
                            <th className="whitespace-nowrap px-3 py-3">Топливная карта</th>
                            <th className="whitespace-nowrap px-3 py-3">Организация</th>
                            <th className="whitespace-nowrap px-3 py-3">Списано</th>
                            <th className="whitespace-nowrap px-3 py-3">ID операции Яндекс</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={26} className="py-12 text-center text-slate-400">
                                    Загрузка данных...
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={26} className="py-12 text-center text-slate-400">
                                    Операции не найдены
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr
                                    key={tx.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                                        {tx.id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                                        {tx.fuelArrival?.id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                                        {formatDate(tx.fuelArrival?.date)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                                        {formatMoney(tx.fuelArrival?.price_per_liter)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.tid)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {tx.terminal?.name ??
                                            (tx.terminal_id
                                                ? `Терминал #${tx.terminal_id}`
                                                : "—")}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatDate(tx.remote_created_at ?? tx.created_at)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {getTransactionTypeLabel(tx.type)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.service?.name)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.service_price)}
                                    </td>

                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatNumber(tx.amount)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatNumber(tx.amount_dispensed)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.service_price)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.inserted)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.currency)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.dispensed)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.price_returned)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.discount)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {tx.rrn || tx.order_id
                                            ? [tx.rrn, tx.order_id].filter(Boolean).join(" / ")
                                            : "—"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatBool(tx.printed)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatBool(tx.no_troubles)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.discount_card)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.card_number)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.fuel_card)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {tx.organization?.name ??
                                            (tx.organization
                                                ? `Орг. #${tx.organization.id}`
                                                : "—")}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatMoney(tx.price)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {displayOrDash(tx.yandex_operation_id)}
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
                                .filter((page) =>
                                    page === 1 ||
                                    page === meta.last_page ||
                                    Math.abs(page - meta.current_page) <= 1
                                )
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
    );
}