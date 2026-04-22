import React, { useEffect, useState } from "react";
import { Query } from "appwrite";
import { ChevronDown, Clock3, Search } from "lucide-react";
import db from "../appwrite/databases";

const PAGE_SIZE = 100;

const statusBadgeClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  Authorised: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

const cardClasses = {
  Pending: "border-amber-300 bg-amber-50/80 ring-1 ring-amber-200",
  Authorised: "border-emerald-200 bg-emerald-50/40",
  Rejected: "border-rose-200 bg-rose-50/40",
};

const summaryCardStyles = {
  Total: "border-slate-200 bg-white text-slate-800",
  Pending: "border-amber-200 bg-amber-50 text-amber-900",
  Authorised: "border-emerald-200 bg-emerald-50 text-emerald-900",
  Rejected: "border-rose-200 bg-rose-50 text-rose-900",
};

const statusPriority = {
  Pending: 0,
  Authorised: 1,
  Rejected: 2,
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDateTime = (value) => `${formatDate(value)} at ${formatTime(value)}`;

const getCoverSummary = (doc) => {
  const covers = [1, 2, 3, 4, 5, 6]
    .filter((period) => doc[`cover_p${period}`])
    .map((period) => `P${period}`);

  return covers.length ? covers.join(", ") : "No classroom cover requested";
};

function AbsenceRequestTable({ user }) {
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (!user?.$id) {
      setAbsence([]);
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      setError("");

      try {
        const documents = [];
        let cursor = null;
        let hasMore = true;

        while (hasMore) {
          const queries = [
            Query.equal("userId", user.$id),
            Query.orderDesc("absence_start"),
            Query.limit(PAGE_SIZE),
          ];

          if (cursor) {
            queries.push(Query.cursorAfter(cursor));
          }

          const response = await db["Leave of Absence Request Collection"].list(queries);
          documents.push(...response.documents);

          if (response.documents.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            cursor = response.documents[response.documents.length - 1].$id;
          }
        }

        setAbsence(documents);

        const years = [
          ...new Set(documents.map((doc) => new Date(doc.absence_start).getFullYear())),
        ].sort((a, b) => a - b);

        if (years.length > 0 && !years.includes(new Date().getFullYear())) {
          setCurrentYear(years[years.length - 1]);
        }

        const currentMonthKey = `${new Date().getFullYear()}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}`;

        const fallbackMonthKey = documents[0]
          ? `${new Date(documents[0].absence_start).getFullYear()}-${String(
              new Date(documents[0].absence_start).getMonth() + 1
            ).padStart(2, "0")}`
          : null;

        setExpandedMonths({
          [documents.some((doc) => {
            const docDate = new Date(doc.absence_start);
            return (
              `${docDate.getFullYear()}-${String(docDate.getMonth() + 1).padStart(2, "0")}` ===
              currentMonthKey
            );
          })
            ? currentMonthKey
            : fallbackMonthKey]: true,
        });
      } catch (err) {
        console.error("Failed to fetch user absence requests", err);
        setError("Unable to load your absence requests right now.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user?.$id]);

  const toggleMonth = (key) => {
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="px-6 py-10 text-sm text-slate-600">Loading requests...</div>;
  if (!user) return <div>No user logged in.</div>;
  if (error) return <div className="px-6 py-10 text-sm text-rose-700">{error}</div>;

  const yearsAvailable = [
    ...new Set(absence.map((doc) => new Date(doc.absence_start).getFullYear())),
  ].sort((a, b) => a - b);

  const currentYearAbsence = absence.filter(
    (doc) => new Date(doc.absence_start).getFullYear() === currentYear
  );

  const filteredAbsence = currentYearAbsence.filter((doc) => {
    const matchesStatus = statusFilter === "All" || doc.authorised === statusFilter;
    const query = searchTerm.trim().toLowerCase();

    if (!query) return matchesStatus;

    const haystack = [
      doc.department,
      doc.reason,
      doc.break_cover,
      doc.staff_cover_break,
      doc.toil_details,
      doc.decision_notes,
      doc.authorised,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && haystack.includes(query);
  });

  const groupedByMonth = filteredAbsence.reduce((acc, doc) => {
    const date = new Date(doc.absence_start);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = acc[key] || [];
    acc[key].push(doc);
    return acc;
  }, {});

  Object.values(groupedByMonth).forEach((docs) => {
    docs.sort((a, b) => {
      const statusDifference =
        (statusPriority[a.authorised] ?? 99) - (statusPriority[b.authorised] ?? 99);

      if (statusDifference !== 0) return statusDifference;

      return new Date(a.absence_start).getTime() - new Date(b.absence_start).getTime();
    });
  });

  const monthKeys = Object.keys(groupedByMonth).sort();
  const pendingCount = currentYearAbsence.filter((doc) => doc.authorised === "Pending").length;
  const authorisedCount = currentYearAbsence.filter((doc) => doc.authorised === "Authorised").length;
  const rejectedCount = currentYearAbsence.filter((doc) => doc.authorised === "Rejected").length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-700">
                Personal Requests
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">Your absence requests</h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Track every request, see the latest decision, and read any notes left by admin.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total", value: currentYearAbsence.length },
                { label: "Pending", value: pendingCount },
                { label: "Authorised", value: authorisedCount },
                { label: "Rejected", value: rejectedCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 shadow-sm ${summaryCardStyles[item.label]}`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white p-1">
                <button
                  onClick={() =>
                    setCurrentYear((prev) =>
                      yearsAvailable.includes(prev - 1) ? prev - 1 : prev
                    )
                  }
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Previous
                </button>
                <div className="min-w-24 text-center text-base font-semibold text-slate-900">
                  {currentYear}
                </div>
                <button
                  onClick={() =>
                    setCurrentYear((prev) =>
                      yearsAvailable.includes(prev + 1) ? prev + 1 : prev
                    )
                  }
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Next
                </button>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by reason, note, or status"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 lg:w-80"
                  />
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Authorised">Authorised</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {monthKeys.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
            No requests match the current filters for {currentYear}.
          </section>
        ) : (
          monthKeys.map((monthKey) => {
            const isOpen = expandedMonths[monthKey] ?? false;
            const monthRequests = groupedByMonth[monthKey];
            const monthPending = monthRequests.filter((doc) => doc.authorised === "Pending").length;

            return (
              <section
                key={monthKey}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="flex w-full items-center justify-between gap-4 bg-slate-900 px-5 py-4 text-left text-white transition hover:bg-slate-800"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      {new Date(`${monthKey}-01`).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-300">
                      {monthRequests.length} request{monthRequests.length === 1 ? "" : "s"}
                      {" • "}
                      {monthPending} pending
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-4 bg-slate-50 p-4 sm:p-5">
                    {monthRequests.map((doc) => (
                      <article
                        key={doc.$id}
                        className={`rounded-3xl border p-5 shadow-sm ${cardClasses[doc.authorised] || cardClasses.Pending}`}
                      >
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
                          <div className="space-y-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                                  Request
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                  {doc.name}
                                </h2>
                                <p className="text-sm text-slate-600">
                                  {doc.department || "No department set"}
                                </p>
                              </div>

                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusBadgeClasses[doc.authorised] || statusBadgeClasses.Pending}`}
                              >
                                {doc.authorised}
                              </span>
                            </div>

                            {doc.authorised === "Pending" && (
                              <div className="rounded-2xl border border-amber-200 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900">
                                This request is still waiting for an admin decision.
                              </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  Absence window
                                </p>
                                <p className="mt-2 text-sm font-medium text-slate-900">
                                  Start: {formatDateTime(doc.absence_start)}
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  End: {formatDateTime(doc.absence_end)}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  Cover required
                                </p>
                                <p className="mt-2 text-sm text-slate-700">{getCoverSummary(doc)}</p>
                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  Break cover
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  {doc.break_cover || "No break duty cover needed"}
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  {doc.staff_cover_break || "No staff member recorded"}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Reason
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                {doc.reason || "No reason supplied"}
                              </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  Appointment time
                                </p>
                                <p className="mt-2 text-sm text-slate-700">
                                  {doc.appointment_time
                                    ? formatDateTime(doc.appointment_time)
                                    : "Not supplied"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  TOIL details
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                  {doc.toil_details || "Not supplied"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                              Decision
                            </p>

                            <div className="mt-4 space-y-4">
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm font-medium text-slate-700">Status</p>
                                <p className="mt-2 text-base font-semibold text-slate-900">
                                  {doc.authorised}
                                </p>
                              </div>

                              {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm font-medium text-slate-700">Decision notes</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                                  {doc.decision_notes || "No note has been added to this request."}
                                </p>
                              </div> */}

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Clock3 className="h-4 w-4 text-slate-400" />
                                  Submitted
                                </div>
                                <p className="mt-2 text-slate-800">
                                  {formatDateTime(doc.absence_start)}
                                </p>
                              </div>
                            </div>
                          </aside>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AbsenceRequestTable;
