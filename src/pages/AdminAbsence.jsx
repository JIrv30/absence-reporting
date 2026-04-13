import React, { useEffect, useState } from "react";
import { Query } from "appwrite";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  XCircle,
} from "lucide-react";
import db from "../appwrite/databases";
import CalendarAbsenceView from "./CalenderAbsenceView";

const statusOptions = ["Pending", "Authorised", "Rejected"];

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

const buildDraftState = (documents) =>
  documents.reduce((acc, doc) => {
    acc[doc.$id] = {
      authorised: doc.authorised || "Pending",
      decision_notes: doc.decision_notes || "",
    };
    return acc;
  }, {});

const statusPriority = {
  Pending: 0,
  Authorised: 1,
  Rejected: 2,
};

const AdminAbsence = ({ user, teamLeader }) => {
  const [absence, setAbsence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await db["Leave of Absence Request Collection"].list([
          Query.orderAsc("absence_start"),
          Query.limit(1000),
        ]);

        const documents = response.documents;
        setAbsence(documents);
        setReviewDrafts(buildDraftState(documents));

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
        console.error("Failed to fetch data", err);
        setSaveError("Unable to load requests right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, []);

  const handleDraftChange = (id, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleDecisionSave = async (doc) => {
    const draft = reviewDrafts[doc.$id];
    if (!draft) return;

    setSavingId(doc.$id);
    setSaveError("");

    try {
      await db["Leave of Absence Request Collection"].update(doc.$id, {
        authorised: draft.authorised,
        decision_notes: draft.decision_notes.trim(),
      });

      setAbsence((prev) =>
        prev.map((item) =>
          item.$id === doc.$id
            ? {
                ...item,
                authorised: draft.authorised,
                decision_notes: draft.decision_notes.trim(),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update decision", error);
      setSaveError("Unable to save that decision. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleMonth = (key) => {
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="px-6 py-10 text-sm text-slate-600">Loading requests...</div>;
  if (!user || teamLeader !== "admin") return <div>Access Denied</div>;

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
      doc.name,
      doc.department,
      doc.reason,
      doc.break_cover,
      doc.staff_cover_break,
      doc.toil_details,
      doc.decision_notes,
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
                Admin Review
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">All requests</h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Review absence requests by month, filter the queue quickly, and add decision notes for staff.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCalendarView((prev) => !prev)}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {calendarView ? "Switch to list" : "Switch to calendar"}
              </button>
            </div>
          </div>

          {!calendarView && (
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
                      placeholder="Search by name, department, or note"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 lg:w-80"
                    />
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="All">All statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {saveError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {saveError}
          </div>
        )}

        {calendarView ? (
          <CalendarAbsenceView absence={absence} user={user} teamLeader={teamLeader} />
        ) : monthKeys.length === 0 ? (
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
                    {monthRequests.map((doc) => {
                      const draft = reviewDrafts[doc.$id] || {
                        authorised: doc.authorised || "Pending",
                        decision_notes: doc.decision_notes || "",
                      };
                      const hasChanges =
                        draft.authorised !== (doc.authorised || "Pending") ||
                        draft.decision_notes !== (doc.decision_notes || "");

                      return (
                        <article
                          key={doc.$id}
                          className={`rounded-3xl border p-5 shadow-sm ${cardClasses[draft.authorised] || cardClasses.Pending}`}
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
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusBadgeClasses[draft.authorised] || statusBadgeClasses.Pending}`}
                                >
                                  {draft.authorised}
                                </span>
                              </div>

                              {draft.authorised === "Pending" && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900">
                                  Pending requests stay pinned to the top of the month for faster review.
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
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Status
                                  </label>
                                  <select
                                    value={draft.authorised}
                                    onChange={(e) =>
                                      handleDraftChange(doc.$id, "authorised", e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                  >
                                    {statusOptions.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Decision notes
                                  </label>
                                  <textarea
                                    rows={5}
                                    value={draft.decision_notes}
                                    onChange={(e) =>
                                      handleDraftChange(
                                        doc.$id,
                                        "decision_notes",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Add a short note for the requester"
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                  />
                                  <p className="mt-2 text-xs text-slate-500">
                                    These notes are saved with the request and can be shown back to staff.
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4 text-slate-400" />
                                    Submitted for review
                                  </div>
                                  <p className="mt-2 text-slate-800">{formatDateTime(doc.absence_start)}</p>
                                </div>

                                <button
                                  onClick={() => handleDecisionSave(doc)}
                                  disabled={!hasChanges || savingId === doc.$id}
                                  className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  {savingId === doc.$id ? "Saving..." : "Save decision"}
                                </button>

                                <div className="grid gap-2 sm:grid-cols-2">
                                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    <div className="flex items-center gap-2 font-medium">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Authorise
                                    </div>
                                    <p className="mt-1 text-xs">
                                      Confirms the request and keeps the note on record.
                                    </p>
                                  </div>

                                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                                    <div className="flex items-center gap-2 font-medium">
                                      <XCircle className="h-4 w-4" />
                                      Reject
                                    </div>
                                    <p className="mt-1 text-xs">
                                      Marks the request rejected and preserves the explanation.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </aside>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAbsence;
