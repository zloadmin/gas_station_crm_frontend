
"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  RefreshCw,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Layers,
  Trophy,
  Percent,
  CalendarDays,
} from "lucide-react";

import { getProfit } from "@/services/profit";
import { getServices, Service } from "@/services/services";

import {
  ProfitFilters,
  ProfitChartItem,
  ProfitResponse,
} from "@/types/profit";

type Period =
    | "today"
    | "yesterday"
    | "last_7"
    | "last_30"
    | "this_week"
    | "last_week"
    | "this_month"
    | "last_month"
    | "custom";

const periods: { value: Period; label: string }[] = [
  { value: "today", label: "Сегодня" },
  { value: "yesterday", label: "Вчера" },
  { value: "last_7", label: "Последние 7 дней" },
  { value: "last_30", label: "Последние 30 дней" },
  { value: "this_week", label: "Эта неделя" },
  { value: "last_week", label: "Прошлая неделя" },
  { value: "this_month", label: "Этот месяц" },
  { value: "last_month", label: "Прошлый месяц" },
  { value: "custom", label: "Произвольный период" },
];

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function getPeriodDates(period: Period): {
  date_from: string;
  date_to: string;
} {
  const today = new Date();

  let from = new Date(today);
  let to = new Date(today);

  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  switch (period) {
    case "today":
      break;

    case "yesterday":
      from = addDays(today, -1);
      to = addDays(today, -1);
      break;

    case "last_7":
      from = addDays(today, -6);
      break;

    case "last_30":
      from = addDays(today, -29);
      break;

    case "this_week":
      from = addDays(today, mondayOffset);
      break;

    case "last_week":
      from = addDays(today, mondayOffset - 7);
      to = addDays(today, mondayOffset - 1);
      break;

    case "this_month":
      from = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
      );
      break;

    case "last_month":
      from = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
      );

      to = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
      );
      break;

    case "custom":
      break;
  }

  return {
    date_from: formatDateInput(from),
    date_to: formatDateInput(to),
  };
}

function formatMoney(value: string | number): string {
  return `${Number(value).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;
}

function formatNumber(value: string | number): string {
  return Number(value).toLocaleString("ru-RU", {
    maximumFractionDigits: 2,
  });
}

function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatChange(value: number): string {
  const abs = Math.abs(value);

  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${abs.toLocaleString(
      "ru-RU",
      { maximumFractionDigits: 1 }
  )}%`;
}

function getChangeColor(value: number): string {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";

  return "text-slate-500";
}

function getChangeIcon(value: number) {
  if (value > 0) return <TrendingUp size={13} />;
  if (value < 0) return <TrendingDown size={13} />;

  return null;
}

