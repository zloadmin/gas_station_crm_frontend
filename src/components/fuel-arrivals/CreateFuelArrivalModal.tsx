
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getServices, Service } from "@/services/services";
import { FuelArrival } from "@/types/fuel-arrival";

interface Props {
    onClose: () => void;
    onCreated: () => void;
    arrival?: FuelArrival;
}

interface FormData {
    date: string;
    service_id: string;
    quantity_kg: string;
    volume_liters: string;
    total_price: string;
}

interface FieldProps {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    errors?: string[];
    type?: string;
    step?: string;
    required?: boolean;
}

function formatDateTime(value?: string | null): string {
    if (!value) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        return now.toISOString().slice(0, 16);
    }

    return value.replace(" ", "T").slice(0, 16);
}

function getInitialForm(arrival?: FuelArrival): FormData {
    return {
        date: formatDateTime(arrival?.date),
        service_id: arrival ? String(arrival.service_id) : "",
        quantity_kg:
            arrival?.quantity_kg != null
                ? String(arrival.quantity_kg)
                : "",
        volume_liters:
            arrival?.volume_liters != null
                ? String(arrival.volume_liters)
                : "",
        total_price:
            arrival?.total_price != null
                ? String(arrival.total_price)
                : "",
    };
}

function Field({
                   name,
                   label,
                   value,
                   onChange,
                   errors = [],
                   type = "number",
                   step = "any",
                   required = false,
               }: FieldProps) {
    const hasError = errors.length > 0;

    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                step={
                    type === "date" || type === "datetime-local"
                        ? undefined
                        : step
                }
                min={type === "number" ? "0" : undefined}
                value={value}
                required={required}
                aria-invalid={hasError}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                    hasError
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />

            {errors.map((message, index) => (
                <p
                    key={index}
                    className="mt-1 text-xs text-red-600"
                >
                    {message}
                </p>
            ))}
        </div>
    );
}

export default function CreateFuelArrivalModal({
                                                   onClose,
                                                   onCreated,
                                                   arrival,
                                               }: Props) {
    const isEditing = !!arrival;

    const [form, setForm] = useState<FormData>(() =>
        getInitialForm(arrival)
    );

    const [services, setServices] = useState<Service[]>([]);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getServices()
            .then(setServices)
            .catch(() =>
                setError("Не удалось загрузить список топлива")
            )
            .finally(() => setServicesLoading(false));
    }, []);

    function updateField(field: keyof FormData, value: string) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: [],
        }));

        setError("");
    }

    // Плотность = масса / объём
    const calculatedDensity =
        Number(form.volume_liters) > 0 &&
        Number(form.quantity_kg) > 0
            ? (
                Number(form.quantity_kg) /
                Number(form.volume_liters)
            ).toFixed(4)
            : "";

    // Цена за литр = общая сумма / объём
    const calculatedPricePerLiter =
        Number(form.volume_liters) > 0 &&
        Number(form.total_price) > 0
            ? (
                Number(form.total_price) /
                Number(form.volume_liters)
            ).toFixed(2)
            : "";

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);
        setErrors({});
        setError("");

        const payload = {
            date: form.date.replace("T", " ") + ":00",
            service_id: Number(form.service_id),
            quantity_kg: form.quantity_kg,
            volume_liters: form.volume_liters,
            density: calculatedDensity,
            total_price: Number(form.total_price),
        };

        try {
            if (arrival) {
                await api.put(
                    `/fuel-arrivals/${arrival.id}`,
                    payload
                );
            } else {
                await api.post("/fuel-arrivals", payload);
            }

            onCreated();
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                const validationErrors =
                    err.response.data.errors ?? {};

                setErrors(validationErrors);

                setError(
                    Object.values(validationErrors)
                        .flat()
                        .join(" ") ||
                    err.response.data.message ||
                    "Проверьте правильность заполнения полей"
                );
            } else {
                setError(
                    err.response?.data?.message ??
                    `Не удалось ${
                        isEditing ? "обновить" : "создать"
                    } приход топлива`
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isEditing
                                ? "Редактирование прихода"
                                : "Новый приход топлива"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {isEditing
                                ? `Редактирование прихода №${arrival.id}`
                                : "Заполните информацию о поступлении топлива"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

                        {/* Errors */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                <p className="font-medium">
                                    Не удалось сохранить приход
                                </p>

                                <p className="mt-1">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Date and service */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                                name="date"
                                label="Дата и время прихода"
                                type="datetime-local"
                                value={form.date}
                                onChange={(value) =>
                                    updateField("date", value)
                                }
                                errors={errors.date}
                                required
                            />

                            <div>
                                <label
                                    htmlFor="service_id"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Вид топлива{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <select
                                    id="service_id"
                                    name="service_id"
                                    required
                                    value={form.service_id}
                                    disabled={servicesLoading}
                                    aria-invalid={
                                        !!errors.service_id?.length
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "service_id",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                                        errors.service_id?.length
                                            ? "border-red-500 bg-red-50"
                                            : "border-slate-200 focus:border-blue-500"
                                    }`}
                                >
                                    <option value="">
                                        {servicesLoading
                                            ? "Загрузка..."
                                            : "Выберите топливо"}
                                    </option>

                                    {services.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.id}
                                        >
                                            {service.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.service_id?.map(
                                    (message, index) => (
                                        <p
                                            key={index}
                                            className="mt-1 text-xs text-red-600"
                                        >
                                            {message}
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Fuel parameters */}
                        <div>


                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Field
                                    name="volume_liters"
                                    label="Объём, л"
                                    value={form.volume_liters}
                                    onChange={(value) =>
                                        updateField(
                                            "volume_liters",
                                            value
                                        )
                                    }
                                    errors={errors.volume_liters}
                                    required
                                />

                                <Field
                                    name="quantity_kg"
                                    label="Масса, кг"
                                    value={form.quantity_kg}
                                    onChange={(value) =>
                                        updateField(
                                            "quantity_kg",
                                            value
                                        )
                                    }
                                    errors={errors.quantity_kg}
                                    required
                                />

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Плотность, кг/л
                                    </label>

                                    <input
                                        type="text"
                                        value={calculatedDensity}
                                        readOnly
                                        placeholder="Автоматически"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                Стоимость
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    name="total_price"
                                    label="Общая сумма, ₽"
                                    value={form.total_price}
                                    onChange={(value) =>
                                        updateField(
                                            "total_price",
                                            value
                                        )
                                    }
                                    errors={errors.total_price}
                                    required
                                />

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Цена за литр, ₽/л
                                    </label>

                                    <input
                                        type="text"
                                        value={calculatedPricePerLiter}
                                        readOnly
                                        placeholder="Автоматически"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                servicesLoading ||
                                services.length === 0
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {isEditing
                                ? "Сохранить изменения"
                                : "Создать приход"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