// Карточка показателя
function StatCard({
                    title,
                    value,
                    change,
                    icon,
                    color,
                  }: {
  title: string;
  value: string;
  change?: number;
  icon: ReactNode;
  color: string;
}) {
  return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${color}`}>
            {icon}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500">
              {title}
            </div>

            <div className="mt-1 text-xl font-bold text-slate-900">
              {value}
            </div>

            {change !== undefined && (
                <div
                    className={`mt-1 flex items-center gap-1 text-xs font-semibold ${getChangeColor(change)}`}
                >
                  {getChangeIcon(change)}

                  {formatChange(change)}

                  <span className="font-normal text-slate-400">
                                к прошлому периоду
                            </span>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

// График
function ProfitChart({
                       data,
                     }: {
  data: ProfitChartItem[];
}) {
  const width = 900;
  const height = 280;

  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(
      1,
      ...data.flatMap((item) => [
        Number(item.revenue),
        Number(item.cost),
        Number(item.profit),
      ])
  );

  const step = maxValue / 4;

  function getX(index: number) {
    return data.length <= 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (index / (data.length - 1)) * chartWidth;
  }

  function getY(value: number) {
    return (
        paddingTop +
        chartHeight -
        (value / (maxValue * 1.1)) * chartHeight
    );
  }

  function getPoints(key: keyof ProfitChartItem) {
    return data
        .map((item, index) => {
          return `${getX(index)},${getY(Number(item[key]))}`;
        })
        .join(" ");
  }

  function getArea(key: keyof ProfitChartItem) {
    if (data.length === 0) return "";

    const points = data.map((item, index) => {
      return `${getX(index)},${getY(Number(item[key]))}`;
    });

    return [
      `${getX(0)},${paddingTop + chartHeight}`,
      ...points,
      `${getX(data.length - 1)},${paddingTop + chartHeight}`,
    ].join(" ");
  }

  if (data.length === 0) {
    return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Нет данных за выбранный период
        </div>
    );
  }

  return (
      <div className="w-full overflow-x-auto">
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto min-w-[600px] w-full"
            preserveAspectRatio="none"
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const y =
                paddingTop +
                chartHeight -
                (index / 4) * chartHeight;

            return (
                <g key={index}>
                  <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                  />

                  <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#64748b"
                  >
                    {formatNumber(step * index / 1000)}k
                  </text>
                </g>
            );
          })}

          <polygon
              points={getArea("revenue")}
              fill="#0ea5e9"
              opacity="0.08"
          />

          <polyline
              points={getPoints("revenue")}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
          />

          <polyline
              points={getPoints("cost")}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
          />

          <polyline
              points={getPoints("profit")}
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
          />

          {data.map((item, index) => (
              <g key={item.date}>
                <circle
                    cx={getX(index)}
                    cy={getY(Number(item.revenue))}
                    r="3"
                    fill="#0ea5e9"
                />

                <text
                    x={getX(index)}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                >
                  {formatShortDate(item.date)}
                </text>
              </g>
          ))}
        </svg>
      </div>
  );
}

export default function ProfitPage() {
  const [period, setPeriod] = useState<Period>("last_7");

  const [filters, setFilters] = useState<ProfitFilters>({
    date_from: "",
    date_to: "",
  });

  const [appliedFilters, setAppliedFilters] =
      useState<ProfitFilters>({
        date_from: "",
        date_to: "",
      });

  const [result, setResult] =
      useState<ProfitResponse["data"] | null>(null);

  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Инициализация периода после монтирования компонента
  useEffect(() => {
    const dates = getPeriodDates("last_7");

    setFilters(dates);
    setAppliedFilters(dates);
    setInitialized(true);
  }, []);

  // Загрузка справочника топлива
  useEffect(() => {
    getServices()
        .then(setServices)
        .catch(console.error);
  }, []);

  // Загрузка статистики
  const loadData = useCallback(async () => {
    if (!appliedFilters.date_from || !appliedFilters.date_to) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getProfit(appliedFilters);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить статистику прибыли");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (!initialized) return;

    loadData();
  }, [initialized, loadData]);

  // Выбор готового периода
  function handlePeriodChange(value: Period) {
    setPeriod(value);

    if (value === "custom") {
      return;
    }

    const dates = getPeriodDates(value);

    const nextFilters = {
      ...filters,
      ...dates,
    };

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  // Изменение фильтров
  function handleFilterChange(
      field: keyof ProfitFilters,
      value: string
  ) {
    setFilters((prev) => ({
      ...prev,
      [field]:
          field === "service_id"
              ? value === "" ? undefined : Number(value)
              : value,
    }));
  }

  // Применение фильтров
  function applyFilters() {
    setError("");

    if (!filters.date_from || !filters.date_to) {
      setError("Укажите начало и конец периода");
      return;
    }

    if (filters.date_from > filters.date_to) {
      setError("Дата начала не может быть больше даты окончания");
      return;
    }

    setAppliedFilters({ ...filters });
  }

  // Сброс фильтров
  function resetFilters() {
    const dates = getPeriodDates("last_7");

    setPeriod("last_7");
    setFilters(dates);
    setAppliedFilters(dates);
    setError("");
  }

  const summary = result?.summary;
  const chart = result?.chart ?? [];
  const byServices = result?.by_services ?? [];

  return (
      <div className="space-y-5">

        {/* Заголовок */}
        <div className="flex flex-wrap items-center justify-between gap-3">


          <button
              onClick={loadData}
              disabled={loading || !initialized}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
            />
            Обновить
          </button>
        </div>

        {/* Фильтры */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Период
              </label>

              <select
                  value={period}
                  onChange={(e) =>
                      handlePeriodChange(e.target.value as Period)
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {periods.map((item) => (
                    <option
                        key={item.value}
                        value={item.value}
                    >
                      {item.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Дата с
              </label>

              <input
                  type="date"
                  value={filters.date_from}
                  disabled={!initialized}
                  onChange={(e) => {
                    setPeriod("custom");
                    handleFilterChange("date_from", e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Дата по
              </label>

              <input
                  type="date"
                  value={filters.date_to}
                  disabled={!initialized}
                  onChange={(e) => {
                    setPeriod("custom");
                    handleFilterChange("date_to", e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>

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
                <option value="">Все марки</option>

                {services.map((service) => (
                    <option
                        key={service.id}
                        value={service.id}
                    >
                      {service.name}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                &nbsp;
              </label>

              <div className="flex items-end gap-2 translate-y-0.5">
                <button
                    onClick={applyFilters}
                    disabled={loading || !initialized}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Search size={15} />
                  Применить
                </button>

                <button
                    onClick={resetFilters}
                    disabled={!initialized}
                    title="Сбросить фильтры"
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays size={14} />

            Выбранный период: {filters.date_from || "—"} — {filters.date_to || "—"}
          </div>
        </div>

        {/* Ошибка */}
        {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
        )}

        {/* Карточки */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
              title="Выручка"
              value={formatMoney(summary?.revenue ?? 0)}
              change={summary?.changes.revenue}
              icon={<Wallet size={21} />}
              color="bg-blue-50 text-blue-600"
          />

          <StatCard
              title="Себестоимость"
              value={formatMoney(summary?.cost ?? 0)}
              change={summary?.changes.cost}
              icon={<Layers size={21} />}
              color="bg-purple-50 text-purple-600"
          />

          <StatCard
              title="Прибыль"
              value={formatMoney(summary?.profit ?? 0)}
              change={summary?.changes.profit}
              icon={<Trophy size={21} />}
              color="bg-green-50 text-green-600"
          />

          <StatCard
              title="Рентабельность"
              value={`${formatNumber(summary?.profitability ?? 0)}%`}
              icon={<Percent size={21} />}
              color="bg-emerald-50 text-emerald-600"
          />

        </div>

        {/* График */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">
              Динамика прибыли
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                Выручка
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Себестоимость
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                Прибыль
              </div>
            </div>
          </div>

          {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Загрузка графика...
              </div>
          ) : (
              <ProfitChart data={chart} />
          )}
        </div>

        {/* Таблица по маркам */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Прибыль по маркам топлива
            </h2>

            <span className="text-xs text-slate-500">
                        Всего марок: {byServices.length}
                    </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">
                  Марка топлива
                </th>

                <th className="whitespace-nowrap px-4 py-3">
                  Продано, л
                </th>

                <th className="whitespace-nowrap px-4 py-3">
                  Выручка, ₽
                </th>

                <th className="whitespace-nowrap px-4 py-3">
                  Себестоимость, ₽
                </th>

                <th className="whitespace-nowrap px-4 py-3">
                  Прибыль, ₽
                </th>

                <th className="whitespace-nowrap px-4 py-3">
                  Рентабельность
                </th>
              </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

              {loading ? (
                  <tr>
                    <td
                        colSpan={6}
                        className="py-12 text-center text-slate-400"
                    >
                      Загрузка данных...
                    </td>
                  </tr>
              ) : byServices.length === 0 ? (
                  <tr>
                    <td
                        colSpan={6}
                        className="py-12 text-center text-slate-400"
                    >
                      Нет данных за выбранный период
                    </td>
                  </tr>
              ) : (
                  byServices.map((item) => {
                    const profitability =
                        Number(item.revenue) > 0
                            ? (Number(item.profit) /
                            Number(item.revenue)) * 100
                            : 0;

                    return (
                        <tr
                            key={item.service_id}
                            className="transition-colors hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-semibold">
                            {item.service_name}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatNumber(item.volume_liters)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatMoney(item.revenue)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatMoney(item.cost)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-green-600">
                            {formatMoney(item.profit)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatNumber(profitability)}%
                          </td>
                        </tr>
                    );
                  })
              )}

              </tbody>

              {!loading && byServices.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">
                      Итого
                    </td>

                    <td className="px-4 py-3">
                      {formatNumber(
                          byServices.reduce(
                              (sum, item) =>
                                  sum + Number(item.volume_liters),
                              0
                          )
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {formatMoney(
                          byServices.reduce(
                              (sum, item) =>
                                  sum + Number(item.revenue),
                              0
                          )
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {formatMoney(
                          byServices.reduce(
                              (sum, item) =>
                                  sum + Number(item.cost),
                              0
                          )
                      )}
                    </td>

                    <td className="px-4 py-3 text-green-600">
                      {formatMoney(
                          byServices.reduce(
                              (sum, item) =>
                                  sum + Number(item.profit),
                              0
                          )
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {formatNumber(
                          byServices.reduce(
                              (sum, item) =>
                                  sum + Number(item.revenue),
                              0
                          ) > 0
                              ? (
                              byServices.reduce(
                                  (sum, item) =>
                                      sum + Number(item.profit),
                                  0
                              ) /
                              byServices.reduce(
                                  (sum, item) =>
                                      sum + Number(item.revenue),
                                  0
                              )
                          ) * 100
                              : 0
                      )}%
                    </td>
                  </tr>
                  </tfoot>
              )}

            </table>
          </div>
        </div>

      </div>
  );
}
